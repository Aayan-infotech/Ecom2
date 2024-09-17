const Notification = require('../models/notificationModel');
const createError = require('../middleware/error')


const sendEmail = async (to, subject, text) => {
    try {
        // Email validation
        if (!validator.isEmail(to)) {
            throw new Error("Invalid email format");
        }

        const mailTransporter = nodemailer.createTransport({
            service: "GMAIL",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailDetails = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            text: text
        };

        await mailTransporter.sendMail(mailDetails);
        console.log("Email sent successfully!");
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};


// Fetch all notification
const getNotification = async(req, res, next) => {
    try {
        const notifications = await Notification.find().sort({createdAt: -1});
        
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Notifications fetched successfully!",
            data: notifications
        });
    }
    catch(error){
        console.error("Error in fetching notification", error);
        return next(createError(500, "Something went wrong!"));
    }
}

const markAsRead = async(req, res, next) => {
    try{
        const { notificationId } = req.params;
        const notification = await Notification.findById(notificationId);

        if(!notification){
            return next(createError(404, "Notification not found!"));
        }

        notification.status = 'read';

        await notification.save();

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Notification read!",
            data: notification
        });
    }
    catch(error){
        console.error("Error in reading notification", error);
        return next(createError(500, "Something went wrong!"));
    }
}

const deleteNotifications = async(req, res, next) => {
    try{
        const { id } = req.params;
        const notification = await Notification.findByIdAndDelete(id);

        if(!notification){
            return next(createError(404, "Notification not found!"));
        }

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Notification deleted successfully!"
        });
    }
    catch(error){
        console.error("Notification cannot be deleted!");
        return next(createError(500, "Something went wrong!"));
    }
}

module.exports = {
    getNotification,
    markAsRead,
    deleteNotifications
}