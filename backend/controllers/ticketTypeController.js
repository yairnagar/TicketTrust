const { TicketType, Event, Organizer } = require('../models');
const { sendResponse } = require('./response');

/**
 * יצירת סוג כרטיס חדש
 * @route POST /api/events/:eventId/ticket-types
 */
const createTicketType = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { 
      name, 
      description, 
      price, 
      quantity, 
      saleStartTime, 
      saleEndTime, 
      maxPerUser,
      benefits,
      imageUrl,
      videoUrl,
      seatingInfo
    } = req.body;

    // בדיקת קיום האירוע
    const event = await Event.findByPk(eventId);
    if (!event) {
      return sendResponse(res, false, 'Event not found', null, 'Not found', 404);
    }

    // בדיקת הרשאות - רק מארגן האירוע יכול להוסיף סוגי כרטיסים
    const organizer = await Organizer.findOne({ 
      where: { 
        userId: req.user.id,
        id: event.organizerId
      }
    });

    if (!organizer) {
      return sendResponse(res, false, 'Only the event organizer can create ticket types', null, 'Unauthorized', 403);
    }

    // בדיקה שהאירוע במצב מתאים
    if (event.status === 'cancelled' || event.status === 'completed') {
      return sendResponse(res, false, 'Cannot add ticket types to cancelled or completed events', null, 'Invalid operation', 400);
    }

    // יצירת סוג הכרטיס
    const ticketType = await TicketType.create({
      eventId,
      name,
      description,
      price,
      quantity,
      saleStartTime,
      saleEndTime,
      maxPerUser: maxPerUser || 10,
      benefits: benefits || {},
      status: 'draft',
      imageUrl,
      videoUrl,
      seatingInfo: seatingInfo || {},
      metadata: {}
    });

    // עדכון האירוע - סך הכרטיסים
    await event.update({
      totalTickets: event.totalTickets + quantity
    });

    return sendResponse(res, true, 'Ticket type created successfully', ticketType, null, 201);
  } catch (error) {
    console.error('❌ Error creating ticket type:', error);
    return sendResponse(res, false, 'Failed to create ticket type', null, error.message, 500);
  }
};

/**
 * עדכון סוג כרטיס
 * @route PUT /api/ticket-types/:id
 */
const updateTicketType = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      price, 
      quantity, 
      saleStartTime, 
      saleEndTime, 
      maxPerUser,
      benefits,
      status,
      imageUrl,
      videoUrl,
      seatingInfo
    } = req.body;

    // בדיקת קיום סוג הכרטיס
    const ticketType = await TicketType.findByPk(id);
    if (!ticketType) {
      return sendResponse(res, false, 'Ticket type not found', null, 'Not found', 404);
    }

    // בדיקת הרשאות
    const event = await Event.findByPk(ticketType.eventId);
    const organizer = await Organizer.findOne({ 
      where: { 
        userId: req.user.id,
        id: event.organizerId
      }
    });

    if (!organizer) {
      return sendResponse(res, false, 'Only the event organizer can update ticket types', null, 'Unauthorized', 403);
    }

    // בדיקה שהאירוע במצב מתאים
    if (event.status === 'cancelled' || event.status === 'completed') {
      return sendResponse(res, false, 'Cannot update ticket types for cancelled or completed events', null, 'Invalid operation', 400);
    }

    // חישוב ההפרש בכמות הכרטיסים
    const quantityDiff = quantity - ticketType.quantity;

    // עדכון סוג הכרטיס
    await ticketType.update({
      name: name || ticketType.name,
      description: description !== undefined ? description : ticketType.description,
      price: price || ticketType.price,
      quantity: quantity || ticketType.quantity,
      saleStartTime: saleStartTime || ticketType.saleStartTime,
      saleEndTime: saleEndTime || ticketType.saleEndTime,
      maxPerUser: maxPerUser || ticketType.maxPerUser,
      benefits: benefits || ticketType.benefits,
      status: status || ticketType.status,
      imageUrl: imageUrl !== undefined ? imageUrl : ticketType.imageUrl,
      videoUrl: videoUrl !== undefined ? videoUrl : ticketType.videoUrl,
      seatingInfo: seatingInfo || ticketType.seatingInfo
    });

    // עדכון סך הכרטיסים באירוע
    if (quantityDiff !== 0) {
      await event.update({
        totalTickets: event.totalTickets + quantityDiff
      });
    }

    return sendResponse(res, true, 'Ticket type updated successfully', ticketType, null, 200);
  } catch (error) {
    console.error('❌ Error updating ticket type:', error);
    return sendResponse(res, false, 'Failed to update ticket type', null, error.message, 500);
  }
};

/**
 * מחיקת סוג כרטיס
 * @route DELETE /api/ticket-types/:id
 */
const deleteTicketType = async (req, res) => {
  try {
    const { id } = req.params;

    // בדיקת קיום סוג הכרטיס
    const ticketType = await TicketType.findByPk(id);
    if (!ticketType) {
      return sendResponse(res, false, 'Ticket type not found', null, 'Not found', 404);
    }

    // בדיקת הרשאות
    const event = await Event.findByPk(ticketType.eventId);
    const organizer = await Organizer.findOne({ 
      where: { 
        userId: req.user.id,
        id: event.organizerId
      }
    });

    if (!organizer) {
      return sendResponse(res, false, 'Only the event organizer can delete ticket types', null, 'Unauthorized', 403);
    }

    // בדיקה שהאירוע במצב מתאים
    if (event.status === 'cancelled' || event.status === 'completed') {
      return sendResponse(res, false, 'Cannot delete ticket types for cancelled or completed events', null, 'Invalid operation', 400);
    }

    // בדיקה שאין כרטיסים שנמכרו מסוג זה
    if (ticketType.soldCount > 0) {
      return sendResponse(res, false, 'Cannot delete ticket type with sold tickets', null, 'Invalid operation', 400);
    }

    // עדכון סך הכרטיסים באירוע
    await event.update({
      totalTickets: event.totalTickets - ticketType.quantity
    });

    // מחיקת סוג הכרטיס
    await ticketType.destroy();

    return sendResponse(res, true, 'Ticket type deleted successfully', null, null, 200);
  } catch (error) {
    console.error('❌ Error deleting ticket type:', error);
    return sendResponse(res, false, 'Failed to delete ticket type', null, error.message, 500);
  }
};

/**
 * קבלת כל סוגי הכרטיסים לאירוע
 * @route GET /api/events/:eventId/ticket-types
 */
const getEventTicketTypes = async (req, res) => {
  try {
    const { eventId } = req.params;

    // בדיקת קיום האירוע
    const event = await Event.findByPk(eventId);
    if (!event) {
      return sendResponse(res, false, 'Event not found', null, 'Not found', 404);
    }

    // קבלת כל סוגי הכרטיסים לאירוע
    const ticketTypes = await TicketType.findAll({
      where: { eventId },
      order: [['price', 'ASC']]
    });

    return sendResponse(res, true, 'Ticket types retrieved successfully', ticketTypes, null, 200);
  } catch (error) {
    console.error('❌ Error retrieving ticket types:', error);
    return sendResponse(res, false, 'Failed to retrieve ticket types', null, error.message, 500);
  }
};

/**
 * קבלת סוג כרטיס ספציפי
 * @route GET /api/ticket-types/:id
 */
const getTicketType = async (req, res) => {
  try {
    const { id } = req.params;

    // קבלת סוג הכרטיס
    const ticketType = await TicketType.findByPk(id);
    if (!ticketType) {
      return sendResponse(res, false, 'Ticket type not found', null, 'Not found', 404);
    }

    return sendResponse(res, true, 'Ticket type retrieved successfully', ticketType, null, 200);
  } catch (error) {
    console.error('❌ Error retrieving ticket type:', error);
    return sendResponse(res, false, 'Failed to retrieve ticket type', null, error.message, 500);
  }
};

/**
 * פרסום סוג כרטיס (שינוי סטטוס ל-active)
 * @route POST /api/ticket-types/:id/publish
 */
const publishTicketType = async (req, res) => {
  try {
    const { id } = req.params;

    // בדיקת קיום סוג הכרטיס
    const ticketType = await TicketType.findByPk(id);
    if (!ticketType) {
      return sendResponse(res, false, 'Ticket type not found', null, 'Not found', 404);
    }

    // בדיקת הרשאות
    const event = await Event.findByPk(ticketType.eventId);
    const organizer = await Organizer.findOne({ 
      where: { 
        userId: req.user.id,
        id: event.organizerId
      }
    });

    if (!organizer) {
      return sendResponse(res, false, 'Only the event organizer can publish ticket types', null, 'Unauthorized', 403);
    }

    // בדיקה שהאירוע במצב מתאים
    if (event.status !== 'published') {
      return sendResponse(res, false, 'Cannot publish ticket types for unpublished events', null, 'Invalid operation', 400);
    }

    // עדכון סטטוס סוג הכרטיס
    await ticketType.update({
      status: 'active'
    });

    // עדכון סטטוס מכירת כרטיסים באירוע אם צריך
    if (event.ticketingStatus === 'draft') {
      await event.update({
        ticketingStatus: 'on_sale'
      });
    }

    return sendResponse(res, true, 'Ticket type published successfully', ticketType, null, 200);
  } catch (error) {
    console.error('❌ Error publishing ticket type:', error);
    return sendResponse(res, false, 'Failed to publish ticket type', null, error.message, 500);
  }
};

module.exports = {
  createTicketType,
  updateTicketType,
  deleteTicketType,
  getEventTicketTypes,
  getTicketType,
  publishTicketType
}; 