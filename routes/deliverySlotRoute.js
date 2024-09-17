const express = require('express');

const {
    addDeliverySlot,
    getDeliverySlots,
    updateDeliverySlot,
    deleteDeliverySlot,
    getDeliverySlotsByDeliveryType,
    getDeliverySlotsByDeliveryDate
} = require("../controllers/deliverySlotController");

const router = express.Router();

router.post('/add', addDeliverySlot);
router.get('/get', getDeliverySlots);
router.put('/update/:id', updateDeliverySlot);
router.delete('/delete/:id', deleteDeliverySlot);
router.get('/getslot', getDeliverySlotsByDeliveryType);
router.get('/getslotbydate', getDeliverySlotsByDeliveryDate);
module.exports = router;