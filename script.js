// Payment Gateway JavaScript - Minimal Version for Popup Payments
let currentProject = null;
let currentPlan = null;
let paddle = null;

// Initialize Paddle when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializePaddle();
    handleUrlParameters();
});

function initializePaddle() {
    const paddleConfig = getPaddleConfig();
    const settings = getSettings();

    Paddle.Environment.set(paddleConfig.environment);
    Paddle.Initialize({
        token: paddleConfig.clientToken,
        checkout: {
            settings: {
                theme: settings.theme,
                locale: settings.locale,
                allowDiscountCodes: settings.allowDiscountCodes,
                showAddDiscounts: settings.allowDiscountCodes
            }
        },
        eventCallback: function(event) {
            console.log('Paddle Event:', event);

            if (event.name === 'checkout.completed') {
                handlePaymentSuccess(event);
            } else if (event.name === 'checkout.closed') {
                handlePaymentClosed();
            }
        }
    });
}

function handleUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectParam = urlParams.get('project');
    const planParam = urlParams.get('plan');

    if (projectParam && getProjectConfig(projectParam)) {
        currentProject = projectParam;

        if (planParam && getPlanConfig(projectParam, planParam)) {
            currentPlan = planParam;
            // Auto-start checkout
            startCheckout(planParam);
        } else {
            // Show project info and ask for plan selection
            showProjectInfo(projectParam);
        }
    } else {
        // No valid parameters - show error
        showError('Invalid payment link. Please check your URL and try again.');
    }
}

function showProjectInfo(projectId) {
    const projectConfig = getProjectConfig(projectId);
    document.getElementById('statusTitle').textContent = `Select a Plan for ${projectConfig.name}`;
    document.getElementById('statusMessage').innerHTML = `
        Please specify a plan in your URL:<br>
        <code>?project=${projectId}&plan=pro</code> or <code>?project=${projectId}&plan=premium</code>
    `;
    document.getElementById('paymentContent').style.display = 'block';
    document.getElementById('spinner').style.display = 'none';
}

function showError(message) {
    document.getElementById('statusTitle').textContent = 'Payment Error';
    document.getElementById('statusMessage').textContent = message;
    document.getElementById('paymentContent').style.display = 'block';
    document.getElementById('spinner').style.display = 'none';
}

async function startCheckout(planId) {
    const projectConfig = getProjectConfig(currentProject);
    const planConfig = getPlanConfig(currentProject, planId);

    if (!projectConfig || !planConfig) {
        showError('Invalid project or plan configuration');
        return;
    }

    // Show processing status
    document.getElementById('statusTitle').textContent = 'Processing Payment...';
    document.getElementById('statusMessage').textContent = 'Opening secure payment popup...';
    document.getElementById('paymentContent').style.display = 'block';

    try {
        // Get user email
        const customerEmail = prompt('Please enter your email address to proceed with payment:');
        if (!customerEmail || !customerEmail.includes('@')) {
            throw new Error('A valid email address is required');
        }

        // Create checkout
        const checkout = await Paddle.Checkout.open({
            items: [{
                priceId: planConfig.priceId,
                quantity: 1
            }],
            customer: {
                email: customerEmail
            },
            customData: {
                projectId: currentProject,
                planId: planId,
                userEmail: customerEmail
            },
            settings: {
                successUrl: projectConfig.successUrl,
                cancelUrl: projectConfig.cancelUrl,
                theme: getSettings().theme,
                locale: getSettings().locale
            }
        });

    } catch (error) {
        console.error('Checkout error:', error);
        showError('Failed to start checkout: ' + error.message);
    }
}

function handlePaymentSuccess(event) {
    console.log('Payment successful:', event);
    document.getElementById('statusTitle').textContent = 'Payment Successful!';
    document.getElementById('statusMessage').textContent = 'Redirecting you back to the application...';
    document.getElementById('spinner').style.display = 'none';

    // Redirect to success URL after a short delay
    const projectConfig = getProjectConfig(currentProject);
    if (projectConfig && projectConfig.successUrl) {
        setTimeout(() => {
            window.location.href = projectConfig.successUrl;
        }, 2000);
    }
}

function handlePaymentClosed() {
    console.log('Payment closed');
    document.getElementById('statusTitle').textContent = 'Payment Cancelled';
    document.getElementById('statusMessage').innerHTML = `
        Payment was cancelled. <a href="/" class="back-link">Return to homepage</a>
    `;
    document.getElementById('spinner').style.display = 'none';
}
