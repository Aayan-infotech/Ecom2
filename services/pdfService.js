const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const User = require('../models/userModel');

exports.createPDF = async (invoice) => {
    try {
        // Fetch customer data by their ID
        const customerData = await User.findById(invoice.customer._id);

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            let buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);

                // Save the PDF locally to check if it's generated correctly
                const filePath = path.join(__dirname, `invoice-${invoice.invoiceNumber}.pdf`);
                fs.writeFileSync(filePath, pdfData);

                resolve(pdfData);
            });

            doc.on('error', reject);

            // Add the logo to the left-most side at the top
            const logoPath = path.join(__dirname, 'eComm.png'); // Update this with the actual path to your logo
            doc.image(logoPath, 50, 45, { width: 100 });

            // Add the heading to the top right
            doc.font('Helvetica-Bold').fontSize(20).text('Invoice', 450, 50, { align: 'right' });
            doc.moveDown();

            // Add the user's address and ZIP code below the heading
            if (customerData) {
                doc.font('Helvetica').fontSize(10)
                    .text(`Customer: ${customerData.userName || 'N/A'}`, 450, 90, { align: 'right' })
                    .text(`Email: ${customerData.email || 'N/A'}`, { align: 'right' })
                    .text(`Mobile Number: ${customerData.mobileNumber || 'N/A'}`, { align: 'right' }); // Adjust if needed
            } else {
                console.log('User data is missing or undefined');
                doc.font('Helvetica').fontSize(10)
                    .text('Customer: N/A', 450, 90, { align: 'right' })
                    .text('Email: N/A', { align: 'right' })
                    .text('Mobile Number: N/A', { align: 'right' }); // Adjust if needed
            }

            doc.moveDown(2);

            // Invoice details
            doc.font('Helvetica-Bold').fontSize(10).text(`Invoice Number: ${invoice.invoiceNumber}`, 50, 150);
            doc.font('Helvetica').text(`Issue Date: ${invoice.issueDate}`);
            doc.text(`Due Date: ${invoice.dueDate}`);
            doc.text(`Status: ${invoice.status}`);
            doc.moveDown();

            // Table headers (bold)
            const startX = 50;
            const startY = 220;
            const rowHeight = 20;

            doc.font('Helvetica-Bold').fontSize(10);

            // Draw headers with borders
            doc.text('Serial No.', startX + 5, startY + 5);
            doc.text('Item Name', startX + 70, startY + 5);
            doc.text('Quantity', startX + 250, startY + 5);
            doc.text('Cost', startX + 350, startY + 5);

            // Draw border for the headers
            doc.lineWidth(0.5);
            doc.rect(startX, startY, 400, rowHeight).stroke();

            // Table content (regular font)
            doc.font('Helvetica');
            let yPosition = startY + rowHeight;

            invoice.products.forEach((p, index) => {
                doc.text(`${index + 1}`, startX + 5, yPosition + 5);
                doc.text(`${p.name}`, startX + 70, yPosition + 5);
                doc.text(`${p.quantity}`, startX + 250, yPosition + 5);
                doc.text(`$${p.total.toFixed(2)}`, startX + 350, yPosition + 5);

                // Draw border for each row
                doc.rect(startX, yPosition, 400, rowHeight).stroke();
                yPosition += rowHeight;
            });

            doc.moveDown(2);

            // Subtotal, tax, and total (bold)
            doc.font('Helvetica-Bold')
                .text(`Subtotal: $${invoice.subtotal.toFixed(2)}`, startX + 350, yPosition + 20, { align: 'right' })
                .text(`Tax: $${invoice.tax.toFixed(2)}`, { align: 'right' })
                .text(`Total: $${invoice.total.toFixed(2)}`, { align: 'right' });

            doc.end();
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
};
