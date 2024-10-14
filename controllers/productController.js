const Product = require("../models/productModel");
const Voucher = require("../models/voucherModel");
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const users = require("../models/userModel");
const createError = require("../middleware/error");
const { v4: uuidv4 } = require('uuid');
const validator = require('validator');
const nodemailer = require('nodemailer');
const Delivery = require('../models/deliverySlotModel')
const { createNotification } = require('../services/notificationService');
const Address = require('../models/addressModel')
const { notification } = require('../controllers/notification');
const Stripe = require('stripe');
const paypal = require('paypal-rest-sdk');
const Payment = require('../models/paymentModel');
const axios = require('axios');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Configure PayPal
paypal.configure({
    'mode': process.env.PAYPAL_MODE, // 'sandbox' or 'live'
    'client_id': process.env.PAYPAL_CLIENT_ID,
    'client_secret': process.env.PAYPAL_CLIENT_SECRET
});


// add product
const addProduct = async (req, res, next) => {
    try {
        const { name, price, description, subcategory, stock, image, discount, category, isHighlight } = req.body;

        // Validate product fields
        if (!name || !description || !subcategory || !price || !stock || !category) {
            return next(createError(400, "All product fields are required!"));
        }

        // Check for duplicate product
        const existingProduct = await Product.findOne({ name });
        if (existingProduct) {
            return next(createError(400, "Product with this title already exists!"));
        }

        // Create new product
        const newProduct = new Product({
            name,
            description,
            subcategory,
            category,
            price,
            stock,
            image,
            discount,
            isHighlight
        });

        await newProduct.save();

        return res.status(201).json({
            success: true,
            status: 201,
            message: "Product added successfully!",
            data: newProduct
        });
    } catch (error) {
        console.error('Error adding product:', error);
        return next(createError(500, "Something went wrong!"));
    }
};


// get Products
const getAllProduct = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;  // Default to page 1 if not provided
        const limit = parseInt(req.query.limit) || 10;  // Default limit is 10 products per page
        const skip = (page - 1) * limit;  // Calculate the number of products to skip

        // Fetching products with pagination
        const products = await Product.find()
            .populate('subcategory', 'title')
            .populate('category', 'title')
            .skip(skip)  // Skip products for pagination
            .limit(limit);  // Limit the number of products returned

        // Count total products for calculating total pages
        const totalProducts = await Product.countDocuments();

        return res.status(200).json({
            success: true,
            status: 200,
            message: "All Products received Successfully!",
            data: products,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalProducts / limit),
                totalProducts,
                limit
            }
        });
    }
    catch (error) {
        return next(createError(500, "Something went wrong!"));
    }
};


// get products having discount
const getAllProductDiscount = async (req, res, next) => {
    try {
        // Find products where discount is greater than 0
        const products = await Product.find({ discount: { $gt: 0 } });

        return res.status(200).json({
            success: true,
            status: 200,
            message: "All Products with discount greater than 0 received successfully!",
            data: products
        });
    }
    catch (error) {
        return next(createError(500, "Something went wrong!"));
    }
};


// get product by id
const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params

        const product = await Product.findById(id);

        if (!product) {
            return next(createError(404, "Product not found!"));
        }



        return res.status(200).json({
            success: true,
            status: 200,
            message: "Product Received Successfully!",
            data: product
        });
    }
    catch (error) {
        return next(createError(500, "Something went wrong!"));
    }
};

// get products by subcategory id
const getProductsBySubcategoryId = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return next(createError(400, "Subcategory ID is required!"));
        }

        const products = await Product.find({ subcategory: id });

        if (!products.length) {
            return next(createError(404, "No products found for this subcategory!"));
        }

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Products Received Successfully!",
            data: products
        });
    } catch (error) {
        console.error('Error fetching products by subcategory:', error);
        return next(createError(500, "Something went wrong!"));
    }
};

// fetch product by category
const getProductByCategoryId = async (req, res, next) => {
    try {
        const { categoryId } = req.params;

        if (!categoryId) {
            return next(createError(400, "Enter the category id!"));
        }

        const products = await Product.find({ category: categoryId });

        // if(products.length === 0){
        //     return next(createError(404, "Products does not exist!"));
        // }

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Products fetched by category!",
            data: products
        });
    }
    catch (error) {
        console.error("Error fetching the category", error);
        return next(createError(500, "Something went wrong!"));
    }
};

// delete product
const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params
        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return next(createError(400, "Product Not Found!"));
        }

        return res.status(200).json({
            success: true,
            status: 200,
            message: "User Deleted Successfully!"
        });
    }
    catch (error) {
        return next(createError(500, "Something went wrong!"));
    }
};

const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, price, description, subcategory, image, stock, category, isHighlight } = req.body;

        if (!name || !price || !subcategory || !stock) {
            return next(createError(400, "Name, Price, Subcategory and stock are required!"));
        }

        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return next(createError(404, "Product Not Found!"));
        }

        // Update the product fields
        existingProduct.name = name;
        existingProduct.price = price;
        existingProduct.description = description;
        existingProduct.subcategory = subcategory;
        existingProduct.image = image;
        existingProduct.stock = stock;
        existingProduct.category = category;
        existingProduct.isHighlight = isHighlight;


        // Save the updated product
        await existingProduct.save();

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Product Updated Successfully!",
            data: existingProduct
        });
    } catch (error) {
        return next(createError(500, "Something went wrong!"));
    }
};

// search for products
const searchProduct = async (req, res, next) => {
    try {
        const { name } = req.body;

        const products = await Product.find({
            name: { $regex: `(${name})`, $options: 'i' }
        });

        if (products.length === 0) {
            return next(createError(404, "No products found with the specified name!"));
        }

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Products retrieved successfully!",
            data: products
        })
    }
    catch (error) {
        return next(createError(500, "Something went wrong!"));
    }
};

// create order of the product
// const createOrder = async (req, res, next) => {
//     try {
//         const { userId, voucherCode } = req.body

//         const cart = await Cart.findOne({ user: userId })
//         if (!cart) {
//             return next(createError(404, "Cart not found!"));
//         }

//         if (!cart.products.length) {
//             return next(createError(400, "No order placed!"))
//         }
//         let totalAmount = 0;
//         let orderItems = [];
//         for (const item of cart.products) {
//             const id = item.product;
//             const product = await Product.findById(id);
//             if (!product) {
//                 return next(createError(404, "Product not found!"));
//             }

//             if (product.stock < item.quantity) {
//                 return next(createError(400, `Not enough stock for ${product.name}`));
//             }

//             totalAmount += product.price * item.quantity;
//             orderItems.push({
//                 product: product._id,
//                 name: product.name,
//                 price: product.price,
//                 quantity: item.quantity
//             });
//         }

//         // apply voucher if provided
//         let voucher;
//         let voucherUsed;
//         if (voucherCode) {
//             voucher = await Voucher.findOne({ code: voucherCode, isActive: true });

//             if (!voucher || voucher.useLimit == 0) {
//                 return next(createError(404, "Voucher not found or inactive!"));
//             }

//             if (new Date() > new Date(voucher.expiryDate)) {
//                 return next(createError(400, "Voucher is expired!"));
//             }

//             totalAmount -= voucher.discountValue;

//             if (totalAmount < 0) totalAmount = 0;

//             voucher.useLimit -=1;
//             voucherUsed = true;

//             voucher.isActive = voucher.useLimit > 0;

//             await voucher.save();
//         }

//         // stock mainatain
//         // Update stock and clear cart
//         for (const item of cart.products) {
//             const id = item.product._id;
//             const product = await Product.findById(id);
//             product.stock -= item.quantity;
//             await product.save();
//         }

//         // Optionally clear the cart
//         cart.products = [];
//         await cart.save();

//         // Get the current year and month
//         const currentDate = new Date();
//         const currentYear = new Date().getFullYear();
//         const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
//         const currentDay = currentDate.getDate().toString().padStart(2, '0');

//         // Generate a random order ID trimmed to 6-7 characters
//         const randomOrderId = uuidv4().slice(0, 7);

//         // Combine year, month, and random order ID
//         const orderId = `${currentYear}-${randomOrderId}-${currentMonth}-${currentDay}`;

//         // Calculate delivery date (3-4 days from current date)
//         const deliveryDays = Math.floor(Math.random() * 2) + 3; // Randomly choose between 3 and 4 days
//         const deliveryDate = new Date(currentDate);
//         deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);


//         // Sends a mail when the order is placed
//         // Fetch user details
//         const user = await users.findById(userId);

//         // Prepare email content
//         const subject = `Your order has been placed!`;
//         const text = `Dear ${user.userName},\n\nYour order has been placed successfully!\n\nThank you for shopping with us.\n\nBest regards,\nMD Sweden`;

//         // Send email notification
//         await sendEmail(user.email, subject, text);

//         // create order
//         const newOrder = new Order({
//             user: userId,
//             items: orderItems,
//             totalAmount,
//             voucher: voucher ? voucher._id : undefined,
//             voucherUsed: voucherUsed,
//             orderId: orderId, // Generate a random order ID
//             expectedDeliveryDate: deliveryDate
//         });
//         await newOrder.save();

//         return res.status(201).json({
//             success: true,
//             status: 201,
//             message: "Order created successfully!",
//             data: newOrder
//         });
//     }
//     catch (error) {
//         return next(createError(500, "Something went wrong!"));
//     }
// };

// to get the order summary
const orderSummary = async (req, res, next) => {
    try {
        const { userId, voucherCode, deliverySlotId, addressId } = req.body;

        // Validate the address by addressId
        const address = await Address.findById(addressId);

        // Check if the address exists and if the user ID matches
        if (!address || address.user.toString() !== userId) {
            return next(createError(400, "Invalid address!"));
        }

        // Fetch the cart for the user
        const cart = await findCart(userId);
        if (!cart) return next(createError(404, "Cart not found!"));

        // If no products in the cart, return an error
        if (!cart.products.length) return next(createError(400, "No items in the cart!"));

        // Calculate total amount and order items
        // const { totalAmount, orderItems } = await calculateTotalAndItems(cart);
        // Calculate total amount and order items, including discounts on each item
        const { totalAmount, orderItems, totalDiscount } = await calculateTotalAndItemsWithDiscount(cart);

        console.log("cart", cart);
        

        // Calculate the delivery charge dynamically
        const deliveryCharge = await calculateDeliveryCharge(deliverySlotId);

        // Apply voucher and calculate final amount
        const { finalAmount, voucher, voucherUsed } = await applyVoucher(voucherCode, totalAmount);

        // Add delivery charge to the final amount
        const totalWithDelivery = finalAmount + deliveryCharge;

        // Fetch the delivery slot details
        const deliverySlotDoc = await Delivery.findById(deliverySlotId);
        if (!deliverySlotDoc) return next(createError(404, "Delivery slot not found!"));

        // Extract and format date and time from the delivery slot
        const { date, timePeriod } = deliverySlotDoc;
        const trimmedDate = new Date(date).toISOString().split('T')[0]; // Format date to YYYY-MM-DD
        const trimmedTime = timePeriod.trim(); // Trim any whitespace from time period

        // Create the delivery slot summary
        const deliverySlot = {
            deliverySlotId,
            date: trimmedDate,
            timePeriod: trimmedTime
        };

        // Return the order summary data (without saving it)
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Order summary fetched successfully!",
            data: {
                userId,
                orderItems,
                totalAmount,
                totalDiscount, // Include total discount
                voucher,
                voucherUsed,
                finalAmount,
                deliveryCharge,
                totalWithDelivery,
                deliverySlot,
                address
            }
        });
    } catch (error) {
        console.error('Error fetching order summary:', error);
        return next(createError(500, "Something went wrong!"));
    }
};

const calculateTotalAndItemsWithDiscount = async (cart) => {
    let totalAmount = 0;
    let totalDiscount = 0;
    const orderItems = [];

    // Get product IDs from the cart
    const productIds = cart.products.map(item => item.product);

    // Fetch products from the Product collection using their IDs
    const products = await Product.find({ _id: { $in: productIds } });

    // Map products to cart items and calculate prices and discounts
    cart.products.forEach(item => {
        const product = products.find(p => p._id.toString() === item.product.toString());

        if (product) {
            const price = product.price;
            const discount = product.discount || 0; // Assuming a 'discount' field exists in the Product model
            const finalPrice = price - discount;
            const quantity = item.quantity;
            const totalProductPrice = finalPrice * quantity;

            // Calculate total amounts
            totalAmount += totalProductPrice;
            totalDiscount += discount * quantity;

            // Add item to order summary
            orderItems.push({
                productId: product._id,
                name: product.name,
                price,
                discount,
                finalPrice,
                quantity,
                totalProductPrice
            });
        }
    });

    return { totalAmount, orderItems, totalDiscount };
};

// to buy a product
const buyNow = async (req, res, next) => {
    try {
        const { userId, voucherCode, deliverySlotId, addressId, paymentMethod, productId, quantity } = req.body;

        // Validate the quantity
        if (!Number.isInteger(quantity) || quantity <= 0) {
            return next(createError(400, "Invalid quantity! It must be a positive integer."));
        }

        // Validate the user's address
        const address = await Address.findById(addressId);
        if (!address || address.user.toString() !== userId) {
            return next(createError(400, "Invalid address!"));
        }

        // Find the product
        const product = await Product.findById(productId);
        if (!product) {
            return next(createError(404, "Product not found!"));
        }

        // Check stock availability
        if (product.stock < quantity) {
            return next(createError(400, `Insufficient stock! Only ${product.stock} available.`));
        }

        // Calculate total amount for the requested quantity
        const totalAmount = product.price * quantity; // Adjust total amount calculation
        const orderItems = [{ product: productId, quantity }]; // Use the requested quantity

        // Calculate delivery charge
        const deliveryCharge = await calculateDeliveryCharge(deliverySlotId);
        const { finalAmount, voucher, voucherUsed } = await applyVoucher(voucherCode, totalAmount);
        const totalWithDelivery = finalAmount + deliveryCharge;

        // Generate order ID
        const orderId = generateOrderId();

        // Process the payment
        const paymentResult = await processPayment(paymentMethod, totalWithDelivery, req.body, orderId, userId);
        if (!paymentResult.success) {
            return res.status(400).json({ success: false, message: "Payment failed!" });
        }

        // Save the payment ID
        const paymentId = paymentResult.paymentId;

        // Update stock for the purchased product
        await updateStockForBuyNow(productId, quantity);

        // Prepare for the order creation
        const deliveryDate = calculateDeliveryDate();
        const user = await users.findById(userId);
        await sendOrderConfirmationEmail(user);

        // Validate the delivery slot
        const deliverySlotDoc = await Delivery.findById(deliverySlotId);
        if (!deliverySlotDoc) {
            return next(createError(404, "Delivery slot not found!"));
        }

        // Prepare delivery slot details
        const { date, timePeriod } = deliverySlotDoc;
        const trimmedDate = new Date(date).toISOString().split('T')[0];
        const trimmedTime = timePeriod.trim();

        const deliverySlot = {
            deliverySlotId,
            date: trimmedDate,
            timePeriod: trimmedTime
        };

        // Save the new order
        const newOrder = await saveOrder(
            userId,
            orderItems,
            totalWithDelivery,
            voucher,
            voucherUsed,
            orderId,
            deliveryDate,
            deliverySlot,
            addressId,
            paymentId
        );

        // Send order confirmation notification
        const title = 'Order Confirmation';
        const body = `Hi ${user.userName}, your order with ID ${orderId} has been placed successfully. Total amount is $${totalWithDelivery}.`;
        const deviceToken = user.deviceToken;
        await notification(userId, title, body, deviceToken);

        // Respond with the new order details
        return res.status(201).json({
            success: true,
            status: 201,
            message: "Order created successfully!",
            data: {
                newOrder
            }
        });
    } catch (error) {
        console.error('Error processing buy now order:', error);
        return next(createError(500, "Something went wrong!"));
    }
};

// create order
// const createOrder = async (req, res, next) => {
//     try {
//         const { userId, voucherCode, deliverySlotId, addressId } = req.body;

//         // Validate the address by addressId
//         // const addressIsValid = await validateAddress(userId, addressId);
//         // if (!addressIsValid) return next(createError(400, "Invalid address!"));

//         const address = await Address.findById(addressId);
//         console.log("address", address);

//         // Check if the address exists and if the user ID matches
//         if (!address || address.user.toString() !== userId) {
//             return next(createError(400, "Invalid address!"));
//         }



//         const cart = await findCart(userId);
//         if (!cart) return next(createError(404, "Cart not found!"));

//         if (!cart.products.length) return next(createError(400, "No order placed!"));

//         const { totalAmount, orderItems } = await calculateTotalAndItems(cart);
//         const deliveryCharge = await calculateDeliveryCharge(deliverySlotId); // Calculate delivery charge dynamically
//         console.log(deliveryCharge);

//         const { finalAmount, voucher, voucherUsed } = await applyVoucher(voucherCode, totalAmount);
//         const totalWithDelivery = finalAmount + deliveryCharge; // Add delivery charge to the final amount
//         console.log(finalAmount);

//         await updateStockAndClearCart(cart.products, cart);

//         const orderId = generateOrderId();
//         const deliveryDate = calculateDeliveryDate();

//         const user = await users.findById(userId);

//         await sendOrderConfirmationEmail(user);

//         const deliverySlotDoc = await Delivery.findById(deliverySlotId);
//         if (!deliverySlotDoc) return next(createError(404, "Delivery slot not found!"));

//         // Extract date and time from the delivery slot document
//         const { date, timePeriod } = deliverySlotDoc;

//         // Trim and format the date and time
//         const trimmedDate = new Date(date).toISOString().split('T')[0]; // Get date in YYYY-MM-DD format
//         const trimmedTime = timePeriod.trim(); // Trim any whitespace from time period


//         const deliverySlot = {
//             deliverySlotId,
//             date: trimmedDate,
//             timePeriod: trimmedTime
//         }
//         const newOrder = await saveOrder(
//             userId,
//             orderItems,
//             totalWithDelivery,
//             voucher,
//             voucherUsed,
//             orderId,
//             deliveryDate,
//             deliverySlot,
//             addressId
//         );

//         // Send notification
//         const title = 'Order Confirmation';
//         const body = `Hi ${user.userName}, your order with ID ${orderId} has been placed successfully. Total amount is $${totalWithDelivery}.`;
//         const deviceToken = user.deviceToken; // Ensure user has deviceToken field
//         await notification(userId, title, body, deviceToken);

//         return res.status(201).json({
//             success: true,
//             status: 201,
//             message: "Order created successfully!",
//             data: {
//                 newOrder
//             }
//         });
//     } catch (error) {
//         console.error('Error creating order:', error);
//         return next(createError(500, "Something went wrong!"));
//     }
// };

// create order
const createOrder = async (req, res, next) => {
    try {
        const { userId, voucherCode, deliverySlotId, addressId, paymentMethod, paymentId,
            paymentStatus } = req.body;

        // Validate the address by addressId
        // const addressIsValid = await validateAddress(userId, addressId);
        // if (!addressIsValid) return next(createError(400, "Invalid address!"));

        const address = await Address.findById(addressId);
        console.log("address", address);

        // Check if the address exists and if the user ID matches
        if (!address || address.user.toString() !== userId) {
            return next(createError(400, "Invalid address!"));
        }



        const cart = await findCart(userId);
        if (!cart) return next(createError(404, "Cart not found!"));

        if (!cart.products.length) return next(createError(400, "No order placed!"));

        const { totalAmount, orderItems } = await calculateTotalAndItems(cart);
        const deliveryCharge = await calculateDeliveryCharge(deliverySlotId); // Calculate delivery charge dynamically
        console.log(deliveryCharge);

        const { finalAmount, voucher, voucherUsed } = await applyVoucher(voucherCode, totalAmount);
        const totalWithDelivery = finalAmount + deliveryCharge; // Add delivery charge to the final amount
        console.log(finalAmount);

        const orderId = generateOrderId();

          // **Step 1: Verify Payment**
          const paymentResult = await processPayment(paymentMethod, totalWithDelivery, paymentId, paymentStatus, userId, orderId);
          console.log("paymentResult", paymentResult);
          
           // Check if payment was successful
           if (!paymentResult.success) {
               return res.status(400).json({ success: false, message: paymentResult.message });
           }
   
           // Now save the payment ID in the order model
           const verifiedPaymentId = paymentResult.paymentId; // Obtained from verification
           console.log("verifiedPaymentId", verifiedPaymentId);        

        await updateStockAndClearCart(cart.products, cart);

        const deliveryDate = calculateDeliveryDate();

        const user = await users.findById(userId);

        await sendOrderConfirmationEmail(user);

        const deliverySlotDoc = await Delivery.findById(deliverySlotId);
        if (!deliverySlotDoc) return next(createError(404, "Delivery slot not found!"));

        // Extract date and time from the delivery slot document
        const { date, timePeriod } = deliverySlotDoc;

        // Trim and format the date and time
        const trimmedDate = new Date(date).toISOString().split('T')[0]; // Get date in YYYY-MM-DD format
        const trimmedTime = timePeriod.trim(); // Trim any whitespace from time period


        const deliverySlot = {
            deliverySlotId,
            date: trimmedDate,
            timePeriod: trimmedTime
        }
        const newOrder = await saveOrder(
            userId,
            orderItems,
            totalWithDelivery,
            voucher,
            voucherUsed,
            orderId,
            deliveryDate,
            deliverySlot,
            addressId,
            verifiedPaymentId
        );

        // Send notification
        const title = 'Order Confirmation';
        const body = `Hi ${user.userName}, your order with ID ${orderId} has been placed successfully. Total amount is $${totalWithDelivery}.`;
        const deviceToken = user.deviceToken; // Ensure user has deviceToken field
        await notification(userId, title, body, deviceToken);

        return res.status(201).json({
            success: true,
            status: 201,
            message: "Order created successfully!",
            data: {
                newOrder
            }
        });
    } catch (error) {
        console.error('Error creating order:', error);
        return next(createError(500, "Something went wrong!"));
    }
};


// Function to get SumUp access token
const getSumUpAccessToken = async () => {
    const tokenUrl = 'https://api.sumup.com/token';
    
    // Retrieve credentials from environment variables
    const SUMUP_CLIENT_ID = process.env.SUMUP_CLIENT_ID;
    const SUMUP_CLIENT_SECRET = process.env.SUMUP_CLIENT_SECRET;

    // Validate that credentials are present
    if (!SUMUP_CLIENT_ID || !SUMUP_CLIENT_SECRET) {
        throw new Error('SumUp credentials are not set in environment variables.');
    }

    // Encode credentials in Base64 as per SumUp's requirements
    const credentials = Buffer.from(`${SUMUP_CLIENT_ID}:${SUMUP_CLIENT_SECRET}`).toString('base64');

    try {
        const response = await axios.post(
            tokenUrl,
            'grant_type=client_credentials&scope=payments',
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${credentials}`,
                },
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error(
            'Error obtaining SumUp access token:',
            error.response ? error.response.data : error.message
        );
        throw new Error('SumUp authentication failed');
    }
};

// Function to create SumUp payment
const createSumUpPayment = async (accessToken, totalAmount, currency = 'USD', description = '', customData = {}) => {
    const paymentUrl = 'https://api.sumup.com/v0.1/checkouts';
    
    const merchantCode = process.env.SUMUP_MERCHANT_CODE;
    const redirectUrl = process.env.REDIRECT_URL || 'https://www.google.com'; // Example redirect URL

    if (!merchantCode) {
        throw new Error('Merchant code (SUMUP_MERCHANT_CODE) is missing.');
    }
    
    try {
        // Validate and format totalAmount
        if (typeof totalAmount !== 'number' || isNaN(totalAmount)) {
            throw new Error('Invalid totalAmount. It must be a valid number.');
        }
        const paymentAmount = totalAmount.toFixed(2); // e.g., "22.00"

        const payload = {
            checkout_reference: `order_${customData.order_id}`,
            amount: paymentAmount,
            currency: currency,
            description: description || 'Order payment',
            merchant_code: merchantCode,
            redirect_url: redirectUrl,
            metadata: customData,
        };

        // Log the payload for debugging (remove in production)
        console.log("SumUp Payment Payload:", JSON.stringify(payload, null, 2));

        const response = await axios.post(
            paymentUrl,
            payload,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                timeout: 10000, // Optional: Set a timeout for the request
            }
        );

        // Log the successful response (remove in production)
        console.log("SumUp Payment Response:", JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error('SumUp API Error Status:', error.response.status);
            console.error('SumUp API Error Headers:', JSON.stringify(error.response.headers, null, 2));
            console.error('SumUp API Error Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error('No response received from SumUp:', error.request);
        } else {
            console.error('Error setting up the request:', error.message);
        }
        throw new Error('SumUp payment creation failed');
    }
};

// Payment helper function
const processPayment = async (paymentMethod, totalAmount, paymentId, paymentStatus, userId, orderId) => {
    try {
        if (paymentMethod === 'stripe') {
            // Stripe payment verification
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
            // console.log("Retrieved PaymentIntent:", paymentIntent);

            if (paymentIntent.status === 'succeeded') {
                // Save payment information in your database
                await savePayment({
                    userId,
                    orderId, // Ensure consistency or pass orderId appropriately
                    paymentMethod: 'stripe',
                    paymentStatus: paymentIntent.status,
                    paymentId: paymentIntent.id,
                    amountPaid: totalAmount,
                    currency: paymentIntent.currency,
                    transactionDetails: paymentIntent,
                });

                return {
                    success: true,
                    paymentId: paymentIntent.id,
                    message: "Payment verified successfully with Stripe."
                };
            } else {
                return { success: false, message: "Payment not completed with Stripe." };
            }

        } else if (paymentMethod === 'paypal') {
            // PayPal payment handling
            const createPaymentJson = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "transactions": [{
                    "amount": {
                        "currency": "USD",
                        "total": totalAmount.toString()
                    },
                    "description": "Order payment"
                }],
                "redirect_urls": {
                    "return_url": "http://44.196.192.232:2033/cart",
                    "cancel_url": "http://44.196.192.232:2033/"
                }
            };

            const payment = await new Promise((resolve, reject) => {
                paypal.payment.create(createPaymentJson, (error, payment) => {
                    if (error) {
                        reject(error);
                    } else {
                        const approvalUrl = payment.links.find(link => link.rel === 'approval_url').href;
                        console.log("approvalUrl", approvalUrl);
                        
                        resolve({ success: true, approvalUrl, payment });
                    }
                });
            });

            if (payment.success) {
                // Save PayPal payment information in your database
                await savePayment({
                    userId,
                    orderId,
                    paymentMethod: 'paypal',
                    paymentStatus: payment.payment.state, // PayPal has 'approved', 'failed', etc.
                    paymentId: payment.payment.id,
                    amountPaid: totalAmount,
                    currency: 'USD',
                    transactionDetails: payment.payment,
                });

                return {
                    success: true,
                    approvalUrl: payment.approvalUrl, // Redirect user to approval URL for PayPal
                    paymentId: payment.payment.id,
                    message: "Payment initiated with PayPal."
                };
            }
            
        } else if (paymentMethod === 'sumup') {
            // SumUp payment handling
            // Step 1: Authenticate with SumUp
            const accessToken = await getSumUpAccessToken();
            console.log("SumUp Access Token:", accessToken);
            const description = `Payment for order ${orderId}`; // Example description
            const customData = {
                order_id: orderId,  // Example of custom data
                user_id: userId,
            };

            // Step 2: Create SumUp payment
            const sumUpPayment = await createSumUpPayment(accessToken, totalAmount, 'USD', description, customData);
            console.log("SumUp Payment Response:", sumUpPayment);

            // Assuming SumUp returns a checkout URL to redirect the user for payment
            if (sumUpPayment.checkout_url) {
                // Save SumUp payment information in your database
                await savePayment({
                    userId,
                    orderId,
                    paymentMethod: 'sumup',
                    paymentStatus: 'initiated', // Initial status; you may update based on webhook
                    paymentId: sumUpPayment.id,
                    amountPaid: totalAmount,
                    currency: 'USD',
                    transactionDetails: sumUpPayment,
                });

                return {
                    success: true,
                    checkoutUrl: sumUpPayment.checkout_url, // Redirect user to SumUp checkout URL
                    paymentId: sumUpPayment.id,
                    message: "Payment initiated with SumUp."
                };
            } else {
                throw new Error('SumUp payment initiation failed');
            }

        } 
         else {
            return { success: false, message: "Invalid payment method!" };
        }
    } catch (error) {
        console.error('Error processing payment:', error);
        return { success: false, message: "Payment failed due to an error!" };
    }
};

const savePayment = async ({ userId, orderId, paymentMethod, paymentStatus, paymentId, amountPaid, currency, transactionDetails }) => {
    try {
        const payment = new Payment({
            userId,
            orderId,
            paymentMethod,
            paymentStatus,
            paymentId,
            amountPaid,
            currency,
            transactionDetails
        });
        await payment.save();
        console.log('Payment saved successfully:', payment);
    } catch (error) {
        console.error('Error saving payment:', error);
        throw new Error('Failed to save payment.');
    }
};




const findCart = async (userId) => {
    return await Cart.findOne({ user: userId });
};

const calculateDeliveryCharge = async (deliverySlotId) => {
    try {
        console.log("Calculating delivery charge for deliverySlotId:", deliverySlotId); // Debug log
        const deliverySlot = await Delivery.findById(deliverySlotId);
        if (!deliverySlot) throw new Error("Delivery slot not found!");

        console.log("Retrieved deliverySlot document:", deliverySlot); // Debug log
        console.log("Delivery charge:", deliverySlot.deliveryCharge); // Debug log

        return deliverySlot.deliveryCharge; // Access the delivery charge from the delivery slot document
    } catch (error) {
        console.error("Error calculating delivery charge:", error);
        throw new Error("Error calculating delivery charge");
    }
};


const calculateTotalAndItems = async (cart) => {
    let totalAmount = 0;
    let orderItems = [];
    for (const item of cart.products) {
        const product = await Product.findById(item.product);
        if (!product) throw createError(404, "Product not found!");
        if (product.stock < item.quantity) throw createError(400, `Not enough stock for ${product.name}`);


        let productPrice = product.price;
        let discountAmount = 0;

        // Check if the product has a discount
        if (product.discount && product.discount > 0) {
            // Calculate discount amount and subtract from product price
            discountAmount = (product.price * product.discount) / 100;
            productPrice -= discountAmount;
        }

        const productTotal = productPrice * item.quantity;
        totalAmount += productTotal;
        orderItems.push({
            product: product._id,
            name: product.name,
            price: product.price,
            quantity: item.quantity,
            discount: discountAmount,
            total: productTotal
        });
    }
    return { totalAmount, orderItems };
};

const applyVoucher = async (voucherCode, totalAmount) => {
    let voucher, voucherUsed = false;
    if (voucherCode) {
        voucher = await Voucher.findOne({ code: voucherCode, isActive: true });
        if (!voucher || voucher.useLimit === 0) throw createError(404, "Voucher not found or inactive!");
        if (new Date() > new Date(voucher.expiryDate)) throw createError(400, "Voucher is expired!");

        totalAmount -= voucher.discountValue;
        totalAmount = Math.max(0, totalAmount);

        voucher.useLimit -= 1;
        voucher.isActive = voucher.useLimit > 0;
        voucherUsed = true;

        await voucher.save();
    }
    return { finalAmount: totalAmount, voucher, voucherUsed };
};

// stock updation for buy now products
const updateStockForBuyNow = async (productId, quantity) => {
    try {
        const product = await Product.findById(productId);

        if (!product) {
            throw new Error(`Product with ID ${productId} not found`);
        }

        // Update stock
        product.stock -= quantity;

        // Send notifications based on stock level
        if (product.stock <= 4) {
            await createNotification('Product Getting Out of Stock', `${product.name} is getting low on stock.`);
        }
        if (product.stock === 0) {
            await createNotification('Product Out of Stock', `${product.name} is out of stock.`);
        }

        // Save the updated product stock
        await product.save();
    } catch (error) {
        console.error('Error updating stock for Buy Now:', error);
        throw error; // You can handle this error in the buyNow API if needed
    }
};

const updateStockAndClearCart = async (products, cart) => {
    for (const item of products) {
        const product = await Product.findById(item.product);
        product.stock -= item.quantity;
        if (product.stock <= 4) {
            // Create a notification for the admin about the new user sign-up
            await createNotification('Product Getting Out of Stock', `${product.name} is getting out of stock.`);
        }
        if (product.stock == 0) {
            // Create a notification for the admin about the new user sign-up
            await createNotification('Product Out of Stock', `${product.name} is out of stock.`);
        }
        await product.save();
    }
    cart.products = [];
    await cart.save();
};

const generateOrderId = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const currentDay = currentDate.getDate().toString().padStart(2, '0');
    const randomOrderId = uuidv4().slice(0, 7);
    return `${currentYear}-${randomOrderId}-${currentMonth}-${currentDay}`;
};

const calculateDeliveryDate = () => {
    const currentDate = new Date();
    const deliveryDays = Math.floor(Math.random() * 2) + 3;
    currentDate.setDate(currentDate.getDate() + deliveryDays);
    return currentDate;
};

const sendOrderConfirmationEmail = async (user) => {
    const subject = `Your order has been placed!`;
    const text = `Dear ${user.userName},\n\nYour order has been placed successfully!\n\nThank you for shopping with us.\n\nBest regards,\nMD Sweden`;
    await sendEmail(user.email, subject, text);
};

const saveOrder = async (userId, orderItems, totalAmount, voucher, voucherUsed, orderId, deliveryDate, deliverySlot, addressId, verifiedPaymentId) => {
    const newOrder = new Order({
        user: userId,
        items: orderItems,
        totalAmount,
        voucher: voucher ? voucher._id : undefined,
        voucherUsed: voucherUsed,
        orderId: orderId,
        expectedDeliveryDate: deliveryDate,
        deliverySlot,
        address: addressId,
        paymentId: verifiedPaymentId,
    });
    return await newOrder.save();
};

const sendEmail = async (to, subject, text) => {
    try {
        // Email validation
        if (!validator.isEmail(to)) {
            throw new Error("Invalid email format");
        }

        const mailTransporter = nodemailer.createTransport({
            service: "GMAIL",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailDetails = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            text: text
        };

        await mailTransporter.sendMail(mailDetails);
        console.log("Email sent successfully!");
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};

// const validateAddress = async (userId, addressId) => {
//     try {
//         // Find the user by userId
//         const user = await users.findById(userId);
//         if (!user) throw new Error('User not found!');

//         // Check if the addressId exists in the user's addresses array
//         const addressExists = user.Address.some(address => address._id.toString() === addressId);

//         return addressExists;
//     } catch (error) {
//         console.error('Error validating address:', error);
//         throw new Error('Address validation failed!');
//     }
// };
const getOrderSummary = async (req, res, next) => {
    try {
        const { orderId } = req.params;

        // Fetch the order by orderId
        const order = await Order.findOne({ orderId }).exec();
        if (!order) {
            return next(createError(404, 'Order not found!'));
        }

        // Fetch user details manually (if needed)
        const user = await users.findById(order.user).select('userName email').exec();

        // Initialize total discount
        let productTotalCost = 0;
        let totalDiscountAmount = 0;

        // Fetch order items and their product details including discount
        const orderItems = await Promise.all(
            order.items.map(async (item) => {
                const product = await Product.findById(item.product).select('name price discount').exec();

                const itemDiscount = product.discount || 0; // Default to 0 if no discount
                const itemCostBeforeDiscount = product.price * item.quantity;
                const discountAmount = (itemCostBeforeDiscount * itemDiscount) / 100; // Calculate discount amount
                const itemCostAfterDiscount = itemCostBeforeDiscount - discountAmount;

                // Sum up total product cost and total discount amount
                productTotalCost += itemCostAfterDiscount;
                totalDiscountAmount += discountAmount;

                return {
                    product: product.name,
                    price: product.price,
                    quantity: item.quantity,
                    discount: itemDiscount, // Show discount percentage
                    itemCostBeforeDiscount,
                    discountAmount, // Show discount amount
                    itemCostAfterDiscount // Show final cost after discount
                };
            })
        );

        // Manually fetch the delivery slot details using deliverySlotId
        const deliverySlot = await Delivery.findById(order.deliverySlot.deliverySlotId).exec();
        const deliverySlotDetails = {
            deliverySlotId: order.deliverySlot.deliverySlotId,
            date: order.deliverySlot.date,
            timePeriod: order.deliverySlot.timePeriod,
            deliveryType: deliverySlot ? deliverySlot.deliveryType : null, // Assuming you have deliveryType in DeliverySlot model
            deliveryCharge: deliverySlot ? deliverySlot.deliveryCharge : 0 // Assuming you have deliveryCharge in DeliverySlot model
        };

        // Fetch voucher details manually if voucher is used
        let voucher = null;
        if (order.voucher) {
            const voucherDoc = await Voucher.findById(order.voucher).select('code discount').exec();
            voucher = {
                code: voucherDoc.code,
                discount: voucherDoc.discount
            };
        }

        // Prepare the order summary response, including total discount amount
        const orderSummary = {
            orderId: order.orderId,
            user: {
                userName: user.userName,
                email: user.email
            },
            items: orderItems,
            productTotalCost,
            totalDiscountAmount, // Include total discount amount
            deliverySlot: deliverySlotDetails,
            totalAmount: order.totalAmount,
            voucherUsed: order.voucherUsed,
            voucher,
            status: order.status,
            address: order.address,
            expectedDeliveryDate: order.expectedDeliveryDate
        };

        // Send the order summary
        return res.status(200).json({
            success: true,
            message: 'Order summary fetched successfully!',
            data: orderSummary
        });
    } catch (error) {
        console.error('Error fetching order summary:', error);
        return next(createError(500, 'Something went wrong!'));
    }
};


const getOrders = async (req, res) => {
    try {
        // Extract page and limit from query parameters, defaulting to page 1 and limit 10
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Count total number of orders for pagination calculations
        const totalOrders = await Order.countDocuments();

        // Fetch orders with pagination and populate userName from the User model
        const orders = await Order.find()
            .populate('user', 'userName') // Ensure 'user' field in Order schema references User model
            .skip(skip)
            .limit(limit)
            .exec();

        // Transform orders to include userName directly
        const ordersWithUserDetails = orders.map(order => ({
            ...order.toObject(),
            userName: order.user ? order.user.userName : 'No Name'
        }));

        // Calculate total number of pages
        const totalPages = Math.ceil(totalOrders / limit);

        // Respond with paginated orders and pagination info
        res.json({
            status: 200,
            message: "Orders are fetched successfully!",
            totalOrders,
            data: ordersWithUserDetails,
            pagination: {
                currentPage: page,
                totalPages,
                limit,
                totalOrders
            }
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
};
// Edit Order
const editOrder = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const { items, status } = req.body;

        let order = await Order.findById(orderId);

        if (!order) {
            return next(createError(404, "Order not found!"));
        }

        // Update order items and status
        order.items = items || order.items;
        order.status = status || order.status;

        await order.save();

        res.status(200).json({
            success: true,
            status: 200,
            message: "Order updated successfully!",
            data: order
        });
    } catch (error) {
        return next(createError(500, "Something went wrong!"));
    }
};

const cancelOrder = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return next(createError(400, "Order ID is required!"));
        }

        let order = await Order.findById(id).populate('user', 'userName email');

        if (!order) {
            return next(createError(404, "Order not found!"));
        }

        order.status = 'Cancelled';
        await order.save();

        // Prepare email content
        const subject = `Your order ${order.orderId} has been ${order.status}`;
        const text = `Dear ${order.user.userName},\n\nYour order with order ID ${order.orderId} has been ${order.status}.\n\nThank you for shopping with us.\n\nBest regards,\nMD Sweden`;

        // Send email notification
        await sendEmail(order.user.email, subject, text);

        res.status(200).json({
            success: true,
            status: 200,
            message: "Order cancelled successfully!",
            data: order
        });
    } catch (error) {
        console.error('Error cancelling order:', error);
        return next(createError(500, "Something went wrong!"));
    }
};



// Approve/Decline Order
const updateOrderStatus = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        let order = await Order.findById(orderId).populate('user', 'userName email');

        if (!order) {
            return next(createError(404, "Order not found!"));
        }

        order.status = status;

        await order.save();

        // Prepare email content
        const subject = `Your order ${order.orderId} has been ${order.status}`;
        const text = `Dear ${order.user.userName},\n\nYour order with order ID ${order.orderId} has been ${order.status}.\n\nThank you for shopping with us.\n\nBest regards,\nMD Sweden`;

        // Send email notification
        await sendEmail(order.user.email, subject, text);

        res.status(200).json({
            success: true,
            status: 200,
            message: `Order ${status.toLowerCase()} successfully!`,
            data: order
        });
    } catch (error) {
        console.error("Error updating status:", error);
        return next(createError(500, "Something went wrong!"));
    }
};

const approveOrder = async (req, res, next) => {
    try {
        const { id } = req.params;

        let order = await Order.findById(id).populate('user', 'userName email');

        if (!order) {
            console.error(`Order with ID: ${id} not found!`);
            return next(createError(404, "Order not found!"));
        }

        order.status = 'Approved';

        await order.save();

        // Prepare email content
        const subject = `Your order ${order.orderId} status has been ${order.status}`;
        const text = `Dear ${order.user.userName},\n\nYour order with order ID ${order.orderId} has been ${order.status}.\n\nThank you for shopping with us.\n\nBest regards,\nMD Sweden`;

        // Send email notification
        await sendEmail(order.user.email, subject, text);

        res.status(200).json({
            success: true,
            status: 200,
            message: "Order approved successfully!",
            data: order
        });
    } catch (error) {
        console.error('Error approving order:', error);
        return next(createError(500, "Something went wrong!"));
    }
};

const declineOrder = async (req, res, next) => {
    try {
        const { id } = req.params;

        let order = await Order.findById(id).populate('user', 'userName email');

        if (!order) {
            return next(createError(404, "Order not found!"));
        }

        order.status = 'Declined';

        await order.save();

        // Prepare email content
        const subject = `Your order ${order.orderId} has been ${order.status}`;
        const text = `Dear ${order.user.userName},\n\nYour order with order ID ${order.orderId} has been ${order.status}.\n\nThe payment will be confirmed within 20 minutes, if any deduction has been done it will be reverted back.\n\nThank you for shopping with us.\n\nBest regards,\nMD Sweden`;

        // Send email notification
        await sendEmail(order.user.email, subject, text);

        res.status(200).json({
            success: true,
            status: 200,
            message: "Order declined successfully!",
            data: order
        });
    } catch (error) {
        return next(createError(500, "Something went wrong!"));
    }
};

const calculateProductFrequencyFromOrders = async () => {
    // Fetch all orders and populate the `items` field (assuming `items` is an array of product references)
    const orders = await Order.find({}).populate('items'); // Assuming `items` field has product details

    // Create an object to store the frequency of products per month
    const monthlyProductFrequency = {};

    // Iterate through each order
    orders.forEach(order => {
        // Extract the month and year from the order's createdAt timestamp
        const orderDate = new Date(order.createdAt); // Assuming `createdAt` is the order date field
        const month = orderDate.getMonth(); // 0 for January, 1 for February, etc.
        const year = orderDate.getFullYear(); // Extract the year as well
        const monthYear = `${month + 1}-${year}`; // e.g., "7-2023" for July 2023

        // Initialize monthYear in the object if not already there
        if (!monthlyProductFrequency[monthYear]) {
            monthlyProductFrequency[monthYear] = {};
        }

        // Loop through products in the order
        order.items.forEach(product => {
            const productName = product.name;

            // Check if product exists in the current monthYear, if not, initialize it
            if (!monthlyProductFrequency[monthYear][productName]) {
                monthlyProductFrequency[monthYear][productName] = {
                    frequency: 0,
                    details: {
                        name: product.name,
                        price: product.price, // assuming `price` field exists
                        // description: product.description, // any other product information you want to include
                        // category: product.category, // assuming `category` field exists

                    }
                };
            }

            // Increment the frequency of this product for the month
            monthlyProductFrequency[monthYear][productName].frequency++;
        });
    });

    return monthlyProductFrequency;
};

const getProductFrequency = async (req, res, next) => {
    try {
        // Fetch the product frequency by month from the updated function
        const monthlyProductFrequency = await calculateProductFrequencyFromOrders();
        console.log("Monthly Product Frequency:", monthlyProductFrequency);

        // Return the result in the API response
        return res.status(200).json({
            success: true,
            message: "Product frequency by month calculated successfully!",
            data: {
                monthlyProductFrequency
            }
        });
    } catch (error) {
        console.error('Error fetching product frequency by month:', error);
        return next(createError(500, "Failed to fetch product frequency by month!"));
    }
};

// Export Order Details
// const exportOrders = async (req, res, next) => {
//     try {
//         const orders = await Order.find().populate('user').populate('items.product');

//         res.status(200).json({
//             success: true,
//             status: 200,
//             message: "Orders fetched successfully!",
//             data: orders
//         });
//     } catch (error) {
//         return next(createError(500, "Something went wrong!"));
//     }
// };



// get order history
const getOrderHistory = async (req, res, next) => {
    try {
        const id = req.params.id;

        const orders = await Order.find({ user: id })
            .populate('items.product')
            .exec();

        if (!orders.length) {
            return next(createError(404, "No orders found for this user!"));
        }

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Order history retrieved successfully!",
            data: orders
        });
    }
    catch (error) {
        return next(createError(500, "Something went wrong!"));
    }
};


// get order by id
// const getOrderById = async (req, res) => {
//     const { orderId } = req.params; // Extract the orderId from request parameters
//     try {
//         const order = await Order.findById(orderId); // Find order by its ID
//         if (!order) {
//             return res.status(404).json({ message: 'Order not found' });
//         }

//         const user = await users.findById(order.user); // Find the user associated with the order

//         const orderWithUserDetails = {
//             ...order.toObject(),
//             userName: user ? user.userName : 'No Name'
//         };

//         res.json({ data: orderWithUserDetails });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

const handleImportProducts = async () => {
    if (!importFile) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const productsArray = XLSX.utils.sheet_to_json(sheet);

        try {
            await Promise.all(productsArray.map(async (product) => {
                let imageUrl = product.image;

                // Assuming the image URLs in the CSV are valid links
                // No need to upload to Cloudinary, directly use the URLs

                const newProduct = {
                    name: product.name,
                    price: product.price,
                    description: product.description,
                    subcategory: product.subcategory,
                    image: imageUrl,
                    stock: product.stock
                };

                await axios.post('http://localhost:3003/api/product/add', newProduct);
            }));
            fetchProducts(); // Re-fetch products after importing
        } catch (error) {
            setError('Error importing products');
            console.error('Error importing products:', error);
        }
    };
    reader.readAsArrayBuffer(importFile);
};


const getRecommendations = async (req, res, next) => {
    try {
        const { productId } = req.params;

        // Find the product and get its subcategory ID
        const product = await Product.findById(productId);
        if (!product) {
            return next(createError(404, "Product not found!"));
        }

        const subcategoryId = product.subcategory; // Assuming subcategory is a direct reference (ID)

        // Fetch products from the same subcategory
        const recommendations = await Product.find({
            subcategory: subcategoryId,
            _id: { $ne: productId } // Exclude the current product
        }).limit(10); // Limit the number of recommendations

        res.status(200).json({
            success: true,
            status: 200,
            message: "Recommendations retrieved successfully!",
            data: recommendations
        });
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        return next(createError(500, "Something went wrong!"));
    }
};

// Utility function to shuffle and limit the array
const getRandomItems = (array, numItems) => {
    const shuffled = array.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numItems);
};

// Route to get 10-12 random item recommendations based on the entered month and subcategory
const getRecommendationByMonth = async (req, res) => {
    const { subcategoryId } = req.params; // Get subcategoryId from query parameters
    const { month } = req.body; // Get month from the request body

    if (!month || isNaN(month) || month < 1 || month > 12) {
        return res.status(400).json({ message: 'Please provide a valid month (1-12).' });
    }

    if (!subcategoryId) {
        return res.status(400).json({ message: 'Please provide a valid subcategoryId.' });
    }

    try {
        // Convert month input to a valid Date range for that month
        const startDate = new Date(new Date().getFullYear(), month - 1, 1);
        const endDate = new Date(new Date().getFullYear(), month, 0); // End of the month

        // Find orders within the date range and subcategory
        const orders = await Order.find({
            orderDate: {
                $gte: startDate,
                $lt: endDate,
            },
            subcategoryId: subcategoryId, // Filter by subcategoryId
        });

        if (orders.length === 0) {
            return res.status(404).json({ message: 'No items found for the given month and subcategory.' });
        }

        // Get 10-12 random orders from the result
        const randomOrders = getRandomItems(orders, Math.floor(Math.random() * 3) + 10);

        // Extract the item names from the random orders
        const recommendedItems = randomOrders.map(order => order.itemName);

        // Return the recommended items
        res.json({ recommendedItems });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};




module.exports = {
    addProduct,
    getAllProduct,
    getAllProductDiscount,
    getProductById,
    getProductsBySubcategoryId,
    deleteProduct,
    updateProduct,
    searchProduct,
    createOrder,
    getOrderHistory,
    handleImportProducts,
    editOrder,
    cancelOrder,
    updateOrderStatus,
    getOrders,
    approveOrder,
    declineOrder,
    getRecommendations,
    getRecommendationByMonth,
    getProductByCategoryId,
    getProductFrequency,
    getOrderSummary,
    orderSummary,
    buyNow
};