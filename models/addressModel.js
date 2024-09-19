const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const addressSchema = new Schema({
    receiverName: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref:'User',
        required: true,
    },
    area: {
        type: String,
        required: true
    },
    houseNumber: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true
    },
    pinCode: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: false
    },
    contactNumber: {
        type: String,
        required: true
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('Address', addressSchema);