// Payment Gateway JavaScript
let currentProject = null;
let paddle = null;

// Initialize Paddle when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializePaddle();
    initializeEventListeners();
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

function initializeEventListeners() {
    // Project selection
    document.querySelectorAll('.project-card').forEach(card => {
        if (!card.classList.contains('coming-soon')) {
            card.addEventListener('click', function() {
                const projectId = this.dataset.project;
                selectProject(projectId);
            });
        }
    });

    // Handle URL parameters for direct linking
    handleUrlParameters();
}

function handleUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectParam = urlParams.get('project');
    const planParam = urlParams.get('plan');

    if (projectParam && getProjectConfig(projectParam)) {
        selectProject(projectParam);

        // If plan is also specified, automatically start checkout after a short delay
        if (planParam && getPlanConfig(projectParam, planParam)) {
            setTimeout(() => {
                startCheckout(planParam);
            }, 1000);
        }
    }
}

function selectProject(projectId) {
    currentProject = projectId;
    const projectConfig = getProjectConfig(projectId);

    if (!projectConfig) {
        alert('Project configuration not found');
        return;
    }

    // Hide project selection, show plan selection
    document.querySelector('.project-selection').style.display = 'none';
    document.getElementById('planSelection').style.display = 'block';

    // Update plan title
    document.getElementById('planTitle').textContent = `Choose Your ${projectConfig.name} Plan`;

    // Render plans
    renderPlans(projectId);
}

function showProjectSelection() {
    document.getElementById('planSelection').style.display = 'none';
    document.querySelector('.project-selection').style.display = 'block';
    currentProject = null;
}

function renderPlans(projectId) {
    const projectConfig = getProjectConfig(projectId);
    const planGrid = document.getElementById('planGrid');

    planGrid.innerHTML = '';

    Object.entries(projectConfig.plans).forEach(([planId, plan]) => {
        const planCard = createPlanCard(planId, plan);
        planGrid.appendChild(planCard);
    });
}

function createPlanCard(planId, plan) {
    const card = document.createElement('div');
    card.className = 'plan-card';
    card.onclick = () => startCheckout(planId);

    card.innerHTML = `
        <div class="plan-header">
            <h3>${plan.name}</h3>
            <div class="plan-price">
                <span class="amount">$${plan.price}</span>
                <span class="interval">/${plan.interval}</span>
            </div>
        </div>
        <div class="plan-features">
            <ul>
                ${plan.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
        </div>
        <button class="select-plan-btn" data-plan="${planId}">
            Subscribe to ${plan.name}
        </button>
    `;

    return card;
}

async function startCheckout(planId) {
    if (!currentProject) {
        alert('Please select a project first');
        return;
    }

    const projectConfig = getProjectConfig(currentProject);
    const planConfig = getPlanConfig(currentProject, planId);

    if (!planConfig) {
        alert('Plan configuration not found');
        return;
    }

    // Show payment status
    document.getElementById('planSelection').style.display = 'none';
    document.getElementById('paymentStatus').style.display = 'block';

    try {
        // Get user email (you might want to add a form for this)
        const customerEmail = prompt('Please enter your email address:');
        if (!customerEmail) {
            throw new Error('Email is required');
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
        alert('Failed to start checkout: ' + error.message);
        document.getElementById('paymentStatus').style.display = 'none';
        document.getElementById('planSelection').style.display = 'block';
    }
}

function handlePaymentSuccess(event) {
    console.log('Payment successful:', event);
    document.getElementById('paymentStatus').style.display = 'none';

    // Show success message
    alert('Payment successful! You will be redirected shortly.');

    // Redirect to success URL
    const projectConfig = getProjectConfig(currentProject);
    if (projectConfig && projectConfig.successUrl) {
        window.location.href = projectConfig.successUrl;
    }
}

function handlePaymentClosed() {
    console.log('Payment closed');
    document.getElementById('paymentStatus').style.display = 'none';
    document.getElementById('planSelection').style.display = 'block';
}

// Modal functions
function showRefundPolicy() {
    document.getElementById('refundModal').style.display = 'block';
}

function showTerms() {
    document.getElementById('termsModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const refundModal = document.getElementById('refundModal');
    const termsModal = document.getElementById('termsModal');

    if (event.target === refundModal) {
        refundModal.style.display = 'none';
    }
    if (event.target === termsModal) {
        termsModal.style.display = 'none';
    }
}