const express = require("express");

const {
    addProduct,
    getAllProduct,
    getAllProductDiscountByCategory,
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
    getOrderSummary,
    orderSummary,
    buyNow
} = require("../controllers/productController");


const router = express.Router();


router.post('/add', addProduct);
router.get('/getall', getAllProduct);
router.get('/getdiscount/:categoryId', getAllProductDiscountByCategory);
router.get('/get/:id', getProductById);
router.get('/subcategory/:id', getProductsBySubcategoryId);
router.delete('/delete/:id', deleteProduct);
router.post('/search', searchProduct);
router.post('/order', createOrder);
router.post('/order-now', buyNow);
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
router.get('/summary/:userId/:deliverySlotId/:addressId', orderSummary);


module.exports = router;