const Invoice = require('../models/invoiceModel');
const InvoiceService = require('../services/invoiceService');
const { createPDF } = require('../services/pdfService');
const createError = require('../middleware/error');
const User = require('../models/userModel');
const Order = require('../models/orderModel')
// const { generateInvoicePDF } = require('../services/invoiceService');

exports.generateInvoice = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (order.invoiceNumber) {
            // If the invoice has already been generated, return it
            return res.status(200).json({ invoiceNumber: order.invoiceNumber });
        }

        // Logic to generate a new invoice
        const newInvoiceNumber = generateInvoiceNumber(); // This is your logic to generate an invoice number
        order.invoiceNumber = newInvoiceNumber;
        await order.save();

        res.status(200).json({ invoiceNumber: newInvoiceNumber });
    } catch (error) {
        console.error("error", error);
        res.status(500).json({ error: 'Error generating invoice' });
    }
};

let lastInvoiceNumber = 0;

function generateInvoiceNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Increment invoice number daily (you can reset it based on the date if needed)
    lastInvoiceNumber++;
    
    return `INV-${year}${month}${day}-${lastInvoiceNumber.toString().padStart(4, '0')}`;
}


// Fetch a single invoice by invoiceId
exports.getInvoice = async (req, res) => {
    try {
        // Find the invoice by id and populate related fields
        const invoice = await Invoice.findById(req.params.invoiceId).populate('order user products.product');

        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        res.json(invoice); // Return the invoice details
    } catch (error) {
        console.error("Error fetching invoice", error);
        res.status(500).json({ error: error.message });
    }
};

// Download invoice as PDF by invoiceNumber
exports.downloadInvoicePDF = async (req, res, next) => {
    try {
        // Find the invoice by its invoiceNumber
        const invoice = await Invoice.findOne({ invoiceNumber: req.params.invoiceNumber })
            .populate('order user products.product'); // Optionally populate related data

        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found!' });
        }

        // Generate the PDF using the invoice details
        const pdfBuffer = await InvoiceService.generateInvoicePDF(invoice);

        // Set headers for file download
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);
        res.setHeader('Content-Type', 'application/pdf');
        
        // Send the PDF buffer as the response
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error downloading invoice PDF:', error);
        return next(error);
    }
};

// Get all invoices (optionally with pagination)
exports.getAllInvoice = async (req, res, next) => {
    try {
        // Fetch all invoices from the database
        const invoices = await Invoice.find().populate('order user products.product'); // Optionally populate related fields

        // Return a successful response with the fetched invoices
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Invoices fetched successfully!",
            data: invoices
        });
    } catch (error) {
        console.error("Error fetching invoices", error);
        return next(createError(500, "Something went wrong while fetching invoices!"));
    }
};
