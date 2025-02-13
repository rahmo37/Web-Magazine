// This file implements the rate limiter module and provides general limiter and login limiter
const rateLimit = require("express-rate-limit");

// Object that contains the limiters
const requestRateLimiterObj = {};

// General limiter
requestRateLimiterObj.general = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  headers: true,
  standardHeaders: true,
  legacyHeaders: false,
});

requestRateLimiterObj.login = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 min
  max: 3,
  message: "Too many requests from this IP, please try again later.",
  headers: true,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { requestRateLimiterObj };
