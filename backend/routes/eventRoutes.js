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

// הוספת נתיב לקבלת אירועים של מארגן ספציפי - חייב להיות לפני /:id
router.get('/organizer/:organizerId', protect, getOrganizerEvents);

// נתיב לקבלת אירוע ספציפי
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

module.exports = router; 