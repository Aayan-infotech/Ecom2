const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const deliverySlotSchema = new Schema({
    deliveryType: {
        type: String,
        enum: ['Morning Delivery', 'Express Delivery I', 'Express Delivery II', 'Fixed Time Delivery', 'Pre-Midnight Delivery', 'Free Delivery'],
        required: true,  
    },
    date: {
        type: Date,
        required: true,
    },
    timePeriod: {
        type: String,
        required: true 
    },
    deliveryCharge: {
        type: Number,
        required: true
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('DeliverySlot', deliverySlotSchema);
