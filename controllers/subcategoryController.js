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


// Function to toggle the visibility of a subcategory
const toggleVisibility = async (req, res) => {
    try {
        const subcategoryId = req.params.id;
        const subcategory = await Subcategory.findById(subcategoryId);

        if (!subcategory) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }

        // Toggle the isVisible field
        subcategory.isVisible = !subcategory.isVisible;
        await subcategory.save();

        return res.status(200).json({
            success: true,
            status: 200,
            message: `Subcategory visibility updated to ${subcategory.isVisible}`,
            subcategory
        });
    } catch (error) {
        return res.status(500).json({ error: 'Error updating visibility' });
    }
};

// Update subcategory visibility
const updateSubcategoryVisibility = async (req, res) => {
    try {
        const { subcategoryId } = req.params;
        const { menuVisible } = req.body;

        const updatedSubcategory = await Subcategory.findByIdAndUpdate(
            subcategoryId,
            { menuVisible },
            { new: true }
        );

        if (!updatedSubcategory) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }

        res.status(200).json(updatedSubcategory);
    } catch (error) {
        res.status(500).json({ message: 'Error updating subcategory visibility', error });
    }
};

// Get visible subcategories
const getVisibleSubcategories = async (req, res) => {
    try {
        const visibleSubcategories = await Subcategory.find({ menuVisible: true });
        res.status(200).json(visibleSubcategories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching visible subcategories', error });
    }
};




module.exports = {
    addSubcategory,
    getAllSubcategory,
    getSubcategoryById,
    updateSubcategory,
    deleteSubcategory,
    toggleVisibility,
    updateSubcategoryVisibility,
    getVisibleSubcategories
};