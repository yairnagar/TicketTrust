const { Admin, User } = require('../models');
const jwt = require('jsonwebtoken');
const redisClient = require('../utils/redis');
const { sendResponse } = require('../controllers/response');

/**
 * ✅ Middleware לווידוא שהמשתמש המחובר הוא אדמין
 */
const verifyAdmin = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token || !token.startsWith('Bearer ')) {
      return sendResponse(res, false, 'Unauthorized, no token provided', null, 'Missing token', 401);
    }

    token = token.split(' ')[1];

    const isBlacklisted = await redisClient.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return sendResponse(res, false, 'Token is blacklisted. Please log in again.', null, 'Invalid token', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return sendResponse(res, false, 'User not found', null, 'Invalid user', 401);
    }

    // בדיקה אם המשתמש קיים בטבלת האדמינים
    const admin = await Admin.findOne({ where: { userId: user.id } });

    if (!admin) {
      return sendResponse(res, false, 'Access denied. Admins only.', null, 'Unauthorized access', 403);
    }

    // הוספת פרטי המשתמש והאדמין לבקשה
    req.user = user;
    req.admin = admin;
    
    next();
  } catch (error) {
    console.error('❌ Admin Verification Error:', error);
    if (error.name === 'JsonWebTokenError') {
      return sendResponse(res, false, 'Invalid token', null, 'Token validation failed', 401);
    }
    if (error.name === 'TokenExpiredError') {
      return sendResponse(res, false, 'Token expired', null, 'Token expired', 401);
    }
    return sendResponse(res, false, 'Server error', null, error.message, 500);
  }
};

/**
 * ✅ Middleware לווידוא שהמשתמש המחובר הוא סופר-אדמין
 */
const isSuperAdmin = async (req, res, next) => {
  if (!req.admin || req.admin.role !== 'superadmin') {
    return sendResponse(res, false, 'Only superadmins can access this resource', null, 'Unauthorized access', 403);
  }
  next();
};

module.exports = { verifyAdmin, isSuperAdmin };
