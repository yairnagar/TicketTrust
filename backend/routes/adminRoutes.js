const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/adminMiddleware');
const { approveOrganizer, rejectOrganizer, getPendingOrganizers } = require('../controllers/adminController');

router.get('/organizers/pending', verifyAdmin, getPendingOrganizers);
router.put('/organizers/:id/approve', verifyAdmin, approveOrganizer);
router.put('/organizers/:id/reject', verifyAdmin, rejectOrganizer);

module.exports = router;
