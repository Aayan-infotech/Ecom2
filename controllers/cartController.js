const Cart = require("../models/cartModel");
const createError = require("../middleware/error");
const Product = require("../models/productModel");
const jwt = require('jsonwebtoken');

const getCart = async (req, res, next) => {
    try {
        let userId;

        // Extract the token from cookies
        const token = req.headers['authorization']?.split(' ')[1];

        if (token) {
            // Verify the token if it's available
            const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';
            const decoded = jwt.verify(token, jwtSecret);
            // console.log("decoded", decoded);
            
            userId = decoded.id; // Get the user ID from the token
        } else if (req.body.userId || req.params.userId) {
            // Fallback to using userId from request body or params if token is not present
            userId = req.body.userId || req.params.userId;
        } else {
            // If neither token nor userId is available, return an error
            return next(createError(401, "Access token or userId is missing!"));
        }

        // Fetch the cart for the user ID
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
    } catch (error) {
        // Handle token errors or other unexpected issues
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return next(createError(401, "Invalid or expired token!"));
        }
        return next(createError(500, "Something went wrong!"));
    }
};



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
        let userId;

        // Check if authorization header with a Bearer token is provided
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            const token = req.headers.authorization.split(' ')[1];

            if (!token) {
                return next(createError(401, "Access Denied! No token provided."));
            }

            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userId = decoded.id;  // Assuming the token contains the user ID as 'id'
        } else if (req.body.userId) {
            // Fallback to userId from the request body if no token is provided
            userId = req.body.userId;
        } else {
            return next(createError(400, "User ID is required either in the token or request body."));
        }

        const { productId } = req.params;

        // Find the cart for the authenticated user
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return next(createError(404, "No Cart Found!"));
        }

        // Remove the product from the cart
        cart.products = cart.products.filter(p => p.product.toString() !== productId);

        // Save the updated cart
        await cart.save();

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Product removed from cart successfully!"
        });
    }
    catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return next(createError(401, "Invalid or Expired Token!"));
        }
        return next(createError(500, "Something went wrong!"));
    }
};



// get cart details
// const getCart = async (req, res, next) => {
//     try {
//         const { userId } = req.params;

//         const cart = await Cart.findOne({ user: userId }).populate('products.product');

//         if (!cart) {
//             return next(createError(404, "Cart not found!"));
//         }

//         return res.status(200).json({
//             success: true,
//             status: 200,
//             message: "Cart fetched successfully!",
//             data: cart
//         });
//     }
//     catch (error) {
//         return next(createError(500, "Something went wrong!"));
//     }
// };

const changeQuantity = async(req, res, next) => {
    try {
        const { userId, productId, operation } = req.body; // operation: 'increase' or 'decrease'

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return next(createError(404, "Cart not found!"));
        }

        // Find the item in the cart
        const cartItem = cart.products.find(item => item.product.toString() === productId.toString());
        if (!cartItem) {
            return next(createError(404, "Product not found in cart!"));
        }

        const product = await Product.findById(productId);
        if (!product) {
            return next(createError(404, "Product not found!"));
        }

        // Increase quantity operation
        if (operation === 'increase') {
            if (product.stock < (cartItem.quantity + 1)) {
                return next(createError(400, "Not enough stock available!"));
            }
            cartItem.quantity += 1;
        }

        // Decrease quantity operation
        else if (operation === 'decrease') {
            if (cartItem.quantity > 1) {
                cartItem.quantity -= 1;
            } else {
                return next(createError(400, "Quantity cannot be decreased further!"));
            }
        } else {
            return next(createError(400, "Invalid operation!"));
        }

        // Save the updated cart
        await cart.save();

        return res.status(200).json({
            success: true,
            status: 200,
            message: `Quantity ${operation}d successfully!`,
            data: cart
        });
    } catch (error) {
        console.log("error", error);
        return next(createError(500, "Something went wrong!"));
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

const getProductFromCart = async (req, res, next) => {
    try {
        let userId;

        // Extract the token from the request headers
        const token = req.headers['authorization']?.split(' ')[1];

        if (token) {
            // Verify the token
            const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';
            const decoded = jwt.verify(token, jwtSecret);
            
            // Extract the user ID from the token
            userId = decoded.id;
        } else if (req.body.userId || req.params.userId) {
            // Fallback: use userId from body or params if token is not present
            userId = req.body.userId || req.params.userId;
        } else {
            // Return error if both token and userId are missing
            return next(createError(401, "Access token or userId is missing!"));
        }

        // Fetch the user's cart
        const cart = await Cart.findOne({ user: userId }).populate('products.product');

        if (!cart) {
            return next(createError(404, "Cart not found!"));
        }

        // Find the specific product in the cart
        const { productId } = req.params;
        const cartItem = cart.products.find(item => item.product._id.toString() === productId);

        if (!cartItem) {
            return next(createError(404, "Product not found in cart!"));
        }

        // Return the product data
        return res.status(200).json({
            success: true,
            message: "Product fetched successfully!",
            data: cartItem
        });
    } catch (error) {
        // Handle token verification or other errors
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return next(createError(401, "Invalid or expired token!"));
        }
        return next(createError(500, "Something went wrong!"));
    }
};

module.exports = {
    addToCart,
    removeFromCart,
    getCart,
    changeQuantity,
    updateQuantity,
    increaseQuantity,
    decreaseQuantity,
    getProductFromCart
}