const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserSchema = mongoose.Schema(
    {
        userName: {
            type: String,
            required: false,
            unique: true
        },
        mobileNumber: {
            type: String,
            required: false,
        },
        age: {
            type: Number,
            required: false,
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Others'],
            required: false
        },
        email: {
            type: String,
            required: false,
            unique: true
        },
        password: {
            type: String,
            required: false
        },
        profileImage: {
            type: String,
            required: false
        },
        isBlocked: {
            type: Boolean,
            default: false
        },
        selectedAddress: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Address',
            required:false
        },
        // favorites: [
        //     {
        //         type: Schema.Types.ObjectId,
        //         ref: 'Outfitter' // Reference to the Outfitter model
        //     }
        // ],

        resetToken: String,

        resetTokenExpiration: Date,

        otp: { type: String },
        otpExpiration: { type: Date },

        isEmailVerified: {
            type: Boolean,
            default: false
        },
        deviceToken: {
            type: String,
            required: false,
        }
    },
    {
        timestamps: true
    }
);


module.exports = mongoose.model('User', UserSchema);