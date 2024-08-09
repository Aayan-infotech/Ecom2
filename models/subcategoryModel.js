const mongoose = require('mongoose');
const Schema = mongoose.Schema
const productSubcategorySchema = mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    parentCategory: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    image: {
        type: String
    }
    
},
{
    timestamps: true
}

);

module.exports = mongoose.model('Subcategory', productSubcategorySchema)