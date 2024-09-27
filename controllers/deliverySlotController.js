const DeliverySlot = require('../models/deliverySlotModel')
const Product = require('../models/productModel')
const createError = require('../middleware/error')

const addDeliverySlot = async(req, res, next) => {
    try{
        const { deliveryType, date, timePeriod, deliveryCharge } = req.body;

        // If no date is provided, use the current date
        const slotDate = date || new Date().toISOString().split('T')[0];

        if (!date) {
            return next(createError(400, "All fields are required!"));
        }

        const currentDate = new Date().toISOString().split('T')[0];
        if (new Date(slotDate) < new Date(currentDate)) {
            return next(createError(400, "Slot cannot be added for a past date!"));
        }

        // Format of the date has to be kept in mind
        const newSlot = new DeliverySlot({
            deliveryType,
            date,
            timePeriod,
            deliveryCharge
        });

        await newSlot.save();

        return res.status(201).json({
            success: true,
            status: 201,
            message: "Delivery slot added successfully!",
            data: newSlot
        })
    }
    catch(error){
        console.error('Error adding delivery slot:', error);
        return next(createError(500, "Something went wrong!"));
    }
};

// get all delivery slot
const getDeliverySlots = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;  // Default to page 1 if not provided
        const limit = parseInt(req.query.limit) || 10;  // Default to 10 slots per page
        const skip = (page - 1) * limit;  // Calculate the number of documents to skip

        // Fetch the total count of delivery slots (without pagination)
        const totalSlots = await DeliverySlot.countDocuments();

        // Fetch the paginated delivery slots
        const slots = await DeliverySlot.find()
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Delivery slots retrieved successfully!",
            totalSlots,  // Send total number of slots (for frontend to calculate total pages)
            currentPage: page,
            totalPages: Math.ceil(totalSlots / limit),  // Calculate the total number of pages
            data: slots
        });
    } catch (error) {
        return next(createError(500, "Something went wrong!"));
    }
};


// get delivery slots by date
const getDeliverySlotsByDeliveryDate = async(req, res, next) => {
    try{
        const { date } = req.body;

        const slots = await DeliverySlot.find({date});

        // If no date is provided, use the current date
        const slotDate = date || new Date(date).toISOString().split('T')[0];
        if (!slots || slots.length === 0) {
            return next(createError(404, "Slots not found!"));
        }

        const currentDate = new Date().toISOString().split('T')[0];
        if (new Date(slotDate) < new Date(currentDate)) {
            return next(createError(400, "Past date!"));
        }

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Delivery slots fetched successfully!",
            data: slots
        })
    }
    catch(error){
        console.error("Error in getting the delivery slots", error);
        return next(createError(500, "Something went wrong!"));
    }
}

// get delivery slot by delivery type
const getDeliverySlotsByDeliveryType = async (req, res, next) => {
    try {
        const { deliveryType } = req.body; // assuming a GET request with deliveryType as a query parameter


        const slots = await DeliverySlot.find({deliveryType});

        if (!slots || slots.length === 0) {
            return next(createError(404, "Slots not found!"));
        }

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Delivery slots retrieved successfully!",
            data: slots
        });
    } catch (error) {
        console.error('Error retrieving delivery slots:', error);
        return next(createError(500, "Something went wrong!"));
    }
};

// update delivery slot
const updateDeliverySlot = async(req, res, next) => {
    try{
        const { id } = req.params;
        updates = req.body;

        const slot = await DeliverySlot.findByIdAndUpdate(id, updates, {new: true});

        if(!slot){
            return next(createError(404, "Slot not found!"));
        }

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Slot updated successfully!",
            data: slot
        });

    }
    catch(error){
        return next(createError(500, "Something went wrong!"));
    }
};

// delete delivery slot
const deleteDeliverySlot = async(req, res, next) => {
    try{
        const { id } = req.params
        const slot = await DeliverySlot.findByIdAndDelete(id);

        if(!slot){
            return next(createError(404, "Slot not found!"));
        }

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Slot deleted successfully!"
        });
    }
    catch(error){
        return next(createError(500, "Something went wrong!"));
    }
};

module.exports = {
    addDeliverySlot,
    getDeliverySlots,
    updateDeliverySlot,
    deleteDeliverySlot,
    getDeliverySlotsByDeliveryType,
    getDeliverySlotsByDeliveryDate
}
