const Invoice = require('../models/invoiceModel');
const Order = require('../models/orderModel');
const { createPDF } = require('../services/pdfService');

exports.createInvoice = async (orderId) => {
    const order = await Order.findById(orderId).populate('user').populate('items.product');
    
    if (!order) {
        throw new Error('Order not found');
    }

    const products = order.items.map(item => {
        const total = item.price * item.quantity; // Calculate the total for each product
        return {
            product: item.product._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total
        };
    });

    const tax = order.totalAmount * 0.1; // Assuming a 10% tax rate
    const total = order.totalAmount;
    console.log("USER", order.user);
    
    const invoice = new Invoice({
        invoiceNumber: `INV-${Date.now()}`,
        order: order._id,
        customer: order.user,
        products,
        subtotal: order.totalAmount - tax,
        tax,
        total,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
    });

    
    

    await invoice.save();
    console.log("invoice", invoice);

    return invoice;
};

exports.generateInvoicePDF = async (invoice) => {
    console.log(invoice.customer);
    
    // if (!invoice || !invoice.user || !invoice.user.userName || !invoice.user.email) {
    //     throw new Error('Invalid invoice data');
    // }
    console.log("pdf data", invoice);
    return createPDF(invoice);
};
