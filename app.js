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

const app = express();

const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routes
app.get('/', (req, res) => {
    res.send("Hi! Jyoti backend code is running successfully.");
});

app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);
app.use('/api/category', categoryRoute);
app.use('/api/subcategory', subcategoryRoute);
app.use('/api/product', productRoute);
app.use('/api/favorite', favoriteRoute);
app.use('/api/cart', cartRoute);
app.use('/api/deliveryslot', deliverySlotRoute);
app.use('/api/address', addressRoute);
app.use('/api/voucher', voucherRoute);
app.use('/api/invoices', invoiceRoute);
app.use('/api/notification', notificationRoute);
app.use('/api/payment', paymentRoute);

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
mongoose.connect(MONGO_URL)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Node API app is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

module.exports = app;
