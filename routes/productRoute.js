const express = require("express");

const {
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
    getOrderSummary
} = require("../controllers/productController");


const router = express.Router();


router.post('/add', addProduct);
router.get('/getall', getAllProduct);
router.get('/getdiscount', getAllProductDiscount);
router.get('/get/:id', getProductById);
router.get('/subcategory/:id', getProductsBySubcategoryId);
router.delete('/delete/:id', deleteProduct);
router.post('/search', searchProduct);
router.post('/order', createOrder);
router.get('/order-history/:id', getOrderHistory);
router.put('/update/:id', updateProduct);
router.get('/:subcategoryId/recommendation', getRecommendationByMonth);

// Edit Order
router.put('/edit/:id', editOrder);

// Cancel Order
router.post('/cancel/:id', cancelOrder);

router.put('/update-order/:orderId', updateOrderStatus);

// Get all orders
router.get('/getorders', getOrders);

router.post('/approve/:id', approveOrder);

router.post('/decline/:id', declineOrder);

router.get('/recommended/:productId', getRecommendations);

router.get('/categoryproducts/:categoryId', getProductByCategoryId);

router.get('/frequency', getProductFrequency);
router.get('/summary/:orderId', getOrderSummary);

module.exports = router;