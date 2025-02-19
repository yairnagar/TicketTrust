const express = require('express');
const { registerUser, loginUser, verifyOTP , logoutUser, resetPasswordRequest, resetPassword, changePassword } = require('../controllers/authController');
const { loginLimiter,passwordChangeLimiter } = require('../middleware/rateLimitMiddleware');
const { protect } = require('../middleware/authMiddleware');    
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginLimiter, loginUser);
router.post('/verify-otp', verifyOTP);
router.post('/logout', protect, logoutUser);
router.post('/reset-password-request', resetPasswordRequest);   
router.post('/reset-password', resetPassword);
router.post('/change-password', protect, passwordChangeLimiter, changePassword);
module.exports = router;
