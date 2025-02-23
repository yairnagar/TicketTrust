const { Organizer } = require('../models');

const approveOrganizer = async (organizerId) => {
  const organizer = await Organizer.findByPk(organizerId);
  if (!organizer) throw new Error('Organizer not found');

  organizer.verificationStatus = 'approved';
  await organizer.save();
  return organizer;
};

const rejectOrganizer = async (organizerId, reason) => {
  const organizer = await Organizer.findByPk(organizerId);
  if (!organizer) throw new Error('Organizer not found');

  organizer.verificationStatus = 'rejected';
  organizer.adminNotes = reason;
  await organizer.save();
  return organizer;
};

const getPendingOrganizers = async () => {
  return await Organizer.findAll({ where: { verificationStatus: 'pending' } });
};

module.exports = { approveOrganizer, rejectOrganizer, getPendingOrganizers };
