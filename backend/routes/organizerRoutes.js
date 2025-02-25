const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/adminMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { 
    getPublicOrganizers, 
    getAllOrganizersAdmin,
    getPublicOrganizerById,
    getOrganizerFullDetails,
    updateOrganizerDetails,
    updateOrganizerStatus
} = require('../controllers/organizerController');

// נקודות קצה ציבוריות
router.get('/public', protect, getPublicOrganizers);
router.get('/public/:id', protect, getPublicOrganizerById);

// נקודות קצה מאובטחות
router.get('/details/:id', protect, getOrganizerFullDetails);
router.get('/admin/all', verifyAdmin, getAllOrganizersAdmin);

// עדכון פרטים על ידי המארגן
router.put('/details/:id', protect, updateOrganizerDetails);

// עדכון סטטוס על ידי אדמין
router.put('/admin/:id/status', verifyAdmin, updateOrganizerStatus);

module.exports = router; 