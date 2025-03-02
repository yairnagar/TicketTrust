const express = require('express');
const router = express.Router();
const ticketTypeController = require('../controllers/ticketTypeController');
const { protect } = require('../middleware/authMiddleware');

// נתיבים לניהול סוגי כרטיסים
router.post('/events/:eventId/types', protect, ticketTypeController.createTicketType);
router.get('/events/:eventId/types', ticketTypeController.getEventTicketTypes);
router.get('/types/:id', ticketTypeController.getTicketType);
router.put('/types/:id', protect, ticketTypeController.updateTicketType);
router.delete('/types/:id', protect, ticketTypeController.deleteTicketType);
router.post('/types/:id/publish', protect, ticketTypeController.publishTicketType);

module.exports = router; 