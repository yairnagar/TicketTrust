const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();
const { getProfile, updateProfile, verifyEmailChange, deleteUser, getUserWallet } = require('../controllers/userController');

router.get('/me', protect, getProfile);
router.put('/update-profile', protect, updateProfile);
router.post('/verify-email-change', protect, verifyEmailChange);
router.delete('/delete', protect, deleteUser);
router.get('/wallet', protect, getUserWallet);
module.exports = router;
