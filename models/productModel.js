const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String
    },
    subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategory',
        required: true
    },
    image: {
        type: String // URL to the product image
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    deliverySlot:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Delivery',
        required: true
    }],
    discount: {
        type: Number,
        required: false,
        default: 0
    }
},
{
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
