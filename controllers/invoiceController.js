const Invoice = require('../models/invoiceModel');
const InvoiceService = require('../services/invoiceService');
const { createPDF } = require('../services/pdfService');
const createError = require('../middleware/error');
const User = require('../models/userModel')
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
        res.status(500).json({ error: 'Error generating invoice' });
    }
};


exports.getInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.invoiceId).populate('order user products.product');
        console.log("user", customer);
        
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.downloadInvoicePDF = async (req, res, next) => {
    try {
        const invoice = await Invoice.findOne({invoiceNumber: req.params.invoiceNumber});

        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found!' });
        }

        // Generate the PDF for the invoice
        const pdfBuffer = await InvoiceService.generateInvoicePDF(invoice);

        res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);
        res.setHeader('Content-Type', 'application/pdf');
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error downloading invoice PDF:', error);
        return next(error);
    }
};

exports.getAllInvoice = async(req, res, next) => {
    try{
        const invoices = await Invoice.find();

    return res.status(200).json({
        success: true,
        status: 200,
        message: "Invoice fetched successfully!",
        data: invoices
    });

    }
    catch(error){
        console.error("Error fetching invoice", error);
        return next(createError(500, "Something went wrong!"));
    }
};
