const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { registerUser, loginUser, verifyOTP , logoutUser, resetPasswordRequest, resetPassword, changePassword, registerOrganizer, registerAdmin} = require('../controllers/authController');
const { loginLimiter,passwordChangeLimiter } = require('../middleware/rateLimitMiddleware');
const { protect } = require('../middleware/authMiddleware');    
const { verifyAdmin } = require('../middleware/adminMiddleware');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginLimiter, loginUser);
router.post('/verify-otp', verifyOTP);
router.post('/logout', protect, logoutUser);
router.post('/reset-password-request', resetPasswordRequest);   
router.post('/reset-password', resetPassword);
router.post('/change-password', protect, passwordChangeLimiter, changePassword);
router.post('/organizers/register', upload.array('kycDocuments', 5), registerOrganizer);
router.post('/admins/register', registerAdmin);
module.exports = router;
