// Payment Gateway Configuration
const CONFIG = {
    // Paddle Configuration
    paddle: {
        clientToken: 'live_899cd8e0fe1a9b61ddf69b44c63', // From your .env
        environment: 'production' // Change to 'sandbox' for testing
    },

    // Projects Configuration
    projects: {
        articlemaster: {
            name: 'ArticleMaster',
            description: 'AI-powered article generation from YouTube videos',
            domain: 'articlealchemist.scolink.ink',
            successUrl: 'https://articlealchemist.scolink.ink/dashboard?payment=success',
            cancelUrl: 'https://articlealchemist.scolink.ink/dashboard?payment=cancelled',
            plans: {
                pro: {
                    name: 'Pro',
                    price: 8,
                    interval: 'month',
                    priceId: 'pri_01kcffekgxk4ds1y328p8v8z4b', // From your .env
                    features: [
                        '4 articles per week',
                        'Higher quality generation',
                        'Link & publish to WordPress'
                    ]
                },
                premium: {
                    name: 'Premium',
                    price: 12,
                    interval: 'month',
                    priceId: 'pri_01kcffktzd5tv1bjs486mxbnb3', // From your .env
                    features: [
                        '1 article per day',
                        'Best quality generation',
                        'Link & publish to WordPress',
                        'Customizable generation preferences'
                    ]
                }
            }
        },
        app: {
            name: 'Legacy App',
            description: 'Your previous application',
            domain: 'app.scolink.ink',
            successUrl: 'https://app.scolink.ink/dashboard?payment=success',
            cancelUrl: 'https://app.scolink.ink/dashboard?payment=cancelled',
            plans: {
                pro: {
                    name: 'Pro',
                    price: 8,
                    interval: 'month',
                    priceId: 'pri_01kcffekgxk4ds1y328p8v8z4b', // Using same pricing for now
                    features: [
                        'Pro features',
                        'Enhanced functionality',
                        'Priority support'
                    ]
                },
                premium: {
                    name: 'Premium',
                    price: 12,
                    interval: 'month',
                    priceId: 'pri_01kcffktzd5tv1bjs486mxbnb3', // Using same pricing for now
                    features: [
                        'All Pro features',
                        'Premium support',
                        'Advanced features'
                    ]
                }
            }
        }
    },

    // Payment Gateway Settings
    settings: {
        currency: 'USD',
        locale: 'en',
        theme: 'light',
        allowDiscountCodes: true,
        collectBillingAddress: false,
        enableQuantity: false
    }
};

// Helper functions
function getProjectConfig(projectId) {
    return CONFIG.projects[projectId];
}

function getPlanConfig(projectId, planId) {
    const project = CONFIG.projects[projectId];
    return project ? project.plans[planId] : null;
}

function getPaddleConfig() {
    return CONFIG.paddle;
}

function getSettings() {
    return CONFIG.settings;
}