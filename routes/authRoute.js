const express = require('express');
const {login,registerAdmin, loginAdmin, sendEmail, resetPassword,verifyOTP, logout, sendVerificationEmail, verifyOtpForEmail } = require('../controllers/authController')

const{verifyToken} = require("../middleware/verifyToken")

//as User
const router = express.Router();

// for signup 

// router.post('/signup', signup);
router.post('/login', login);

//as Admin
router.post('/register-admin', registerAdmin);

// admin login
router.post('/login-admin', loginAdmin);

// guide login
// router.post('/login-guide', loginGuide);

//send reset emai
router.post('/send-email',sendEmail)

//Reset Password
router.post("/reset-password", resetPassword);
router.post("/verifyOTP", verifyOTP);

// POST /api/auth/logout
router.post('/logout', logout);


router.post('/send-verification-email', sendVerificationEmail);
router.get('/verify-otp', verifyOtpForEmail);


module.exports = router;