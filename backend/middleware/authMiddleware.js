const jwt = require('jsonwebtoken');
const { User } = require('../models');
const redisClient = require('../utils/redis')

const protect = async (req, res, next) => {
  let token = req.headers.authorization;

  if (!token || !token.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized, no token provided' });
  }

  try {
    token = token.split(' ')[1];
    const isBlacklisted = await redisClient.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ message: 'Token is blacklisted. Please log in again.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findByPk(decoded.id);
    if (!req.user) return res.status(401).json({ message: 'User not found' });

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized, invalid token' });
  }
};

module.exports = { protect };
