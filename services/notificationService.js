const Notification = require('../models/notificationModel');

const createNotification = async(title, body) => {
    try{
        const notification = await Notification.create({title, body});
        return notification;
    }
    catch(error){
        console.error('Error creating notification:', error.message);
        throw error;
    }
};

module.exports = { createNotification }