const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    orderId: {
        type: String,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            name: String,
            price: Number,
            quantity: {
                type: Number,
                required: true
            }
        }
    ],
    expectedDeliveryDate: {
        type: Date,
        required: false
    },
    deliverySlot: {
        deliverySlotId:{type: Schema.Types.ObjectId},
       date:{type:String},
       timePeriod:{type:String}
    }
,
    totalAmount: {
        type: Number,
        required: true
    },
    voucher: {
        type: Schema.Types.ObjectId,
        ref: 'Voucher',
        required: false
    },
    voucherUsed: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['Pending', 'Cancelled', 'Approved', 'Declined', 'Shipped', 'Delivery Delayed', 'Delivered'],
        default: 'Pending'
    },
    trackingNumber: {
        type: String,
        required: false
    },
    address: {
        type: String,
        required: false
    },
    invoiceNumber: {
        type: String,
        required: false
    }
},
    {
        timestamps: true
    });

module.exports = mongoose.model('Order', orderSchema);
