const { Organizer, User, sequelize } = require('../models');
const { sendResponse } = require('./response');
const validator = require('validator');
const { sendStatusUpdateEmail } = require('../utils/emailService');

// מחזיר רשימת מארגנים מאושרים לציבור
const getPublicOrganizers = async (req, res) => {
    try {
        const organizers = await Organizer.findAll({
            where: { verificationStatus: 'approved' },
            include: [{
                model: User,
                attributes: ['fullName', 'email'], // רק מידע בסיסי
            }],
            attributes: [
                'id',
                'companyName',
                'companyDescription',
                'website',
                'logoUrl',
                'socialLinks'
            ]
        });

        return sendResponse(res, true, 'Organizers retrieved successfully', organizers);
    } catch (error) {
        console.error('❌ Error fetching organizers:', error);
        return sendResponse(res, false, 'Failed to fetch organizers', null, error.message, 500);
    }
};

// מחזיר רשימת מארגנים מלאה לאדמין
const getAllOrganizersAdmin = async (req, res) => {
    try {
        const organizers = await Organizer.findAll({
            include: [{
                model: User,
                attributes: ['id', 'fullName', 'email', 'phoneNumber', 'status', 'createdAt']
            }],
            attributes: {
                exclude: ['adminNotes'] // לא כולל הערות פנימיות
            }
        });

        return sendResponse(res, true, 'All organizers retrieved successfully', organizers);
    } catch (error) {
        console.error('❌ Error fetching organizers for admin:', error);
        return sendResponse(res, false, 'Failed to fetch organizers', null, error.message, 500);
    }
};

// קבלת פרטי מארגן ציבוריים
const getPublicOrganizerById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const organizer = await Organizer.findOne({
            where: { 
                id,
                verificationStatus: 'approved'
            },
            include: [{
                model: User,
                attributes: ['fullName', 'email']
            }],
            attributes: [
                'id',
                'companyName',
                'companyDescription',
                'website',
                'logoUrl',
                'socialLinks',
                'contactEmail',
                'contactPhone'
            ]
        });

        if (!organizer) {
            return sendResponse(res, false, 'Organizer not found', null, 'Not found', 404);
        }

        return sendResponse(res, true, 'Organizer details retrieved successfully', organizer);
    } catch (error) {
        console.error('❌ Error fetching organizer:', error);
        return sendResponse(res, false, 'Failed to fetch organizer details', null, error.message, 500);
    }
};

// קבלת כל פרטי המארגן (לאדמין או למארגן עצמו)
const getOrganizerFullDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const requestingUser = req.user;
        
        // בדיקה האם המשתמש הוא אדמין או המארגן עצמו
        const isAdmin = requestingUser.userType === 'admin';
        const isOwnOrganizer = await Organizer.findOne({ 
            where: { id, userId: requestingUser.id }
        });

        if (!isAdmin && !isOwnOrganizer) {
            return sendResponse(res, false, 'Access denied', null, 'Unauthorized access', 403);
        }

        const organizer = await Organizer.findOne({
            where: { id },
            include: [{
                model: User,
                attributes: ['id', 'fullName', 'email', 'phoneNumber', 'status', 'createdAt']
            }]
        });

        if (!organizer) {
            return sendResponse(res, false, 'Organizer not found', null, 'Not found', 404);
        }

        // הסרת הערות אדמין אם המשתמש אינו אדמין
        const responseData = organizer.toJSON();
        if (!isAdmin) {
            delete responseData.adminNotes;
        }

        return sendResponse(res, true, 'Organizer full details retrieved successfully', responseData);
    } catch (error) {
        console.error('❌ Error fetching organizer details:', error);
        return sendResponse(res, false, 'Failed to fetch organizer details', null, error.message, 500);
    }
};

// עדכון פרטי מארגן (על ידי המארגן עצמו)
const updateOrganizerDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const requestingUser = req.user;

        // וידוא שזה המארגן עצמו
        const organizer = await Organizer.findOne({ 
            where: { 
                id, 
                userId: requestingUser.id 
            }
        });

        if (!organizer) {
            return sendResponse(res, false, 'Access denied or organizer not found', null, 'Unauthorized access', 403);
        }

        // שדות שמארגן רשאי לעדכן
        const allowedUpdates = {
            companyDescription: req.body.companyDescription,
            website: req.body.website,
            logoUrl: req.body.logoUrl,
            socialLinks: req.body.socialLinks,
            contactEmail: req.body.contactEmail,
            contactPhone: req.body.contactPhone,
            contactPersonName: req.body.contactPersonName
        };

        // הסרת שדות לא מוגדרים
        Object.keys(allowedUpdates).forEach(key => 
            allowedUpdates[key] === undefined && delete allowedUpdates[key]
        );

        // וולידציה בסיסית
        if (allowedUpdates.website && !validator.isURL(allowedUpdates.website)) {
            return sendResponse(res, false, 'Invalid website URL', null, 'Validation error', 400);
        }
        if (allowedUpdates.logoUrl && !validator.isURL(allowedUpdates.logoUrl)) {
            return sendResponse(res, false, 'Invalid logo URL', null, 'Validation error', 400);
        }
        if (allowedUpdates.contactEmail && !validator.isEmail(allowedUpdates.contactEmail)) {
            return sendResponse(res, false, 'Invalid contact email', null, 'Validation error', 400);
        }
        if (allowedUpdates.contactPhone && !validator.isMobilePhone(allowedUpdates.contactPhone, 'he-IL')) {
            return sendResponse(res, false, 'Invalid phone number', null, 'Validation error', 400);
        }

        // עדכון הפרטים
        await organizer.update(allowedUpdates);

        return sendResponse(res, true, 'Organizer details updated successfully', organizer);
    } catch (error) {
        console.error('❌ Error updating organizer:', error);
        return sendResponse(res, false, 'Failed to update organizer details', null, error.message, 500);
    }
};

/**
 * Update organizer status (admin only)
 */
const updateOrganizerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { verificationStatus, adminNotes } = req.body;

        if (!['pending', 'approved', 'rejected'].includes(verificationStatus)) {
            return sendResponse(res, false, 'Invalid status', null, 'Validation error', 400);
        }

        const organizer = await Organizer.findByPk(id);
        if (!organizer) {
            return sendResponse(res, false, 'Organizer not found', null, 'Not found', 404);
        }

        // Start a transaction
        const t = await sequelize.transaction();

        try {
            // Update organizer status
            await organizer.update({
                verificationStatus,
                adminNotes: adminNotes || organizer.adminNotes
            }, { transaction: t });

            // Update user status based on organizer status
            const user = await User.findByPk(organizer.userId);
            
            let userStatus;
            switch (verificationStatus) {
                case 'approved':
                    userStatus = 'active';
                    break;
                case 'pending':
                    userStatus = 'pending';
                    break;
                case 'rejected':
                    userStatus = 'active'; // משתמש תמיד נשאר active במקרה של דחייה
                    break;
            }

            await user.update({ 
                status: userStatus 
            }, { transaction: t });

            // If everything went well, commit the transaction
            await t.commit();

            // Send email notification
            await sendStatusUpdateEmail(user.email, verificationStatus);

            return sendResponse(res, true, 'Organizer status updated successfully', {
                organizer: {
                    id: organizer.id,
                    verificationStatus: organizer.verificationStatus,
                    adminNotes: organizer.adminNotes
                },
                user: {
                    id: user.id,
                    status: userStatus
                }
            });

        } catch (error) {
            // If there was an error, rollback the transaction
            await t.rollback();
            throw error;
        }
    } catch (error) {
        console.error('❌ Error updating organizer status:', error);
        return sendResponse(res, false, 'Failed to update organizer status', null, error.message, 500);
    }
};

module.exports = {
    getPublicOrganizers,
    getAllOrganizersAdmin,
    getPublicOrganizerById,
    getOrganizerFullDetails,
    updateOrganizerDetails,
    updateOrganizerStatus
}; 