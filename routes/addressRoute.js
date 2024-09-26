const express = require('express');

const {
    addAddress,
    getAddressByUserId,
    updateAddress,
    selectAddress,
    deleteAddress
} = require("../controllers/addressController");

const router = express.Router();

router.post('/add', addAddress);
router.get('/get', verifyToken, getAddressByUserId);
router.put('/update/:addressId', updateAddress);
router.put('/select', selectAddress);
router.delete('/delete/:id', deleteAddress);
module.exports = router;