const express = require("express");

const {
    addSubcategory,
    getAllSubcategory,
    getSubcategoryById,
    updateSubcategory,
    deleteSubcategory,
    toggleVisibility
} = require("../controllers/subcategoryController");


const router = express.Router();


router.post('/add', addSubcategory);
router.get('/getall', getAllSubcategory);
router.get('/get/:id', getSubcategoryById);
router.put('/update/:id', updateSubcategory);
router.delete('/delete/:id', deleteSubcategory);
router.patch('/visibility/:subcategoryId', toggleVisibility);

module.exports = router;