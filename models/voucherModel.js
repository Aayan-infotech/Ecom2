const mongoose = require("mongoose");
const Schema = mongoose.Schema

const voucherSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    discountValue: {
        type: Number,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true,
    },
    useLimit: {
        type: Number,
        required: false,
        default: 1
    },
    isActive: {
        type: Boolean,
        default: true,
    }
},
{
    timestamps: true,
});

module.exports = mongoose.model("Voucher", voucherSchema);