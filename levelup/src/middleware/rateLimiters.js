// src/middleware/rateLimiters.js

const rateLimit = require('express-rate-limit');

// Login: 10 attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts. Please try again in 15 minutes.'
});

// Register: 5 accounts per hour from same IP (prevents mass account creation)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many accounts created from this IP. Please try again later.'
});

module.exports = { loginLimiter, registerLimiter };