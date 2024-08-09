const express = require('express');

const {
    addVoucher,
    applyVoucher,
    getVoucher,
    deleteVoucher
} = require("../controllers/voucherController");

const router = express.Router();

router.post('/add', addVoucher);
router.post('/apply', applyVoucher);
router.get('/get', getVoucher);
router.delete('/delete/:id', deleteVoucher);

module.exports = router;