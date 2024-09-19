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

router.post('/add', addToCart);
router.delete('/delete', removeFromCart);
router.get('/get/:userId', getCart);
router.put('/increase', increaseQuantity);
router.put('/decrease', decreaseQuantity);
router.put('/update/:id', updateQuantity)


module.exports = router;