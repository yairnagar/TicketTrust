const { User, Wallet, Notification, Ticket, Event, TransactionWallet } = require('../models');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const validator = require('validator');
const crypto = require('crypto');
const redisClient = require('../utils/redis');
const { sendOTP, sendPasswordResetEmail } = require('../utils/emailService');
const { createWalletForUser } = require('../services/walletService');
const { createUserWallet } = require('../services/walletService');



const registerUser = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, userType } = req.body;

    if (!fullName || !email || !phoneNumber || !password || !userType) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (!validator.isMobilePhone(phoneNumber, 'he-IL')) {
      return res.status(400).json({ message: 'Invalid phone number' });
    }

    if (!validator.isStrongPassword(password, { minLength: 8, minNumbers: 1, minSymbols: 1 })) {
      return res.status(400).json({ message: 'Password must be at least 8 characters, contain a number, and a special character' });
    }

    const existingUser = await User.findOne({ where: { email } });
    const existingPhone = await User.findOne({ where: { phoneNumber } });
    if (existingUser || existingPhone) {
      return res.status(400).json({ message: 'Email or phone number already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ fullName, email, phoneNumber, passwordHash: hashedPassword, userType });

    console.log('✅ User created successfully:', newUser.dataValues);


    const wallet = await createUserWallet(newUser.id);
    res.status(201).json({ 
      message: 'User registered successfully', 
      token: generateToken(newUser),
      walletAddress: wallet.blockchainAddress
    });

  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const otp = crypto.randomInt(100000, 999999).toString();
    console.log(`🔑 Generated OTP: ${otp} for ${email}`);

    await redisClient.set(`otp:${email}`, otp, { EX: 300 });

    await sendOTP(email, otp);

    res.status(200).json({ message: 'OTP sent to email. Please verify.' });

  } catch (error) {
    console.error('❌ Server Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const storedOtp = await redisClient.get(`otp:${email}`);
    if (!storedOtp) return res.status(400).json({ message: 'OTP expired or invalid' });

    if (storedOtp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

    await redisClient.del(`otp:${email}`);

    const user = await User.findOne({ where: { email } });

    const token = generateToken(user);

    res.status(200).json({ message: 'Login successful', token });

  } catch (error) {
    console.error('❌ Server Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


const logoutUser = async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(400).json({ message: 'No token provided' });
      }
      await redisClient.set(`blacklist:${token}`, 'true', { EX: 3600 * 24 });
  
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('❌ Server Error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };



const resetPasswordRequest = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'User with this email does not exist' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    await redisClient.set(`resetToken:${email}`, resetToken, { EX: 900 }); 

    await sendPasswordResetEmail(email, resetToken);

    res.status(200).json({ message: 'Password reset link sent to your email' });

  } catch (error) {
    console.error('❌ Server Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, token } = req.body;

    if (!newPassword || !validator.isStrongPassword(newPassword, { minLength: 8, minNumbers: 1, minSymbols: 1 })) {
      return res.status(400).json({ message: 'Password must be at least 8 characters, contain a number, and a special character' });
    }

    const storedToken = await redisClient.get(`resetToken:${email}`);
    if (!storedToken || storedToken !== token) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ passwordHash: hashedPassword });

    await redisClient.del(`resetToken:${email}`);

    res.status(200).json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('❌ Server Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ status: 'error', message: 'Current and new password are required' });
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });


    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) return res.status(400).json({ status: 'error', message: 'Incorrect current password' });

    if (!validator.isStrongPassword(newPassword, { minLength: 8, minNumbers: 1, minSymbols: 1 })) {
      return res.status(400).json({ status: 'error', message: 'New password must be strong (min 8 chars, include numbers and special characters)' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    await redisClient.del(`blacklist:${req.headers.authorization?.split(' ')[1]}`);
    res.status(200).json({ status: 'success', message: 'Password changed successfully' });
  } catch (error) {
    console.error('❌ Error changing password:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

    

module.exports = { registerUser, loginUser, verifyOTP , logoutUser, resetPasswordRequest, resetPassword, changePassword};
