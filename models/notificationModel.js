const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    type : {
        type: String,
        required: false
    },
    message: {
        type: String,
        required: false
    },
    status: {
        type: String,
        default: 'unread' 
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', notificationSchema);