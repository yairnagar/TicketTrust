const rateLimit = require('express-rate-limit');
const { sendResponse } = require('../controllers/response');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  handler: (req, res) => {
    return sendResponse(res, false, 'Too many login attempts. Please try again later.', null, 'Rate limit exceeded', 429);
  },
  headers: true
});

const passwordChangeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  handler: (req, res) => {
    return sendResponse(res, false, 'Too many password change attempts. Try again later.', null, 'Rate limit exceeded', 429);
  },
  headers: true
});

module.exports = { loginLimiter, passwordChangeLimiter };
