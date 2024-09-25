const express = require("express");

const {
    addToCart,
    removeFromCart,
    getCart,
    changeQuantity,
    updateQuantity
} = require("../controllers/cartController");

const {
    verifyToken
} = require("../middleware/verifyToken");

const router = express.Router();

router.post('/add', addToCart);
router.delete('/delete/:productId', verifyToken, removeFromCart);
router.get('/get', verifyToken, getCart);
router.put('/change', changeQuantity);
router.put('/update/:id', updateQuantity);


module.exports = router;