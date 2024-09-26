const express = require('express');
const router = express.Router();
const notificationModel=require('../models/notificationModel')
const { getNotification, markAsRead, deleteNotifications } = require('../controllers/notificationController');

router.get('/get', getNotification);
router.put('/:notificationId/markAsRead', markAsRead);
router.delete('/delete/:id', deleteNotifications);
// API to get notifications for a specific user by user ID
router.get('/notifications/:id', async (req, res) => {
    try {
      const result = await notificationModel.find({ userId: req.params.id });
      res.json({
        status: 200,
        msg: "Get all notifications",
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        error: error.message,
      });
    }
  });

module.exports = router;
