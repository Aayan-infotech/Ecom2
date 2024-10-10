const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    paymentStatus: { type: String, required: true }, // e.g., 'succeeded', 'failed'
    paymentId: { type: String, required: true }, // Stripe paymentIntent.id or PayPal payment.id
    amountPaid: { type: Number, required: true },
    currency: { type: String, required: true },
    transactionDetails: { type: Object }, // Store additional details if needed
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);
