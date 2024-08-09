const express = require("express");

const {
    addToFavorites,
    removeFavorites,
    getAllFavorite
} = require("../controllers/favoriteController");

const router = express.Router();

router.post('/add', addToFavorites);
router.delete('/delete', removeFavorites);
router.get('/get/:id', getAllFavorite);

module.exports = router;