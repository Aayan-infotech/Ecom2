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


// add product
const addProduct = async (req, res, next) => {
    try {
        const { title, description, price, stock, deliverySlots } = req.body;

        // Validate product fields
        if (!title || !description || !price || !stock) {
            return next(createError(400, "All product fields are required!"));
        }

        // Check for duplicate product
        const existingProduct = await Product.findOne({ title });
        if (existingProduct) {
            return next(createError(400, "Product with this title already exists!"));
        }

        // Create new product
        const newProduct = new Product({ title, description, price, stock });

        // Validate delivery slots
        if (deliverySlots && deliverySlots.length > 0) {
            const slots = deliverySlots.map(slot => ({
                deliveryType: slot.deliveryType,
                date: slot.date,
                timePeriod: slot.timePeriod,
                maxOrders: slot.maxOrders
            }));
            newProduct.deliverySlots = slots;
        }

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
        const products = await Product.find().populate('subcategory', 'title');

        return res.status(200).json({
            success: true,
            status: 200,
            message: "All Products received Successfully!",
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
        const { name, price, description, subcategory, image, stock } = req.body;

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
const createOrder = async (req, res, next) => {
    try {
        const { userId, voucherCode, deliverySlotId } = req.body;

        const cart = await findCart(userId);
        if (!cart) return next(createError(404, "Cart not found!"));

        if (!cart.products.length) return next(createError(400, "No order placed!"));

        const { totalAmount, orderItems } = await calculateTotalAndItems(cart);
        const deliveryCharge = await calculateDeliveryCharge(deliverySlotId); // Calculate delivery charge dynamically
        console.log(deliveryCharge);
        
        const { finalAmount, voucher, voucherUsed } = await applyVoucher(voucherCode, totalAmount);
        const totalWithDelivery = finalAmount + deliveryCharge; // Add delivery charge to the final amount
        console.log(finalAmount);
        
        await updateStockAndClearCart(cart.products, cart);

        const orderId = generateOrderId();
        const deliveryDate = calculateDeliveryDate();

        const user = await users.findById(userId);

        // await sendOrderConfirmationEmail(user);

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
        const newOrder = await saveOrder(userId, orderItems, totalWithDelivery, voucher, voucherUsed, orderId, deliveryDate, deliverySlot);

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

        totalAmount += product.price * item.quantity;
        orderItems.push({
            product: product._id,
            name: product.name,
            price: product.price,
            quantity: item.quantity
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

const updateStockAndClearCart = async (products, cart) => {
    for (const item of products) {
        const product = await Product.findById(item.product);
        product.stock -= item.quantity;
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

const saveOrder = async (userId, orderItems, totalAmount, voucher, voucherUsed, orderId, deliveryDate, deliverySlot) => {
    const newOrder = new Order({
        user: userId,
        items: orderItems,
        totalAmount,
        voucher: voucher ? voucher._id : undefined,
        voucherUsed: voucherUsed,
        orderId: orderId,
        expectedDeliveryDate: deliveryDate,
        deliverySlot
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

const getOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        const ordersWithUserDetails = await Promise.all(orders.map(async (order) => {
            const user = await users.findById(order.user);
            return {
                ...order.toObject(),
                userName: user ? user.userName : 'No Name'
            };
        }));

        res.json({ data: ordersWithUserDetails });
    } catch (error) {
        res.status(500).json({ message: error.message });
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
        const { status } = req.body; // should be 'Approved' or 'Declined'

        let order = await Order.findById(orderId);

        if (!order) {
            return next(createError(404, "Order not found!"));
        }

        order.status = status;

        await order.save();

        res.status(200).json({
            success: true,
            status: 200,
            message: `Order ${status.toLowerCase()} successfully!`,
            data: order
        });
    } catch (error) {
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



module.exports = {
    addProduct,
    getAllProduct,
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
    getRecommendations
};