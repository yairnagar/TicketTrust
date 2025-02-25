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
      eventDate, 
      location, 
      startTime, 
      endTime,
      ticketPrice,
      totalTickets,
      category 
    } = req.body;

    // בדיקת שדות חובה
    if (!eventName || !eventDate || !location || !startTime || !endTime || !ticketPrice || !totalTickets || !category) {
      return sendResponse(res, false, 'Missing required fields', null, 'Validation error', 400);
    }

    // וולידציה של מיקום
    if (!location.city || !location.address || !location.venue) {
      return sendResponse(res, false, 'Location must include city, address and venue', null, 'Invalid location data', 400);
    }

    // וולידציה של תאריך ושעה
    const eventDateTime = new Date(eventDate);
    const now = new Date();

    if (eventDateTime < now) {
      return sendResponse(res, false, 'Event date must be in the future', null, 'Invalid event date', 400);
    }

    // וולידציה של מחיר כרטיס
    if (ticketPrice < 0) {
      return sendResponse(res, false, 'Ticket price cannot be negative', null, 'Invalid ticket price', 400);
    }

    // וולידציה של כמות כרטיסים
    if (totalTickets < 1) {
      return sendResponse(res, false, 'Total tickets must be at least 1', null, 'Invalid tickets amount', 400);
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

    if (event.status === 'approved') {
      const restrictedFields = ['eventDate', 'location', 'startTime', 'endTime', 'totalTickets'];
      const hasRestrictedChanges = restrictedFields.some(field => req.body[field] !== undefined);

      if (hasRestrictedChanges) {
        return sendResponse(
          res, 
          false, 
          'Cannot modify critical details of an approved event', 
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