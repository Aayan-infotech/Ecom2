const express = require("express");

const {
    addToCart,
    removeFromCart,
    getCart,
    increaseQuantity,
    decreaseQuantity,
    updateQuantity
} = require("../controllers/cartController");

const {
    verifyToken
} = require("../middleware/verifyToken");

const router = express.Router();

router.post('/add', verifyToken, addToCart);
router.delete('/delete/:userId/:productId', removeFromCart);
router.get('/get', verifyToken, getCart);
router.put('/increase', increaseQuantity);
router.put('/decrease', decreaseQuantity);
router.put('/update/:id', updateQuantity)


module.exports = router;