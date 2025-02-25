const { User, Wallet, Ticket, Event, Marketplace, TransactionWallet, SupportTicket } = require('../models');
const redisClient = require('../utils/redis');
const { sendOTP } = require('../utils/emailService');
const validator = require('validator');
const { sendResponse } = require('./response');

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = `userProfile:${userId}`;

    const cachedProfile = await redisClient.get(cacheKey);
    if (cachedProfile) {
      console.log('📦 Using cached profile data');
      return sendResponse(res, true, 'Profile retrieved from cache', JSON.parse(cachedProfile));
    }

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['passwordHash'] }
    });

    if (!user) {
      return sendResponse(res, false, 'User not found', null, 'Invalid user ID', 404);
    }

    await redisClient.set(cacheKey, JSON.stringify(user), { EX: 600 });
    return sendResponse(res, true, 'Profile retrieved successfully', user);

  } catch (error) {
    console.error('❌ Error fetching profile:', error);
    return sendResponse(res, false, 'Failed to fetch profile', null, error.message, 500);
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, phoneNumber, email } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return sendResponse(res, false, 'User not found', null, 'Invalid user ID', 404);
    }

    let requiresOTP = false;

    if (email && email !== user.email) {
      if (!validator.isEmail(email)) {
        return sendResponse(res, false, 'Invalid email format', null, 'Email validation failed', 400);
      }
      
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return sendResponse(res, false, 'Email already in use', null, 'Duplicate email', 400);
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await redisClient.set(`emailOTP:${email}`, otp, { EX: 300 });
      await sendOTP(email, otp);
      requiresOTP = true;
    }

    if (fullName) user.fullName = fullName;
    if (phoneNumber) {
      if (!validator.isMobilePhone(phoneNumber, 'he-IL')) {
        return sendResponse(res, false, 'Invalid phone number', null, 'Phone validation failed', 400);
      }
      user.phoneNumber = phoneNumber;
    }

    await user.save();
    await redisClient.del(`userProfile:${userId}`);

    return sendResponse(res, true, 
      requiresOTP ? 'Profile updated. Verify email with OTP.' : 'Profile updated successfully',
      user
    );

  } catch (error) {
    console.error('❌ Error updating profile:', error);
    return sendResponse(res, false, 'Failed to update profile', null, error.message, 500);
  }
};

const verifyEmailChange = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, otp } = req.body;

    if (!email || !otp) {
      return sendResponse(res, false, 'Email and OTP are required', null, 'Missing required fields', 400);
    }

    const storedOtp = await redisClient.get(`emailOTP:${email}`);
    if (!storedOtp || storedOtp !== otp) {
      return sendResponse(res, false, 'Invalid or expired OTP', null, 'OTP validation failed', 400);
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return sendResponse(res, false, 'User not found', null, 'Invalid user ID', 404);
    }

    user.email = email;
    await user.save();

    await redisClient.del(`emailOTP:${email}`);
    await redisClient.del(`userProfile:${userId}`);

    return sendResponse(res, true, 'Email updated successfully', user);

  } catch (error) {
    console.error('❌ Error verifying email change:', error);
    return sendResponse(res, false, 'Failed to verify email change', null, error.message, 500);
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const wallet = await Wallet.findOne({ where: { userId } });
    if (wallet && parseFloat(wallet.balance) > 0) {
      return sendResponse(res, false, 'Withdraw funds before deleting your account', null, 'Non-zero balance', 400);
    }

    const activeEvents = await Event.findOne({ where: { organizerId: userId, status: 'approved' } });
    if (activeEvents) {
      return sendResponse(res, false, 'Cancel active events before deleting your account', null, 'Active events exist', 400);
    }

    const activeListings = await Marketplace.findOne({ where: { sellerId: userId, status: 'listed' } });
    if (activeListings) {
      return sendResponse(res, false, 'Cancel ticket sales before deleting your account', null, 'Active listings exist', 400);
    }

    await Promise.all([
      Wallet.destroy({ where: { userId } }),
      Ticket.destroy({ where: { ownerId: userId } }),
      Marketplace.destroy({ where: { sellerId: userId } }),
      TransactionWallet.destroy({ where: { userId } }),
      SupportTicket.destroy({ where: { userId } }),
      User.destroy({ where: { id: userId } })
    ]);

    await redisClient.set(`blacklist:${userId}`, 'true', { EX: 3600 * 24 });
    return sendResponse(res, true, 'User account deleted successfully');

  } catch (error) {
    console.error('❌ Error deleting user:', error);
    return sendResponse(res, false, 'Failed to delete user account', null, error.message, 500);
  }
};

module.exports = { 
  getProfile, 
  updateProfile, 
  verifyEmailChange, 
  deleteUser
};
