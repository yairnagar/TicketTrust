// eventMiddleware.js

const { Event, Organizer } = require('../models');
const { sendResponse } = require('../controllers/response');

// בדיקת הרשאות - האם המשתמש הוא המארגן של האירוע או אדמין
const isEventOwnerOrAdmin = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    const event = await Event.findByPk(eventId, {
      include: [{
        model: Organizer,
        as: 'organizer',
        attributes: ['userId', 'verificationStatus']
      }]
    });

    if (!event) {
      return sendResponse(res, false, 'Event not found', null, 'Invalid event ID', 404);
    }

    const isAdmin = req.user.userType === 'admin';
    const isOwner = event.organizer.userId === userId;

    if (!isAdmin && !isOwner) {
      return sendResponse(res, false, 'Access denied', null, 'Unauthorized access', 403);
    }

    // שמירת האירוע ב-request להמשך שימוש
    req.event = event;
    next();
  } catch (error) {
    console.error('❌ Event Authorization Error:', error);
    return sendResponse(res, false, 'Server error', null, error.message, 500);
  }
};

// וולידציה של נתוני האירוע
const validateEventData = async (req, res, next) => {
  try {
    const { 
      eventName, 
      location, 
      startDate, 
      endDate,
      capacity,
      category 
    } = req.body;

    // בדיקת שדות חובה
    if (!eventName || !location || !startDate || !endDate || !capacity) {
      return sendResponse(res, false, 'Missing required fields', null, 'Validation error', 400);
    }

    // וולידציה של מיקום (אם מיקום הוא אובייקט)
    if (typeof location === 'object') {
      return sendResponse(res, false, 'Location must be a string', null, 'Invalid location data', 400);
    }

    // וולידציה של תאריך ושעה
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    const now = new Date();

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return sendResponse(res, false, 'Invalid date format', null, 'Invalid date format', 400);
    }

    if (startDateTime < now) {
      return sendResponse(res, false, 'Event start date must be in the future', null, 'Invalid event date', 400);
    }

    if (endDateTime <= startDateTime) {
      return sendResponse(res, false, 'End date must be after start date', null, 'Invalid event dates', 400);
    }

    // וולידציה של קיבולת
    if (isNaN(capacity) || capacity < 1) {
      return sendResponse(res, false, 'Capacity must be at least 1', null, 'Invalid capacity', 400);
    }

    next();
  } catch (error) {
    console.error('❌ Event Validation Error:', error);
    return sendResponse(res, false, 'Server error', null, error.message, 500);
  }
};

// בדיקה האם ניתן לערוך את האירוע
const canModifyEvent = async (req, res, next) => {
  try {
    const event = req.event; // מהמידלוור הקודם

    if (event.status === 'published') {
      const restrictedFields = ['eventDate', 'location', 'startTime', 'endTime', 'totalTickets'];
      const hasRestrictedChanges = restrictedFields.some(field => req.body[field] !== undefined);

      if (hasRestrictedChanges) {
        return sendResponse(
          res, 
          false, 
          'Cannot modify critical details of a published event', 
          null, 
          'Invalid modification', 
          400
        );
      }
    }

    if (event.status === 'cancelled') {
      return sendResponse(
        res, 
        false, 
        'Cannot modify cancelled event', 
        null, 
        'Invalid modification', 
        400
      );
    }

    next();
  } catch (error) {
    console.error('❌ Event Modification Check Error:', error);
    return sendResponse(res, false, 'Server error', null, error.message, 500);
  }
};

module.exports = {
  isEventOwnerOrAdmin,
  validateEventData,
  canModifyEvent
};