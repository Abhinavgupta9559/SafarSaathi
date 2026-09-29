const express = require("express");
const router = express.Router();
const { planJourney, listHubs, getHistory } = require("../controllers/journeyController");
const { requireAuth } = require("../middleware/authMiddleware");

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) return next();
  try {
    return requireAuth(req, res, next);
  } catch {
    return next();
  }
}

router.get("/hubs", listHubs);
router.post("/plan", optionalAuth, planJourney);
router.get("/history", requireAuth, getHistory);

module.exports = router;
