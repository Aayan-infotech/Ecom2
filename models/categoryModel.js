const mongoose = require('mongoose');
const productCategorySchema = mongoose.Schema({
    title:{
        type: String,
        required: false,
        unique: true
    },
    image: {
        type: String
    }
    
},
{
    timestamps: true
}

);

module.exports = mongoose.model('Category', productCategorySchema)