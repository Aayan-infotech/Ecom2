const Notification = require('../models/notificationModel');

const createNotification = async(type, message) => {
    try{
        const notification = await Notification.create({type, message});
        return notification;
    }
    catch(error){
        console.error('Error creating notification:', error.message);
        throw error;
    }
};

module.exports = { createNotification }