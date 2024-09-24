require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const path = require('path');
const fs = require('fs');

// Import routes
const authRoute = require('./routes/authRoute');
const userRoute = require('./routes/userRoute');
const categoryRoute = require('./routes/categoryRoute');
const subcategoryRoute = require('./routes/subcategoryRoute');
const productRoute = require('./routes/productRoute');
const favoriteRoute = require('./routes/favoriteRoute');
const cartRoute = require('./routes/cartRoute');
const deliverySlotRoute = require('./routes/deliverySlotRoute');
const addressRoute = require('./routes/addressRoute');
const voucherRoute = require('./routes/voucherRoute');
const invoiceRoute = require('./routes/invoiceRoute');
const notificationRoute = require('./routes/notificationRoute');
const paymentRoute = require('./routes/paymentRoute');



// Ensure the 'exports' directory exists
const exportDir = path.join(__dirname, 'exports');

if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir);
}



// Environment variables
const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL;
// const FRONTEND = process.env.FRONTEND;

const app = express();

const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Use cors middleware with options
// app.use(cors({
//     origin: 'http://localhost:3001', // Allow requests from frontend origin
//     credentials: true // Allow credentials (cookies, authorization headers, etc.)
//   }));

// Middleware
app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);
app.use('/api/category', categoryRoute); //added product category routes
app.use('/api/subcategory', subcategoryRoute); //added product subcategory routes
app.use('/api/product', productRoute); //added product detail routes
app.use('/api/favorite', favoriteRoute); //added favorite routes
app.use('/api/cart', cartRoute); //added cart routes
app.use('/api/deliveryslot', deliverySlotRoute); //added delivery slot routes
app.use('/api/address', addressRoute); //added address routes
app.use('/api/voucher', voucherRoute); //added voucher routes
app.use('/api/invoices', invoiceRoute); 
app.use('/api/notification', notificationRoute);
app.use('/api/payment', paymentRoute);

app.get('/', (req, res) => {
    res.send("Congratulations! It's working");
  });





// Response handler middleware
app.use((obj, req, res, next) => {
    const statusCode = obj.status || 500;
    const message = obj.message || "Something went wrong!";
    return res.status(statusCode).json({
        success: [200, 201, 204].includes(obj.status),
        status: statusCode,
        message: message,
        data: obj.data
    });
});

// Database connection
mongoose.set("strictQuery", false);
mongoose.connect("mongodb+srv://nivedita:ecommerce4312@e-commerce.yv2bdut.mongodb.net/e-Commerce")
    .then(() => {
        console.log('connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Node API app is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.log('Error connecting to MongoDB:', error);
    });

module.exports = app;
