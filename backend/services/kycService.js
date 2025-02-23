const { KycDocument } = require('../models');
const path = require('path');
const fs = require('fs');
const uploadDir = path.join(__dirname, '../uploads/kyc');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const saveKycDocuments = async (organizerId, files) => {
  try {
    if (!files || files.length === 0) {
      console.warn('⚠️ No KYC documents uploaded.');
      return;
    }

    const savedDocs = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(uploadDir, file.filename);
        fs.writeFileSync(filePath, file.buffer);

        return await KycDocument.create({
          organizerId,
          documentPath: filePath,
          status: 'pending'
        });
      })
    );

    console.log(`✅ KYC documents saved for organizer ID: ${organizerId}`);
    return savedDocs;
  } catch (error) {
    console.error('❌ Error saving KYC documents:', error);
    throw new Error('Failed to save KYC documents.');
  }
};

module.exports = { saveKycDocuments };
