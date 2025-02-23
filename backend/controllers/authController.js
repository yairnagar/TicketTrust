const { User, Wallet, Notification, Ticket, Event, TransactionWallet, Admin } = require('../models');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const validator = require('validator');
const crypto = require('crypto');
const redisClient = require('../utils/redis');
const { sendOTP, sendPasswordResetEmail } = require('../utils/emailService');
const { createUserWallet } = require('../services/walletService');
const { createOrganizer } = require('../services/organizerService');
const { saveKycDocuments } = require('../services/kycService');
const { sendAdminNotification } = require('../services/notificationService');
const { sendResponse } = require('./response');

const registerUser = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, userType } = req.body;

    if (!fullName || !email || !phoneNumber || !password || !userType) {
      return sendResponse(res, false, 'All fields are required', null, 'Missing required fields', 400);
    }

    if (!validator.isEmail(email)) {
      return sendResponse(res, false, 'Invalid email format', null, 'Email validation failed', 400);
    }

    if (!validator.isMobilePhone(phoneNumber, 'he-IL')) {
      return sendResponse(res, false, 'Invalid phone number', null, 'Phone validation failed', 400);
    }

    if (!validator.isStrongPassword(password, { minLength: 8, minNumbers: 1, minSymbols: 1 })) {
      return sendResponse(res, false, 'Password must be at least 8 characters, contain a number, and a special character', null, 'Password validation failed', 400);
    }

    const existingUser = await User.findOne({ where: { email } });
    const existingPhone = await User.findOne({ where: { phoneNumber } });
    if (existingUser || existingPhone) {
      return sendResponse(res, false, 'Email or phone number already in use', null, 'Duplicate user data', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ fullName, email, phoneNumber, passwordHash: hashedPassword, userType });
    const wallet = await createUserWallet(newUser.id);

    return sendResponse(res, true, 'User registered successfully', {
      token: generateToken(newUser),
      walletAddress: wallet.blockchainAddress
    }, null, 201);

  } catch (error) {
    console.error('Server Error:', error);
    return sendResponse(res, false, 'Server error', null, error.message, 500);
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendResponse(res, false, 'Email and password are required', null, 'Missing credentials', 400);
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return sendResponse(res, false, 'Invalid email or password', null, 'Authentication failed', 400);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return sendResponse(res, false, 'Invalid email or password', null, 'Authentication failed', 400);
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    console.log(`🔑 Generated OTP: ${otp} for ${email}`);

    await redisClient.set(`otp:${email}`, otp, { EX: 300 });
    await sendOTP(email, otp);

    return sendResponse(res, true, 'OTP sent to email. Please verify.');

  } catch (error) {
    console.error('❌ Server Error:', error);
    return sendResponse(res, false, 'Server error', null, error.message, 500);
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const storedOtp = await redisClient.get(`otp:${email}`);
    if (!storedOtp) {
      return sendResponse(res, false, 'OTP expired or invalid', null, 'Invalid OTP', 400);
    }

    if (storedOtp !== otp) {
      return sendResponse(res, false, 'Invalid OTP', null, 'OTP mismatch', 400);
    }

    await redisClient.del(`otp:${email}`);
    const user = await User.findOne({ where: { email } });
    const token = generateToken(user);

    return sendResponse(res, true, 'Login successful', { token });

  } catch (error) {
    console.error('❌ Server Error:', error);
    return sendResponse(res, false, 'Server error', null, error.message, 500);
  }
};

const logoutUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return sendResponse(res, false, 'No token provided', null, 'Missing token', 400);
    }
    await redisClient.set(`blacklist:${token}`, 'true', { EX: 3600 * 24 });

    return sendResponse(res, true, 'Logged out successfully');
  } catch (error) {
    console.error('❌ Server Error:', error);
    return sendResponse(res, false, 'Server error', null, error.message, 500);
  }
};

const resetPasswordRequest = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validator.isEmail(email)) {
      return sendResponse(res, false, 'Invalid email format', null, 'Email validation failed', 400);
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return sendResponse(res, false, 'User with this email does not exist', null, 'User not found', 400);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    await redisClient.set(`resetToken:${email}`, resetToken, { EX: 900 });

    await sendPasswordResetEmail(email, resetToken);

    return sendResponse(res, true, 'Password reset link sent to your email');

  } catch (error) {
    console.error('❌ Server Error:', error);
    return sendResponse(res, false, 'Server error', null, error.message, 500);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, token } = req.body;

    if (!newPassword || !validator.isStrongPassword(newPassword, { minLength: 8, minNumbers: 1, minSymbols: 1 })) {
      return sendResponse(res, false, 'Password must be at least 8 characters, contain a number, and a special character', null, 'Password validation failed', 400);
    }

    const storedToken = await redisClient.get(`resetToken:${email}`);
    if (!storedToken || storedToken !== token) {
      return sendResponse(res, false, 'Invalid or expired token', null, 'Token validation failed', 400);
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return sendResponse(res, false, 'User not found', null, 'Invalid user', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ passwordHash: hashedPassword });
    await redisClient.del(`resetToken:${email}`);

    return sendResponse(res, true, 'Password reset successfully');

  } catch (error) {
    console.error('❌ Server Error:', error);
    return sendResponse(res, false, 'Server error', null, error.message, 500);
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendResponse(res, false, 'Current and new password are required', null, 'Missing password data', 400);
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return sendResponse(res, false, 'User not found', null, 'Invalid user', 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return sendResponse(res, false, 'Incorrect current password', null, 'Password mismatch', 400);
    }

    if (!validator.isStrongPassword(newPassword, { minLength: 8, minNumbers: 1, minSymbols: 1 })) {
      return sendResponse(res, false, 'New password must be strong (min 8 chars, include numbers and special characters)', null, 'Password validation failed', 400);
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    await redisClient.del(`blacklist:${req.headers.authorization?.split(' ')[1]}`);

    return sendResponse(res, true, 'Password changed successfully');
  } catch (error) {
    console.error('❌ Error changing password:', error);
    return sendResponse(res, false, 'Server error', null, error.message, 500);
  }
};

const registerOrganizer = async (req, res) => {
  try {
    const { 
      fullName, email, phoneNumber, password, 
      companyName, companyRegistrationNumber, companyAddress, 
      contactPersonName, contactEmail, contactPhone 
    } = req.body;

    // בדיקת שדות חובה
    if (!fullName || !email || !phoneNumber || !password || !companyName || 
        !companyRegistrationNumber || !companyAddress || !contactPersonName || 
        !contactEmail || !contactPhone) {
      return sendResponse(res, false, 'All fields are required', null, 'Missing required fields', 400);
    }

    // וולידציות
    if (!validator.isEmail(email) || !validator.isEmail(contactEmail)) {
      return sendResponse(res, false, 'Invalid email format', null, 'Email validation failed', 400);
    }

    if (!validator.isMobilePhone(phoneNumber, 'he-IL') || !validator.isMobilePhone(contactPhone, 'he-IL')) {
      return sendResponse(res, false, 'Invalid phone number', null, 'Phone validation failed', 400);
    }

    if (!validator.isStrongPassword(password, { minLength: 8, minNumbers: 1, minSymbols: 1 })) {
      return sendResponse(res, false, 'Password must be at least 8 characters, contain a number, and a special character', null, 'Password validation failed', 400);
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return sendResponse(res, false, 'Email already registered', null, 'Duplicate email', 400);
    }

    // יצירת משתמש חדש
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      fullName,
      email,
      phoneNumber,
      passwordHash: hashedPassword,
      userType: 'organizer',
      status: 'pending'
    });

    console.log('✅ Organizer user created successfully:', newUser.dataValues);

    // יצירת מארגן
    const organizer = await createOrganizer({
      userId: newUser.id,
      companyName,
      companyRegistrationNumber,
      companyAddress,
      contactPersonName,
      contactEmail,
      contactPhone
    });

    // שמירת מסמכי KYC
    if (req.files && req.files.length > 0) {
      await saveKycDocuments(organizer.id, req.files);
    }

    // יצירת ארנק למארגן
    const wallet = await createUserWallet(newUser.id);

    // שליחת התראה לאדמין
    await sendAdminNotification(
      "New Organizer Request",
      `A new organizer "${companyName}" has registered and is pending approval.`,
      newUser.id
    );

    return sendResponse(res, true, 'Organizer registered successfully. Waiting for admin approval.', {
      token: generateToken(newUser),
      walletAddress: wallet.blockchainAddress
    }, null, 201);

  } catch (error) {
    console.error("❌ Error registering organizer:", error);
    return sendResponse(res, false, 'Server error', null, error.message, 500);
  }
};

/**
 * ✅ יצירת משתמש אדמין חדש (רק סופר-אדמין יכול להוסיף אדמין)
 */
const registerAdmin = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, role, permissions } = req.body;
    
    if (!req.admin || req.admin.role !== 'superadmin') {
      return sendResponse(res, false, 'Only superadmins can register new admins', null, 'Unauthorized access', 403);
    }

    if (!fullName || !email || !phoneNumber || !password || !role) {
      return sendResponse(res, false, 'All fields are required', null, 'Missing required fields', 400);
    }

    if (!validator.isEmail(email)) {
      return sendResponse(res, false, 'Invalid email format', null, 'Email validation failed', 400);
    }

    if (!validator.isMobilePhone(phoneNumber, 'he-IL')) {
      return sendResponse(res, false, 'Invalid phone number', null, 'Phone validation failed', 400);
    }

    if (!['superadmin', 'moderator', 'reviewer'].includes(role)) {
      return sendResponse(res, false, 'Invalid admin role', null, 'Role validation failed', 400);
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return sendResponse(res, false, 'Email already in use', null, 'Duplicate email', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      fullName,
      email,
      phoneNumber,
      passwordHash: hashedPassword,
      userType: 'admin'
    });

    const newAdmin = await Admin.create({
      userId: newUser.id,
      role,
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
    
module.exports = { registerUser, loginUser, verifyOTP , logoutUser, resetPasswordRequest, resetPassword, changePassword, registerOrganizer, registerAdmin};  