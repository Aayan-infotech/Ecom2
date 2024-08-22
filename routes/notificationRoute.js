const express = require('express');
const router = express.Router();
const { getNotification, markAsRead, deleteNotifications } = require('../controllers/notificationController');

router.get('/get', getNotification);
router.put('/:notificationId/markAsRead', markAsRead);
router.delete('/delete/:id', deleteNotifications);

module.exports = router;
