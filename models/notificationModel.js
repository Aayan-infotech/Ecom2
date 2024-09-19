const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new mongoose.Schema({
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    title: { type: String },
    body: { type: String },
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