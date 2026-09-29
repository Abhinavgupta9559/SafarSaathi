const transportData = require("../data/transportData.json");
const { findHub } = require("./journeyController");

/**
 * GET /api/emergency/:hubQuery
 * Returns nearest known police station / hospital info for a hub.
 * (MVP-level static data — a production version would use a live
 * Places API, but this keeps the feature dependency-free.)
 */
function getEmergencyInfo(req, res) {
  const hub = findHub(req.params.hubQuery);
  if (!hub) {
    return res.status(404).json({
      success: false,
      message: `No emergency data for "${req.params.hubQuery}" yet.`,
    });
  }
  res.json({
    success: true,
    hub: hub.name,
    emergency: hub.emergency || null,
    nationalHelplines: {
      police: "100",
      ambulance: "108 / 102",
      womenHelpline: "1091",
      disasterManagement: "112",
    },
  });
}

module.exports = { getEmergencyInfo };
