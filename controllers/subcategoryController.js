const Subcategory = require("../models/subcategoryModel");
const createError  = require("../middleware/error");
// const Category = require("../models/categoryModel");


// add subcategory
const addSubcategory = async(req, res, next) =>{
    try{
        const{ title, parentCategory, image } = req.body;

        if(!title || !parentCategory){
            return next(createError(401, "Enter title and Parent Category!"));
        }

        // existingCategory = await Category.findOne({parentCategory})

        existingSubcat = await Subcategory.findOne({title});
        if(existingSubcat){
            return next(createError(409, "Subcategory Already Exists!"))
        }

        const newSubcategory = new Subcategory({
            title,
            parentCategory,
            image
        });

        await newSubcategory.save();

        return res.status(201).json({
            success: true,
            status: 201,
            message: "Subcategory Added Successfully!",
            data: newSubcategory
        })
    }
    catch(error){
        return next(createError(500, "Something went wrong!"))
    }
};

// Get All Subcategories
const getAllSubcategory = async (req, res, next) => {
    try {
        const subcategories = await Subcategory.find().populate('parentCategory');
        return res.status(200).json({
            success: true,
            status: 200,
            message: "All Subcategories!",
            data: subcategories
        });
    } catch (error) {
        console.error('Error in fetching subcategories', error);
        return next(createError(500, 'Something went wrong'));
    }
};

// Get Subcategory by ID
const getSubcategoryById = async (req, res, next) => {
    try {
        const subcategory = await Subcategory.findById(req.params.id).populate('parentCategory');
        if (!subcategory) {
            return next(createError(404, 'Subcategory not found'));
        }
        return res.status(200).json({
            success: true,
            status: 200,
            message:  "Subcategory received",
            data: subcategory
        });
    } catch (error) {
        console.error('Error in fetching the subcategory', error);
        return next(createError(500, 'Something went wrong'));
    }
};

// Update Subcategory
const updateSubcategory = async (req, res, next) => {
    try {
        const { title, parentCategory, image } = req.body;

        const subcategory = await Subcategory.findById(req.params.id);
        if (!subcategory) {
            return next(createError(404, 'Subcategory not found'));
        }

        subcategory.title = title || subcategory.title;
        subcategory.parentCategory = parentCategory || subcategory.parentCategory;
        subcategory.image = image || subcategory.image;

        await subcategory.save();
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Subcategory Updated Successfully!",
            data: subcategory
        });
    } catch (error) {
        console.error('Error in updating the subcategory', error);
        return next(createError(500, 'Something went wrong'));
    }
};

// Delete Subcategory
const deleteSubcategory = async (req, res, next) => {
    try {
        const subcategory = await Subcategory.findByIdAndDelete(req.params.id);
        if (!subcategory) {
            return next(createError(404, 'Subcategory not found'));
        }
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Subcategory Deleted Successfully!"
        });
    } catch (error) {
        console.error('Error in deleting the subcategory', error);
        return next(createError(500, 'Something went wrong'));
    }
};




module.exports = {
    addSubcategory,
    getAllSubcategory,
    getSubcategoryById,
    updateSubcategory,
    deleteSubcategory
};