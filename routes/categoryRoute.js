const express = require("express");

const {
    addCategory,
    getCategory,
    deleteCategory,
    getCategoryById,
    updateCategory,
} = require("../controllers/categoryController");


const router = express.Router();


router.post('/add', addCategory);
router.get('/get', getCategory);
router.delete('/delete/:id', deleteCategory);
router.get('/get/:id', getCategoryById);
router.put('/update/:id', updateCategory);

module.exports = router;