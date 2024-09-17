const express = require("express");
// const User = require('../models/userModel');

const { getAllUsers,
    getUser,
    deleteUser,
    updateUser,
    editUser,
    register,
    forgetPassword,
    resetPasswordUser,
    addFavorite,
    getFavorites,
    deleteAllUsers,
    updateProfile,
    changePassword,
    blockUser,
    unblockUser,
    exportUsersToExcel,
    importUsersFromExcel
} = require('../controllers/userController')


const upload = require("../middleware/upload")

const {
    verifyAdmin,
    verifyUser,
    verifyToken
} = require('../middleware/verifyToken');

const router = express.Router();

router.get('/export', exportUsersToExcel);


router.post('/register', register);
router.get('/:id', verifyUser, getUser);
router.get('/', verifyAdmin, getAllUsers);
router.put('/:id', verifyAdmin, updateUser);
router.delete('/:id', verifyAdmin, deleteUser);
router.post('/forgetpassword', forgetPassword);
router.post('/reset-password/:token', resetPasswordUser);
// Route to add an outfitter to favorites
router.post('/add-favorite/:outfitterId', verifyToken, addFavorite);
// Route to get user's favorites
router.get('/favorites/:userId', verifyToken, getFavorites);
// Route to edit user details
router.put('/edit/:id', verifyToken, editUser);

router.delete('/deleteAll', deleteAllUsers);

router.put('/update-profile/:userId', verifyToken, upload.single('profileImage'), updateProfile);
router.post('/change-password/:id', verifyToken, changePassword)

// Block user
router.put('/block/:id', blockUser);

// Unblock user
router.put('/unblock/:id', unblockUser);

// Middleware to handle file uploads
// router.use(fileUpload());

// router.get('/getAll', customerController.);
// router.post('/import', fileupload.single('file'), importUsers);
// router.get('/export', exportUsers);

module.exports = router;