const Stripe = require('stripe');
const stripe = Stripe('sk_test_51PqTR903ec58RCFWb7qYStr1sxR9wKpUWfu4hq1MFhfMRVidxNBoO3aCYWAOJmkpN5lKTBE2RRMB2pSU574ame9F00Vr3gCarb'); // Replace with your Stripe Secret Key

exports.createPaymentIntent = async (req, res) => {
    const { amount, currency } = req.body;

    try {
        // Create a PaymentIntent with the provided amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Stripe accepts amount in cents
            currency: currency,
        });

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error('Error creating PaymentIntent:', error);
        res.status(500).json({ error: 'Failed to create payment' });
    }
};
