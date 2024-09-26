const express = require('express');
const router = express.Router();
const { createPayment, refundPayment, getPayments } = require('../controllers/paymentController');

router.post('/create-payment-intent', createPayment);

// Route for getting all payments
router.get('/all', getPayments);

// Route for refunding a Stripe payment
router.post('/refund', refundPayment);

module.exports = router;
