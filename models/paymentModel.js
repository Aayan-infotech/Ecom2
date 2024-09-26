// models/Payment.js

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    provider: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: { type: String, default: 'pending' }, // e.g., pending, completed
    date: { type: Date, default: Date.now },
    // Add other relevant fields as needed
});

module.exports = mongoose.model('Payment', paymentSchema);
