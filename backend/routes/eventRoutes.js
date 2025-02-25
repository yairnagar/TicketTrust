const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { verifyAdmin } = require('../middleware/adminMiddleware');
const { 
    isEventOwnerOrAdmin, 
    validateEventData, 
    canModifyEvent 
} = require('../middleware/eventMiddleware');
const { 
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    updateEventStatus,
    getOrganizerEvents
} = require('../controllers/eventController');

// נקודות קצה ציבוריות (דורשות אימות משתמש בסיסי)
router.get('/', protect, getEvents);
router.get('/:id', protect, getEventById);

// נקודות קצה למארגנים
router.post('/', 
    protect, 
    validateEventData, 
    createEvent
);

router.put('/:id',
    protect,
    isEventOwnerOrAdmin,
    validateEventData,
    canModifyEvent,
    updateEvent
);

router.delete('/:id',
    protect,
    isEventOwnerOrAdmin,
    deleteEvent
);

// נקודות קצה לאדמין
router.patch('/:id/status',
    protect,
    verifyAdmin,
    updateEventStatus
);

// הוספת נתיב חדש לקבלת אירועים של מארגן ספציפי
router.get('/organizer/:organizerId', protect, getOrganizerEvents);

module.exports = router; 