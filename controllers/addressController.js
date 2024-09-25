const Address = require('../models/addressModel');
const User = require('../models/userModel');
const createError = require('../middleware/error');

const addAddress = async (req, res, next) => {
    try {
        const { receiverName, userId, area, houseNumber, state, city, pinCode, contactNumber, country } = req.body;

        if (!userId || !houseNumber || !state || !city || !pinCode || !contactNumber || !area) {
            return next(createError(400, "All fields are required!"));
        }

        const newAddress = new Address({
            receiverName,
            user: userId,
            area,
            houseNumber,
            state,
            city,
            pinCode,
            contactNumber,
            country
        });

        await newAddress.save();

        return res.status(201).json({
            success: true,
            status: 201,
            message: "Address added successfully!",
            data: newAddress
        })
    }
    catch (error) {
        return next(createError(500, "Something went wrong!"))
    }
};

// get address by user id
// const getAddressByUserId = async (req, res, next) => {
//     try {
//         const { userId } = req.params;

//         const addresses = await Address.find({ user: userId });

//         if (!addresses.length) {
//             return next(createError(404, "No addresses found for this user!"));
//         }

//         return res.status(200).json({
//             success: true,
//             status: 200,
//             message: "Address retrieved successfully!",
//             data: addresses
//         })

//     }
//     catch (error) {
//         return next(createError(500, "Something went wrong!"));
//     }
// };

const getAddressByUserId = async (req, res, next) => {
    try {
        let userId;

        // Extract the token from cookies
        const token = req.headers['authorization']?.split(' ')[1];

        if (token) {
            // Verify the token if it's available
            const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';
            const decoded = jwt.verify(token, jwtSecret);
            userId = decoded.id; // Get the user ID from the token
        } else if (req.body.userId || req.params.userId) {
            // Fallback to using userId from request body or params if token is not present
            userId = req.body.userId || req.params.userId;
        } else {
            // If neither token nor userId is available, return an error
            return next(createError(401, "Access token or userId is missing!"));
        }

        // Fetch addresses by user ID
        const addresses = await Address.find({ user: userId });

        if (!addresses.length) {
            return next(createError(404, "No addresses found for this user!"));
        }

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Addresses retrieved successfully!",
            data: addresses
        });
    } catch (error) {
        // Handle unexpected errors
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return next(createError(401, "Invalid or expired token!"));
        }
        return next(createError(500, "Something went wrong!"));
    }
};


// Update address
const updateAddress = async (req, res, next) => {
    try {
        const { addressId } = req.params;
        const { houseNumber, state, city, pinCode, contactNumber } = req.body

        const updatedAddress = await Address.findByIdAndUpdate(
            addressId, {
            houseNumber,
            state,
            city,
            pinCode,
            contactNumber
        },
            { new: true }
        );

        if (!updatedAddress) {
            return next(createError(404, "Address not found!"));
        }

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Address updated successfully!",
            data: updatedAddress
        })
    }
    catch (error) {
        return next(createError(500, "Something went wrong!"));
    }
};

const selectAddress = async (req, res, next) => {
    try {
        const { userId, addressId } = req.body;

        // Check if the address belongs to the user
        const address = await Address.findOne({ _id: addressId, user: userId });
        if (!address) {
            return next(createError(404, "Address not found for this user!"));
        }



        // Update the user's selected address
        const user = await User.findByIdAndUpdate(
            userId,
            { selectedAddress: addressId },
            { new: true }
        );

        if (!user) {
            return next(createError(404, "User not found!"));
        }

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Selected address updated successfully!",
            data: user
        });
    } catch (error) {
        return next(createError(500, "Something went wrong!"));
    }
};

// delete address
const deleteAddress = async(req, res, next) => {
    try{
        const { id } = req.params;
        const address = await Address.findByIdAndDelete(id);

        if(!address){
            return next(createError(500, "Address not found!"));
        }

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Address deleted successfully!"
        })
    }
    catch(error){
        return next(createError(500, "Something went wrong!"));
    }
}

module.exports = {
    addAddress,
    getAddressByUserId,
    updateAddress,
    selectAddress,
    deleteAddress
}