const express = require("express");

const {
    addToCart,
    removeFromCart,
    getCart,
    changeQuantity,
    updateQuantity,
    decreaseQuantity,
    increaseQuantity,
    getProductFromCart
} = require("../controllers/cartController");

const {
    verifyToken
} = require("../middleware/verifyToken");

const router = express.Router();

router.post('/add', addToCart);
router.delete('/delete/:productId', removeFromCart);
router.get('/get/:userId?', getCart);
router.put('/change', changeQuantity);
router.put('/update/:id', updateQuantity);
router.put('/increase', decreaseQuantity);
router.put('/decrease', increaseQuantity);
router.get('/product/:productId', getProductFromCart);

module.exports = router;