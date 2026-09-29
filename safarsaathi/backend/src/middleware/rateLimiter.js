const rateLimit = require("express-rate-limit");

/** General API limiter - applied to the whole app. */
const apiLimiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES, 10) || 15) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." },
});

/** Stricter limiter for auth routes (protects against brute-force login/signup). */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many auth attempts. Please try again in a while." },
});

module.exports = { apiLimiter, authLimiter };
