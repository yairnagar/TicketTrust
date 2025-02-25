const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { verifyAdmin } = require('../middleware/adminMiddleware');
const { 
    getMyWallet, 
    getAllWallets,
    getWalletByUserId
} = require('../controllers/walletController');

// Get my wallet details
router.get('/me', protect, getMyWallet);

// Admin routes
router.get('/admin/all', verifyAdmin, getAllWallets);
router.get('/admin/user/:userId', verifyAdmin, getWalletByUserId);

module.exports = router; 