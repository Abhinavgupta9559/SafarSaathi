const { verifyToken } = require("../utils/jwt");
const User = require("../models/User");

/**
 * Protects routes: requires a valid "Bearer <token>" Authorization header.
 * Attaches the authenticated user to req.user (without the password hash).
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. Please log in.",
    });
  }

  try {
    const decoded = verifyToken(token);
    const user = User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: "User no longer exists." });
    }
    req.user = User.toPublicJSON(user);
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Session expired or invalid token. Please log in again.",
    });
  }
}

module.exports = { requireAuth };
