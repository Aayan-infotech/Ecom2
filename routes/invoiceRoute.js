const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

// Generate Invoice
router.post('/generate/:orderId', invoiceController.generateInvoice);

// Get Invoice by ID
router.get('/:invoiceId', invoiceController.getInvoice);

// Download Invoice PDF
router.get('/download/:invoiceNumber', invoiceController.downloadInvoicePDF);

// to get all the invoices
router.get('/get', invoiceController.getAllInvoice);

module.exports = router;
