const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyAdmin, isSuperAdmin } = require('../middleware/adminMiddleware');

// נתיבים לניהול מארגנים
router.get('/organizers/pending', verifyAdmin, adminController.getPendingOrganizers);
router.put('/organizers/:id/approve', verifyAdmin, adminController.approveOrganizer);
router.put('/organizers/:id/reject', verifyAdmin, adminController.rejectOrganizer);

// נתיבים לניהול אדמינים - רק סופר-אדמין יכול לגשת
router.get('/admins', verifyAdmin, isSuperAdmin, adminController.getAllAdmins);
router.get('/admins/:id', verifyAdmin, adminController.getAdminById);
router.put('/admins/:id', verifyAdmin, isSuperAdmin, adminController.updateAdmin);
router.delete('/admins/:id', verifyAdmin, isSuperAdmin, adminController.deleteAdmin);
router.post('/admins', verifyAdmin, isSuperAdmin, adminController.registerAdmin);

// יצירת אדמין ראשון במערכת (ללא אימות - רק אם אין אדמינים במערכת)
router.post('/first-admin', adminController.createFirstAdmin);

module.exports = router;
