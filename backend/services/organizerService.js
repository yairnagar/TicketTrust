const { Organizer } = require('../models');

const createOrganizer = async ({ userId, companyName, companyRegistrationNumber, companyAddress, contactPersonName, contactEmail, contactPhone }) => {
  try {
    const organizer = await Organizer.create({
      userId,
      companyName,
      companyRegistrationNumber,
      companyAddress,
      contactPersonName,
      contactEmail,
      contactPhone,
      verificationStatus: 'pending'
    });

    console.log(`✅ Organizer record created for user ID: ${userId}`);
    return organizer;
  } catch (error) {
    console.error('❌ Error creating organizer record:', error);
    throw new Error('Failed to create organizer record.');
  }
};

module.exports = { createOrganizer };
