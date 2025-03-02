const { Organizer, Notification, Admin, User, Event } = require('../models');
const { sendAdminNotification } = require('../services/notificationService');
const { sendResponse } = require('./response');
const bcrypt = require('bcrypt');
const validator = require('validator');

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

/**
 * ✅ קבלת רשימת כל האדמינים במערכת (רק סופר-אדמין יכול לראות)
 */
const getAllAdmins = async (req, res) => {
  try {
    // בדיקה שהמשתמש הוא סופר-אדמין
    if (req.admin.role !== 'superadmin') {
      return sendResponse(res, false, 'Only superadmins can view all admins', null, 'Unauthorized access', 403);
    }

    const admins = await Admin.findAll({
      include: [{
        model: User,
        attributes: ['id', 'fullName', 'email', 'phoneNumber', 'status', 'createdAt']
      }]
    });

    return sendResponse(res, true, 'All admins retrieved successfully', admins);
  } catch (error) {
    console.error('❌ Error fetching admins:', error);
    return sendResponse(res, false, 'Failed to fetch admins', null, error.message, 500);
  }
};

/**
 * ✅ קבלת פרטי אדמין ספציפי
 */
const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // בדיקה שהמשתמש הוא סופר-אדמין או האדמין עצמו
    if (req.admin.role !== 'superadmin' && req.admin.id !== id) {
      return sendResponse(res, false, 'Unauthorized access', null, 'Permission denied', 403);
    }

    const admin = await Admin.findByPk(id, {
      include: [{
        model: User,
        attributes: ['id', 'fullName', 'email', 'phoneNumber', 'status', 'createdAt']
      }]
    });

    if (!admin) {
      return sendResponse(res, false, 'Admin not found', null, 'Invalid admin ID', 404);
    }

    return sendResponse(res, true, 'Admin details retrieved successfully', admin);
  } catch (error) {
    console.error('❌ Error fetching admin details:', error);
    return sendResponse(res, false, 'Failed to fetch admin details', null, error.message, 500);
  }
};

/**
 * ✅ עדכון פרטי אדמין (רק סופר-אדמין יכול לעדכן)
 */
const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, permissions, status } = req.body;
    
    // בדיקה שהמשתמש הוא סופר-אדמין
    if (req.admin.role !== 'superadmin') {
      return sendResponse(res, false, 'Only superadmins can update admins', null, 'Unauthorized access', 403);
    }

    const admin = await Admin.findByPk(id);
    if (!admin) {
      return sendResponse(res, false, 'Admin not found', null, 'Invalid admin ID', 404);
    }

    // עדכון פרטי האדמין
    if (role) admin.role = role;
    if (permissions) admin.permissions = permissions;
    
    await admin.save();

    // אם יש עדכון סטטוס, מעדכנים גם את המשתמש
    if (status) {
      const user = await User.findByPk(admin.userId);
      if (user) {
        user.status = status;
        await user.save();
      }
    }

    return sendResponse(res, true, 'Admin updated successfully', admin);
  } catch (error) {
    console.error('❌ Error updating admin:', error);
    return sendResponse(res, false, 'Failed to update admin', null, error.message, 500);
  }
};

/**
 * ✅ מחיקת אדמין (רק סופר-אדמין יכול למחוק)
 */
const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    // בדיקה שהמשתמש הוא סופר-אדמין
    if (req.admin.role !== 'superadmin') {
      return sendResponse(res, false, 'Only superadmins can delete admins', null, 'Unauthorized access', 403);
    }

    const admin = await Admin.findByPk(id);
    if (!admin) {
      return sendResponse(res, false, 'Admin not found', null, 'Invalid admin ID', 404);
    }

    // לא ניתן למחוק את עצמך
    if (admin.userId === req.user.id) {
      return sendResponse(res, false, 'Cannot delete your own admin account', null, 'Invalid operation', 400);
    }

    await admin.destroy();
    
    return sendResponse(res, true, 'Admin deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting admin:', error);
    return sendResponse(res, false, 'Failed to delete admin', null, error.message, 500);
  }
};

/**
 * ✅ יצירת משתמש אדמין חדש (רק סופר-אדמין יכול להוסיף אדמין)
 */
const registerAdmin = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, role, permissions } = req.body;
    

    if (!fullName || !email || !phoneNumber || !password || !role) {
      return sendResponse(res, false, 'All fields are required', null, 'Missing required fields', 400);
    }

    if (!validator.isEmail(email)) {
      return sendResponse(res, false, 'Invalid email format', null, 'Email validation failed', 400);
    }

    // בדיקת תפקיד תקף
    const validRoles = ['admin', 'moderator', 'reviewer']; // הגדר את התפקידים המותרים
    if (!validRoles.includes(role)) {
      return sendResponse(res, false, 'Invalid role. Must be one of: ' + validRoles.join(', '), null, 'Validation error', 400);
    }

    // בדיקת הרשאות תקפות (אם יש)
    if (permissions) {
      const validPermissions = ['manage_users', 'manage_events', 'manage_tickets', 'manage_finances', 'view_reports'];
      const invalidPermissions = permissions.filter(p => !validPermissions.includes(p));
      
      if (invalidPermissions.length > 0) {
        return sendResponse(res, false, `Invalid permissions: ${invalidPermissions.join(', ')}`, null, 'Validation error', 400);
      }
    }

    // בדיקה שהמייל לא קיים כבר
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return sendResponse(res, false, 'Email already in use', null, 'Email already registered', 400);
    }

    // יצירת משתמש חדש
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      fullName,
      email,
      phoneNumber,
      passwordHash,
      userType: 'admin',
      status: 'active'
    });

    // יצירת אדמין חדש
    const newAdmin = await Admin.create({
      userId: newUser.id,
      role: role || 'admin',
      permissions: permissions || null
    });

    return sendResponse(res, true, 'Admin registered successfully', {
      id: newAdmin.id,
      email: newUser.email,
      role: newAdmin.role
    }, null, 201);

  } catch (error) {
    console.error('❌ Error registering admin:', error);
    return sendResponse(res, false, 'Server error', null, error.message, 500);
  }
};

/**
 * ✅ Create the first admin in the system (only if no admins exist)
 */
const createFirstAdmin = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, secretKey } = req.body;
    
    // Check if the secret key matches the one in .env
    if (secretKey !== process.env.FIRST_ADMIN_SECRET_KEY) {
      return sendResponse(res, false, 'Invalid secret key', null, 'Unauthorized access', 403);
    }

    // Check if there are already admins in the system
    const adminCount = await Admin.count();
    if (adminCount > 0) {
      return sendResponse(res, false, 'An admin already exists in the system, cannot create first admin', null, 'Admin already exists', 400);
    }

    if (!fullName || !email || !phoneNumber || !password) {
      return sendResponse(res, false, 'All fields are required', null, 'Missing required fields', 400);
    }

    if (!validator.isEmail(email)) {
      return sendResponse(res, false, 'Invalid email format', null, 'Email validation failed', 400);
    }

    // בדיקה שהמייל לא קיים כבר
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return sendResponse(res, false, 'Email already in use', null, 'Email already registered', 400);
    }

    // יצירת משתמש חדש
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      fullName,
      email,
      phoneNumber,
      passwordHash,
      userType: 'admin',
      status: 'active'
    });

    const newAdmin = await Admin.create({
      userId: newUser.id,
      role: 'superadmin',
      permissions: null
    });

    return sendResponse(res, true, 'First admin created successfully', {
      id: newAdmin.id,
      email: newUser.email,
      role: newAdmin.role
    }, null, 201);

  } catch (error) {
    console.error('❌ Error creating first admin:', error);
    return sendResponse(res, false, 'Server error', null, error.message, 500);
  }
};

module.exports = { 
  approveOrganizer, 
  rejectOrganizer, 
  getPendingOrganizers,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  registerAdmin,
  createFirstAdmin,
};
