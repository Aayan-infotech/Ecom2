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
const getNotification = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;  // Default to page 1
        const limit = parseInt(req.query.limit) || 10;  // Default to 10 notifications per page
        const skip = (page - 1) * limit;  // Calculate how many notifications to skip

        // Fetch the total count of notifications (without pagination)
        const totalNotifications = await Notification.countDocuments();

        // Fetch the paginated notifications, sorted by creation date
        const notifications = await Notification.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Notifications fetched successfully!",
            totalNotifications,  // Send the total number of notifications (for frontend pagination)
            currentPage: page,
            totalPages: Math.ceil(totalNotifications / limit),  // Calculate total number of pages
            data: notifications
        });
    } catch (error) {
        console.error("Error in fetching notifications", error);
        return next(createError(500, "Something went wrong!"));
    }
};

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