const Voucher = require("../models/voucherModel");
const createError = require("../middleware/error");

const addVoucher = async(req, res, next) => {
    try{
        const { code, discountValue, expiryDate, useLimit } = req.body;

        if(!code || !discountValue || !expiryDate){
            return(400, "All fields are required!");
        }

        const currentDate = new Date().toISOString().split('T')[0];
        if(currentDate > expiryDate){
            return next(createError(400, "Voucher cannot be added for date in past!"))
        }

        const newVoucher = new Voucher({
            code,
            discountValue,
            expiryDate,
            useLimit
        });

        await newVoucher.save();

        return res.status(201).json({
            success: true,
            status: 201,
            message: "Voucher added suuccessfully!",
            voucher: newVoucher
        });
    }
    catch(error){
        return next(createError(500, "Something went wrong!"));
    }
};

// get voucher
const getVoucher = async(req, res, next) => {
    try{
        const voucher = await Voucher.find();

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Voucher recieved succcessfully!",
            data: voucher
        });
    }
    catch(error){
        return next(createError(500, "Something went wrong!"));
    }
};

// apply voucher
const applyVoucher = async(req, res, next) => {
    try{
        const { code, purchaseAmount } = req.body;

        if( !code || !purchaseAmount ){
            return next(createError(400, "All fields are required!"));
        }

        const voucher = await Voucher.findOne({ code, isActive: true});

        if(!voucher){
            return next(createError(404, "Voucher not found or inactive!"));
        }

        if(new Date() > new Date(voucher.expiryDate)){
            return next(createError(400, "Voucher has expired!"));
        }


        const discountedAmount = purchaseAmount - voucher.discountValue;

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Voucher applied successfully!",
            discountedAmount: discountedAmount > 0 ? discountedAmount : 0,
        });
    }
    catch(error){
        return next(createError(500, "Something went wrong!"));
    }
};

// delete Voucher
const deleteVoucher = async(req, res, next) => {
    try{
        const { id } = req.params

        const voucher = await Voucher.findByIdAndDelete(id);

        if(!voucher){
            return next(createError(404, "Voucher not found!"));
        }

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Voucher deleted successfully!"
        });
    }
    catch(error){
        return next(createError(500, "Something went wrong!"));
    }
};

module.exports = {
    addVoucher,
    applyVoucher,
    getVoucher,
    deleteVoucher
};