const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const { signToken } = require("../utils/jwt");

const SALT_ROUNDS = 12;

/**
 * POST /api/auth/signup
 * Body: { name, email, password, phone? }
 */
async function signup(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
    }

    const { name, email, password, phone } = req.body;

    const existing = User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = User.create({ name, email, passwordHash, phone });

    const token = signToken({ id: user.id });

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: User.toPublicJSON(user),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = User.findByEmail(email);

    // Deliberately generic message (don't reveal whether email exists) to
    // avoid user-enumeration attacks.
    const genericError = { success: false, message: "Invalid email or password." };

    if (!user) return res.status(401).json(genericError);

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json(genericError);

    const token = signToken({ id: user.id });

    return res.json({
      success: true,
      message: "Logged in successfully.",
      token,
      user: User.toPublicJSON(user),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Requires auth. Returns the current logged-in user.
 */
function me(req, res) {
  res.json({ success: true, user: req.user });
}

/**
 * PATCH /api/auth/language
 * Requires auth. Updates the user's preferred UI language (en/hi).
 */
function updateLanguage(req, res, next) {
  try {
    const { language } = req.body;
    if (!["en", "hi"].includes(language)) {
      return res.status(400).json({ success: false, message: "Language must be 'en' or 'hi'." });
    }
    const updated = User.updateLanguage(req.user.id, language);
    res.json({ success: true, user: User.toPublicJSON(updated) });
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, login, me, updateLanguage };
