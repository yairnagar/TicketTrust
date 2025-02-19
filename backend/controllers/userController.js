const { User, Wallet, Ticket, Event, Marketplace, TransactionWallet, SupportTicket } = require('../models');
const redisClient = require('../utils/redis');
const { sendOTP } = require('../utils/emailService');
const validator = require('validator');



const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = `userProfile:${userId}`;

    const cachedProfile = await redisClient.get(cacheKey);
    if (cachedProfile) {
      console.log('📦 Using cached profile data');
      return res.status(200).json({ status: 'success', data: JSON.parse(cachedProfile) });
    }
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['passwordHash'] }
    });

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    await redisClient.set(cacheKey, JSON.stringify(user), { EX: 600 });

    res.status(200).json({ status: 'success', data: user });
  } catch (error) {
    console.error('❌ Error fetching profile:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};


const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, phoneNumber, email } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });

    let requiresOTP = false;

    if (email && email !== user.email) {
      if (!validator.isEmail(email)) {
        return res.status(400).json({ status: 'error', message: 'Invalid email format' });
      }
      
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) return res.status(400).json({ status: 'error', message: 'Email already in use' });

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await redisClient.set(`emailOTP:${email}`, otp, { EX: 300 });
      await sendOTP(email, otp);
      requiresOTP = true;
    }

    if (fullName) user.fullName = fullName;
    if (phoneNumber) {
      if (!validator.isMobilePhone(phoneNumber, 'he-IL')) {
        return res.status(400).json({ status: 'error', message: 'Invalid phone number' });
      }
      user.phoneNumber = phoneNumber;
    }

    await user.save();
    await redisClient.del(`userProfile:${userId}`);

    res.status(200).json({
      status: 'success',
      message: requiresOTP ? 'Profile updated. Verify email with OTP.' : 'Profile updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

const verifyEmailChange = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ status: 'error', message: 'Email and OTP are required' });
    }

    const storedOtp = await redisClient.get(`emailOTP:${email}`);
    if (!storedOtp || storedOtp !== otp) {
      return res.status(400).json({ status: 'error', message: 'Invalid or expired OTP' });
    }
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });

    user.email = email;
    await user.save();

    await redisClient.del(`emailOTP:${email}`); 
    await redisClient.del(`userProfile:${userId}`);

    res.status(200).json({ status: 'success', message: 'Email updated successfully' });
  } catch (error) {
    console.error('❌ Error verifying email change:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};



const deleteUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const wallet = await Wallet.findOne({ where: { userId } });
    if (wallet && parseFloat(wallet.balance) > 0) {
      return res.status(400).json({ message: 'Withdraw funds before deleting your account' });
    }
    const activeEvents = await Event.findOne({ where: { organizerId: userId, status: 'approved' } });
    if (activeEvents) {
      return res.status(400).json({ message: 'You have active events. Cancel them before deleting your account' });
    }
    const activeListings = await Marketplace.findOne({ where: { sellerId: userId, status: 'listed' } });
    if (activeListings) {
      return res.status(400).json({ message: 'Cancel your ticket sales before deleting your account' });
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

    res.status(200).json({ message: 'User account deleted successfully' });

  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



const getUserWallet = async (req, res) => {
  try {
      const userId = req.user.id;
      const wallet = await Wallet.findOne({ where: { userId } });

      if (!wallet) {
          return res.status(404).json({ message: "Wallet not found" });
      }
      const walletData = {
          address: wallet.blockchainAddress,
          balance: wallet.balance
      };

      res.status(200).json({ status: "success", wallet: walletData });

  } catch (error) {
      console.error("❌ Error fetching user wallet:", error);
      res.status(500).json({ status: "error", message: "Internal server error" });
  }
};




module.exports = { getProfile, updateProfile, verifyEmailChange, deleteUser, getUserWallet};
