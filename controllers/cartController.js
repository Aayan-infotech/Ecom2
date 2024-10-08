const Cart = require("../models/cartModel");
const createError = require("../middleware/error");
const Product = require("../models/productModel");

// add to cart
const addToCart = async (req, res, next) => {
    try {
        const { userId, productId, quantity } = req.body

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({ user: userId, products: [] });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return next(createError(404, "Product not found!"));
        }

        if (product.stock < quantity) {
            return next(createError(400, "Insufficient Stock!"));
        }
        const existingCartItem = cart.products.find(item => item.product.toString() === productId.toString());

        if (existingCartItem) {
            // if product is already in the cart then update the quantity
            existingCartItem.quantity += quantity;

        }
        else {
            // If product does not exist then add the product
            cart.products.push({ product: productId, quantity });
        }

        await cart.save();

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Product Added Successfully!",
            data: cart
        })
    }
    catch (error) {
        console.error('Error in adding to cart:', error);
        return next(createError(500, "Something went wrong!"))
    }
};

// remove from cart
const removeFromCart = async (req, res, next) => {
    try {
        const { userId, productId } = req.body;

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return next(createError(404, "No Cart Found!"));
        }

        cart.products = cart.products.filter(p => p.product.toString() !== productId);

        await cart.save();

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Product removed from cart Successfully!",
            data: cart
        });
    }
    catch (error) {
        return next(createError(500, "Something went wrong!"));
    }
};

// get cart details
const getCart = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const cart = await Cart.findOne({ user: userId }).populate('products.product');

        if (!cart) {
            return next(createError(404, "Cart not found!"));
        }

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Cart fetched successfully!",
            data: cart
        });
    }
    catch (error) {
        return next(createError(500, "Something went wrong!"));
    }
};

// to increase quantity
const increaseQuantity = async(req, res, next) => {
    try{
        const { userId, productId } = req.body

        const cart = await Cart.findOne({user: userId});
        if(!cart){
            return next(createError(404, "Cart not found!"));
        }

        // find the item in the cart to update
        const cartItem = cart.products.find(item => item.product.toString() === productId.toString());

        if(!cartItem){
           return next(createError(404, "Product not found in cart!"));            
        }

        const product = await Product.findById(productId);
        if (!product) {
            return next(createError(404, "Product not found!"));
        }


        if(product.stock < (cartItem.quantity + 1)){
            return next(createError(400, "Not enough stock available!"));
        }

        cartItem.quantity += 1;

        await cart.save();

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Quantity updated by 1 successully!",
            data: cart
        })

    }
    catch(error){
        return next(createError(500, "Something went wrong!"))
    }
};


// to descrease quantity
const decreaseQuantity = async(req, res, next) => {
    try{
        const { userId, productId } = req.body

        const cart = await Cart.findOne({user: userId});
        if(!cart){
            return next(createError(404, "Cart not found!"));
        }

        // find the item in the cart to update
        const cartItem = cart.products.find(item => item.product.toString() === productId.toString());

        if(!cartItem){
           return next(createError(404, "Product not found in cart!"));            
        }

        const product = await Product.findById(productId);
        if (!product) {
            return next(createError(404, "Product not found!"));
        }


        if(product.stock == 0){
            return next(createError(400, "Not enough stock available!"));
        }

        if(cartItem.quantity > 1){
            cartItem.quantity -= 1;
        }

        await cart.save();

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Quantity decreased by 1 successully!",
            data: cart
        })

    }
    catch(error){
        return next(createError(500, "Something went wrong!"))
    }
};

// to update the quantity as it is
const updateQuantity = async(req, res, next) => {
    try{
        const { id } = req.params;
        const { productId, quantity } = req.body;
        
        const cart = await Cart.findByIdAndUpdate(id);

        if(!cart){
            return next(createError(404, "Cart Not Found!"));
        }

        // find product in the cart and then update its quantity
        const productInCart = cart.products.find(item => item.product.toString() === productId);

        if(!productInCart){
            return next(createError(404, "Product doesn't exist!"));
        }

        productInCart.quantity = quantity

        // saving the changes in the cart
        await cart.save();

        return res.status(200).json({
            success: true,
            status: 200,
            message: "The cart is updated!",
            data: cart
        });

    }
    catch(error){
        console.error("Error updating the quantity", error);
        return next(createError(500, "Something went wrong!"));
    }
}

module.exports = {
    addToCart,
    removeFromCart,
    getCart,
    increaseQuantity,
    decreaseQuantity,
    updateQuantity
}