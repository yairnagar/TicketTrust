const { Organizer, Notification } = require('../models');
const { sendAdminNotification } = require('../services/notificationService');
const { sendResponse } = require('./response');

const getPendingOrganizers = async (req, res) => {
  try {
    const pendingOrganizers = await Organizer.findAll({ where: { verificationStatus: 'pending' } });
    return sendResponse(res, true, 'Pending organizers retrieved successfully', pendingOrganizers);
  } catch (error) {
    console.error('❌ Error fetching pending organizers:', error);
    return sendResponse(res, false, 'Failed to fetch pending organizers', null, error.message, 500);
  }
};

const approveOrganizer = async (req, res) => {
  try {
    const { id } = req.params;
    const organizer = await Organizer.findByPk(id);

    if (!organizer) {
      return sendResponse(res, false, 'Organizer not found', null, 'Organizer ID not found', 404);
    }

    if (organizer.verificationStatus === 'approved') {
      return sendResponse(res, false, 'Organizer is already approved', null, 'Invalid status change', 400);
    }

    organizer.verificationStatus = 'approved';
    await organizer.save();

    await sendAdminNotification(
      'Organizer Approved',
      `Organizer ${organizer.companyName} has been approved.`,
      organizer.userId
    );

    return sendResponse(res, true, 'Organizer approved successfully', organizer);
  } catch (error) {
    console.error('❌ Error approving organizer:', error);
    return sendResponse(res, false, 'Failed to approve organizer', null, error.message, 500);
  }
};

const rejectOrganizer = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const organizer = await Organizer.findByPk(id);

    if (!organizer) {
      return sendResponse(res, false, 'Organizer not found', null, 'Organizer ID not found', 404);
    }

    if (organizer.verificationStatus === 'rejected') {
      return sendResponse(res, false, 'Organizer has already been rejected', null, 'Invalid status change', 400);
    }

    organizer.verificationStatus = 'rejected';
    organizer.adminNotes = reason;
    await organizer.save();

    await sendAdminNotification(
      'Organizer Rejected',
      `Organizer ${organizer.companyName} was rejected. Reason: ${reason}`,
      organizer.userId
    );

    return sendResponse(res, true, 'Organizer rejected successfully', organizer);
  } catch (error) {
    console.error('❌ Error rejecting organizer:', error);
    return sendResponse(res, false, 'Failed to reject organizer', null, error.message, 500);
  }
};

module.exports = { approveOrganizer, rejectOrganizer, getPendingOrganizers };
