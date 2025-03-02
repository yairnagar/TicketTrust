const { Event, Organizer, User } = require('../models');
const { Op } = require('sequelize');
const { sendResponse } = require('../controllers/response');

/**
 * יצירת אירוע חדש
 * @route POST /events
 */
const createEvent = async (req, res) => {
  try {
    const { 
      eventName, 
      description, 
      location, 
      startDate,
      endDate,
      capacity,
      category,
      imageUrl,
      isPublic,
      totalTickets,
      venueDetails,
      doorsOpenTime,
      attendeeInstructions,
      cancellationPolicy,
      allowResale,
      ageRestriction,
      contactInfo,
      allowEarlyCheckIn,
      lateCheckInWindow,
      allowTicketTransfer,
      metadata
    } = req.body;
    
    // מציאת המארגן המשויך למשתמש
    const organizer = await Organizer.findOne({ 
      where: { 
        userId: req.user.id,
        verificationStatus: 'approved'
      }
    });

    if (!organizer) {
      return sendResponse(res, false, 'Only approved organizers can create events', null, 'Unauthorized', 403);
    }

    const event = await Event.create({
      organizerId: organizer.id,
      eventName,
      description,
      location,
      startDate,
      endDate,
      capacity,
      category,
      imageUrl,
      isPublic,
      totalTickets,
      venueDetails,
      doorsOpenTime,
      attendeeInstructions,
      cancellationPolicy,
      allowResale,
      ageRestriction,
      contactInfo,
      allowEarlyCheckIn,
      lateCheckInWindow,
      allowTicketTransfer,
      metadata,
      status: 'draft',
      ticketingStatus: 'draft',
      soldTickets: 0
    });

    return sendResponse(res, true, 'Event created successfully', event, null, 201);
  } catch (error) {
    console.error('❌ Error creating event:', error);
    return sendResponse(res, false, 'Failed to create event', null, error.message, 500);
  }
};

/**
 * קבלת רשימת אירועים עם אפשרויות סינון
 * @route GET /events
 */
const getEvents = async (req, res) => {
  try {
    const { 
      status, 
      date, 
      category, 
      organizer,
      minPrice,
      maxPrice,
      city 
    } = req.query;

    const where = {};

    // בניית תנאי החיפוש
    if (status) where.status = status;
    if (category) where.category = category;
    if (organizer) where.organizerId = organizer;
    if (date) {
      where.eventDate = {
        [Op.gte]: new Date(date)
      };
    }
    if (minPrice || maxPrice) {
      where.ticketPrice = {};
      if (minPrice) where.ticketPrice[Op.gte] = minPrice;
      if (maxPrice) where.ticketPrice[Op.lte] = maxPrice;
    }
    if (city) {
      where['location.city'] = city;
    }

    const events = await Event.findAll({
      where,
      include: [{
        model: Organizer,
        as: 'organizer',
        attributes: ['companyName', 'id'],
        include: [{
          model: User,
          attributes: ['fullName']
        }]
      }],
      order: [['startDate', 'ASC']],
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      }
    });

    return sendResponse(res, true, 'Events retrieved successfully', events);
  } catch (error) {
    console.error('❌ Error fetching events:', error);
    return sendResponse(res, false, 'Failed to fetch events', null, error.message, 500);
  }
};

/**
 * קבלת פרטי אירוע לפי מזהה
 * @route GET /events/:id
 */
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findByPk(id, {
      include: [{
        model: Organizer,
        as: 'organizer',
        attributes: ['companyName', 'id', 'contactEmail', 'contactPhone'],
        include: [{
          model: User,
          attributes: ['fullName']
        }]
      }]
    });

    if (!event) {
      return sendResponse(res, false, 'Event not found', null, 'Invalid event ID', 404);
    }

    // חישוב כמות כרטיסים זמינה
    const availableTickets = event.totalTickets - event.soldTickets;

    const eventData = {
      ...event.toJSON(),
      availableTickets
    };

    return sendResponse(res, true, 'Event retrieved successfully', eventData);
  } catch (error) {
    console.error('❌ Error fetching event:', error);
    return sendResponse(res, false, 'Failed to fetch event', null, error.message, 500);
  }
};

/**
 * עדכון פרטי אירוע
 * @route PUT /events/:id
 */
const updateEvent = async (req, res) => {
  try {
    const event = req.event; // מגיע מהמידלוור
    const updateData = req.body;
    
    await event.update(updateData);
    
    return sendResponse(res, true, 'Event updated successfully', event);
  } catch (error) {
    console.error('❌ Error updating event:', error);
    return sendResponse(res, false, 'Failed to update event', null, error.message, 500);
  }
};

/**
 * מחיקת אירוע
 * @route DELETE /events/:id
 */
const deleteEvent = async (req, res) => {
  try {
    const event = req.event; // מגיע מהמידלוור

    if (event.soldTickets > 0) {
      return sendResponse(
        res, 
        false, 
        'Cannot delete event with sold tickets', 
        null, 
        'Invalid operation', 
        400
      );
    }

    await event.destroy();
    
    return sendResponse(res, true, 'Event deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting event:', error);
    return sendResponse(res, false, 'Failed to delete event', null, error.message, 500);
  }
};

/**
 * עדכון סטטוס אירוע (רק לאדמין)
 * @route PATCH /events/:id/status
 */
const updateEventStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['draft', 'published', 'cancelled', 'completed'].includes(status)) {
      return sendResponse(res, false, 'Invalid status', null, 'Validation error', 400);
    }

    const event = await Event.findByPk(id);
    if (!event) {
      return sendResponse(res, false, 'Event not found', null, 'Invalid event ID', 404);
    }

    // בדיקה אם האירוע מפורסם לראשונה
    const isFirstPublish = event.status === 'draft' && status === 'published';

    // עדכון סטטוס האירוע
    await event.update({ status });
    
    // אם האירוע מפורסם לראשונה, פרסם את כל סוגי הכרטיסים במצב טיוטה
    if (isFirstPublish) {
      const { TicketType } = require('../models');
      
      // מצא את כל סוגי הכרטיסים במצב טיוטה של האירוע
      const draftTicketTypes = await TicketType.findAll({
        where: {
          eventId: id,
          status: 'draft'
        }
      });
      
      // פרסם כל סוג כרטיס
      for (const ticketType of draftTicketTypes) {
        await ticketType.update({ status: 'active' });
      }
      
      // עדכן את סטטוס מכירת הכרטיסים באירוע אם יש כרטיסים פעילים
      if (draftTicketTypes.length > 0) {
        await event.update({ ticketingStatus: 'on_sale' });
      }
      
      console.log(`✅ Published ${draftTicketTypes.length} ticket types automatically`);
    }
    
    // קבל את האירוע המעודכן עם כל המידע
    const updatedEvent = await Event.findByPk(id, {
      include: [
        {
          model: Organizer,
          as: 'organizer',
          attributes: ['companyName', 'id'],
          include: [
            {
              model: User,
              attributes: ['fullName']
            }
          ]
        }
      ]
    });
    
    return sendResponse(res, true, 'Event status updated successfully', updatedEvent);
  } catch (error) {
    console.error('❌ Error updating event status:', error);
    return sendResponse(res, false, 'Failed to update event status', null, error.message, 500);
  }
};

/**
 * קבלת כל האירועים של מארגן ספציפי
 * @route GET /events/organizer/:organizerId
 */
const getOrganizerEvents = async (req, res) => {
  try {
    const { organizerId } = req.params;
    const { status } = req.query;
    
    // מציאת המארגן
    const organizer = await Organizer.findByPk(organizerId);
    if (!organizer) {
      return sendResponse(res, false, 'Organizer not found', null, 'Invalid organizer ID', 404);
    }

    // בניית תנאי החיפוש
    const whereClause = { organizerId };
    
    // הוספת סינון לפי סטטוס אם צוין
    if (status && ['draft', 'published', 'cancelled', 'completed'].includes(status)) {
      whereClause.status = status;
    }

    // מציאת כל האירועים של המארגן
    const events = await Event.findAll({
      where: whereClause,
      include: [{
        model: Organizer,
        as: 'organizer',
        attributes: ['companyName', 'id'],
        include: [{
          model: User,
          attributes: ['fullName']
        }]
      }],
      order: [['startDate', 'ASC']],
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      }
    });

    // הוספת מידע על כמות כרטיסים זמינה
    const eventsWithAvailability = events.map(event => ({
      ...event.toJSON(),
      availableTickets: event.totalTickets - event.soldTickets
    }));

    return sendResponse(res, true, 'Organizer events retrieved successfully', eventsWithAvailability);
  } catch (error) {
    console.error('❌ Error fetching organizer events:', error);
    return sendResponse(res, false, 'Failed to fetch organizer events', null, error.message, 500);
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  updateEventStatus,
  getOrganizerEvents
};