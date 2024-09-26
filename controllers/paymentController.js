const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const { createPaymentWithSumUp, refundPaymentWithSumUp } = require('./../services/sumUpServices');
const { createPaymentRequest, refundPaymentWithSwish } = require('./../services/swishService'); // Import the Swish refund function
const Payment = require('../models/paymentModel'); // Import the Payment model

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

        // Prepare the payment object to save in the database
        const newPayment = new Payment({
            provider,
            amount,
            currency,
            status: paymentResponse.status || 'pending', // Use the status from the payment response or default to 'pending'
            date: new Date(), // You can also use paymentResponse.date if the provider returns it
        });

        // Save the payment in the database
        const savedPayment = await newPayment.save();

        // Send the saved payment details to the client
        res.status(200).json(savedPayment);
    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({ error: 'Payment failed' });
    }
};

// Create Payment
// exports.createPayment = async (req, res) => {
//     const { provider, amount, currency } = req.body;

//     try {
//         let paymentResponse;

//         // Choose the provider dynamically based on the user's choice
//         if (provider === 'stripe') {
//             paymentResponse = await createStripePayment(amount, currency);
//         } else if (provider === 'sumup') {
//             paymentResponse = await createPaymentWithSumUp(amount, currency);
//         } else if (provider === 'swish') {
//             paymentResponse = await createPaymentRequest(amount, currency);
//         } else {
//             return res.status(400).json({ error: 'Unsupported payment provider' });
//         }

//         res.status(200).json(paymentResponse);
//     } catch (error) {
//         console.error('Payment error:', error);
//         res.status(500).json({ error: 'Payment failed' });
//     }
// };

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


// In your payment controller file

// Get all payments

exports.getPayments = async (req, res) => {
    try {
        // Get page and limit from query parameters
        const page = parseInt(req.query.page) || 1;  // Default to page 1 if not provided
        const limit = parseInt(req.query.limit) || 10; // Default to 10 entries per page if not provided

        // Calculate the number of documents to skip
        const skip = (page - 1) * limit;

        // Fetch the payments with pagination
        const payments = await Payment.find()
            .skip(skip)
            .limit(limit)
            .sort({ date: -1 }); // Optionally sort by date (descending)

        // Get the total count of payments for pagination purposes
        const totalPayments = await Payment.countDocuments();

        // Send response with payments and pagination information
        res.status(200).json({
            payments,
            currentPage: page,
            totalPages: Math.ceil(totalPayments / limit),
            totalPayments,
        });
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ error: 'Error fetching payments' });
    }
};


// Get a specific payment by ID
exports.getPaymentById = async (req, res) => {
    const { id } = req.params;

    try {
        const payment = await Payment.findById(id); // Fetch specific payment by ID
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }
        res.status(200).json(payment);
    } catch (error) {
        console.error('Error fetching payment:', error);
        res.status(500).json({ error: 'Failed to retrieve payment' });
    }
};
