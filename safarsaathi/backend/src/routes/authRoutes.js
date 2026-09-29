const express = require("express");
const router = express.Router();
const { signup, login, me, updateLanguage } = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimiter");
const { signupValidation, loginValidation } = require("../utils/validators");

router.post("/signup", authLimiter, signupValidation, signup);
router.post("/login", authLimiter, loginValidation, login);
router.get("/me", requireAuth, me);
router.patch("/language", requireAuth, updateLanguage);

module.exports = router;
