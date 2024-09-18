const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const { createPaymentWithSumUp, refundPaymentWithSumUp } = require('./../services/sumUpServices');
const { createPaymentRequest, refundPaymentWithSwish } = require('./../services/swishService'); // Import the Swish refund function

// Create Payment
exports.createPayment = async (req, res) => {
    const { provider, amount, currency } = req.body;

    try {
        let paymentResponse;

        // Choose the provider dynamically based on the user's choice
        if (provider === 'stripe') {
            paymentResponse = await createStripePayment(amount, currency);
        } else if (provider === 'sumup') {
            paymentResponse = await createPaymentWithSumUp(amount, currency);
        } else if (provider === 'swish') {
            paymentResponse = await createPaymentRequest(amount, currency);
        } else {
            return res.status(400).json({ error: 'Unsupported payment provider' });
        }

        res.status(200).json(paymentResponse);
    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({ error: 'Payment failed' });
    }
};

// Refund Payment
exports.refundPayment = async (req, res) => {
    const { provider, paymentIntentId, amount } = req.body;

    try {
        let refundResponse;

        // Refund based on the provider
        if (provider === 'stripe') {
            refundResponse = await refundStripePayment(paymentIntentId, amount);
        } else if (provider === 'sumup') {
            refundResponse = await refundPaymentWithSumUp(paymentIntentId, amount);
        } else if (provider === 'swish') {
            refundResponse = await refundPaymentWithSwish(paymentIntentId, amount);
        } else {
            return res.status(400).json({ error: 'Unsupported payment provider for refund' });
        }

        res.status(200).json(refundResponse);
    } catch (error) {
        console.error('Refund error:', error);
        res.status(500).json({ error: 'Refund failed' });
    }
};

// Stripe Payment Logic
const createStripePayment = async (amount, currency) => {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency: currency,
    });

    return {
        success: true,
        clientSecret: paymentIntent.client_secret,
    };
};

// Stripe Refund Logic
const refundStripePayment = async (paymentIntentId, amount) => {
    const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? amount * 100 : undefined, // Optional: specify amount for partial refunds
    });

    return {
        success: true,
        refundId: refund.id,
        status: refund.status,
    };
};
