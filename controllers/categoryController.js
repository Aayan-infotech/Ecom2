const Category = require('../models/categoryModel');
const createError = require('../middleware/error');
const Subcategory = require('../models/subcategoryModel')


// create category
const addCategory = async(req, res, next) => {
    try{
        const { categoryName, image } = req.body;

        if(!categoryName){
            return next(createError(400, 'Enter Category Name'))
        }

        const existingProduct = await Category.findOne( {title: categoryName} );
        if(existingProduct){
            return next(createError(409, 'The Product Category Already Exists!'))
        }

        const newCategory = new Category({
           title: categoryName,
           image
        });

        await newCategory.save();
        return res.status(201).json({
            success: true,
            status: 201,
            message: "Category Added Successfully!",
            data: newCategory
        });
    }

    catch(error) {
        console.error('Error in adding the category', error);
        return next(createError(500, 'Something went wrong'));
    }
};

// get categories
const getCategory = async(req, res, next) => {
    try{
        const category = await Category.find();
        return res.status(200).json({
            success: true,
            status: 200,
            message: "All Categories",
            data: category
        })
    }
    catch(error){
        return next(createError(500, "Something went wrong"));
    }
};

// get Category by id
// const getCategoryById = async(req, res, next) =>{
//     try{
//         const { categoryId } = req.params;

//         const category = await Category.findById(categoryId);

//         return res.status(200).json({
//             success: true,
//             status: 200,
//             message: "Categories!",
//             data: category
//         });
//     }
//     catch(error){
//         console.error("Error getting category by id", error);
//         return next(createError(500, "Something went wrong!"));
//     }
// };

// delete categories
const deleteCategory = async(req, res, next) =>{
    try{
        const { id } = req.params;
        const category = await Category.findByIdAndDelete(id);

        if(!category){
            return next(createError(404, "Category Not Found"))
        }
        return res.status(200).json({
            success:true,
            status: 200,
            message: "Category Deleted Successfully!"

        })
    }
    catch(error){
        return next(createError(500, "Something went wrong"));
    }
};

// Get Category by ID with Subcategories
const getCategoryById = async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        // console.log(categoryId)
        // Fetch the category by ID
        const category = await Category.findById(categoryId);
        if (!category) {
            return next(createError(404, 'Category not found'));
        }

        // Fetch all subcategories that belong to the category
        const subcategories = await Subcategory.find({ parentCategory: categoryId });

        // Combine category and subcategories into one response
        return res.status(200).json({
            success: true,
            status: 200,
            message: "All Subcategories Successfully fetchecd!",
            data: category,
            subcategories
        });
    } catch (error) {
        console.error('Error in fetching category with subcategories', error);
        return next(createError(500, 'Something went wrong'));
    }
};


// update category
const updateCategory = async(req, res, next) => {
    try {
        const { id } = req.params; // Category ID to update
        const { categoryName, image } = req.body;

        // Validate input
        if (!categoryName) {
            return next(createError(401, 'Enter Category Name'));
        }

        // Find the category by ID
        const category = await Category.findById(id);
        if (!category) {
            return next(createError(404, 'Category not found!'));
        }

        // Check if a category with the new name already exists (excluding the current one)
        const existingCategory = await Category.findOne({ title: categoryName, _id: { $ne: id } });
        if (existingCategory) {
            return next(createError(409, 'The Category Name Already Exists!'));
        }

        // Update the category fields
        category.title = categoryName;
        if (image) {
            category.image = image;
        }

        // Save the updated category
        await category.save();

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Category Updated Successfully!",
            data: category
        });
    } catch (error) {
        console.error('Error in updating the category', error);
        return next(createError(500, 'Something went wrong'));
    }
};




module.exports = {
    addCategory,
    getCategory,
    deleteCategory,
    getCategoryById,
    updateCategory
}