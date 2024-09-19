const Favorite = require("../models/favoriteModel");
// const User = require("../models/userModel")
const createError = require("../middleware/error");

// add favorites
const addToFavorites = async(req, res, next) => {
    try{
        const { userId, productId } = req.body;

        if(!userId || !productId){
            return next(createError(400, "User ID and prodcut ID arer required!"));
        }

        let favorite = await Favorite.findOne({ user: userId });

        if(!favorite){
            favorite = new Favorite({ user: userId, products: [] });
        }

        if(favorite.products.includes(productId)) {
            return next(createError(409, "Product already in favorites!"))
        }

        favorite.products.push(productId);

        await favorite.save();

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Product added to favorites successfully!",
            data: favorite
        });
    }
    catch(error){
        return next(createError(500, "Something went wrong!"));
    }
};

// remove from favorites
const removeFavorites = async(req, res, next) => {
    try{
        const { userId, productId } = req.body;

        let favorite = await Favorite.findOne({user: userId});

        if(!favorite){
            return next(createError(404, "Favorites not found!"));
        }

        favorite.products = favorite.products.filter(p => p.toString() !== productId);

        await favorite.save();

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Favorites removed successfully!",
            data: favorite
        });
    }   
    catch(error){
        return next(createError(500, "Sommething went wrong!"))
    } 
};

// get all favorites
const getAllFavorite = async(req, res, next) => {
    try{
        const { id } = req.params;

        const favorite = await Favorite.findOne({ user : id }).populate('products');

        if(!favorite){
            return next(createError(404, "Favorite not found!"));
        }

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Favorites retrieved successfully!",
            data: favorite
        });
    }
    catch(error){
        return next(createError(500, "Something went wrong!"));
    }
};

module.exports = {
    addToFavorites,
    removeFavorites,
    getAllFavorite  
};