const transportData = require("../data/transportData.json");
const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

/** Finds a hub by id, name, or alias (case-insensitive, partial match allowed). */
function findHub(query) {
  if (!query) return null;
  const q = query.toLowerCase().trim();
  return (
    transportData.hubs.find((h) => h.id === q) ||
    transportData.hubs.find((h) => h.name.toLowerCase() === q) ||
    transportData.hubs.find((h) => h.name.toLowerCase().includes(q)) ||
    transportData.hubs.find((h) => (h.aliases || []).some((a) => a.toLowerCase().includes(q))) ||
    null
  );
}

function findRoute(fromId, toId) {
  return (
    transportData.routesBetweenHubs.find((r) => r.from === fromId && r.to === toId) ||
    transportData.routesBetweenHubs.find((r) => r.from === toId && r.to === fromId)
  );
}

/**
 * Builds a full "first-mile + main transport + last-mile" journey plan
 * between two known hubs. This is the product's core differentiator:
 * it doesn't just say "take the metro" — it tells the user how to reach
 * the metro, which line, and how to cover the last stretch on arrival.
 */
function buildJourneyPlan(fromHub, toHub, priority = "balanced") {
  const route = findRoute(fromHub.id, toHub.id);

  const firstMileOptions = fromHub.localTransport || [];
  const lastMileOptions = toHub.localTransport || [];

  const cheapestFirstMile = [...firstMileOptions].sort(
    (a, b) => a.approxFareRangeINR[0] - b.approxFareRangeINR[0]
  )[0];
  const cheapestLastMile = [...lastMileOptions].sort(
    (a, b) => a.approxFareRangeINR[0] - b.approxFareRangeINR[0]
  )[0];

  const mainLegFareINR = route ? route.approxFareINR : null;
  const mainLegTimeMin = route ? route.approxTimeMin : null;

  const totalFareEstimate = {
    min:
      (cheapestFirstMile ? cheapestFirstMile.approxFareRangeINR[0] : 0) +
      (mainLegFareINR || 0) +
      (cheapestLastMile ? cheapestLastMile.approxFareRangeINR[0] : 0),
    max:
      (firstMileOptions[0] ? firstMileOptions[0].approxFareRangeINR[1] : 0) +
      (mainLegFareINR || 0) +
      (lastMileOptions[0] ? lastMileOptions[0].approxFareRangeINR[1] : 0),
  };

  const steps = [];

  if (firstMileOptions.length) {
    steps.push({
      stage: "first_mile",
      icon: "🛺",
      instruction_en: `From ${fromHub.name}, take a${cheapestFirstMile.type === "auto" ? "n" : ""} ${cheapestFirstMile.type} from "${cheapestFirstMile.pickupPoint}" towards ${fromHub.metro ? fromHub.metro.nearestStation : "the main transport point"}.`,
      instruction_hi: `${fromHub.name} se "${cheapestFirstMile.pickupPoint}" se ${cheapestFirstMile.type === "auto" ? "auto" : "e-rickshaw"} lekar ${fromHub.metro ? fromHub.metro.nearestStation : "main transport point"} tak jayein.`,
      approxFareINR: cheapestFirstMile.approxFareRangeINR,
      notes: cheapestFirstMile.notes || null,
    });
  }

  if (fromHub.metro) {
    steps.push({
      stage: "main_transport",
      icon: "🚇",
      instruction_en: route
        ? `Board the metro at ${fromHub.metro.nearestStation} and take the ${route.line}. Approx travel time: ${route.approxTimeMin} min.`
        : `Board the metro at ${fromHub.metro.nearestStation} (${fromHub.metro.lines.join(", ")}) heading towards ${toHub.name}.`,
      instruction_hi: route
        ? `${fromHub.metro.nearestStation} se metro lein aur ${route.line} pakdein. Approx samay: ${route.approxTimeMin} minute.`
        : `${fromHub.metro.nearestStation} se metro lein (${fromHub.metro.lines.join(", ")}) ${toHub.name} ki taraf.`,
      approxFareINR: mainLegFareINR,
      approxTimeMin: mainLegTimeMin,
    });
  } else if (fromHub.bus && fromHub.bus.length) {
    steps.push({
      stage: "main_transport",
      icon: "🚌",
      instruction_en: `Take bus route ${fromHub.bus[0].routeNo} towards ${fromHub.bus[0].towards}.`,
      instruction_hi: `Bus route ${fromHub.bus[0].routeNo} lein, ${fromHub.bus[0].towards} ki taraf.`,
      approxFareINR: null,
    });
  }

  if (lastMileOptions.length) {
    steps.push({
      stage: "last_mile",
      icon: "🚶",
      instruction_en: `On reaching near ${toHub.name}, take a${cheapestLastMile.type === "auto" ? "n" : ""} ${cheapestLastMile.type} from "${cheapestLastMile.pickupPoint}" to reach your exact destination.`,
      instruction_hi: `${toHub.name} ke paas pahunchne ke baad, "${cheapestLastMile.pickupPoint}" se ${cheapestLastMile.type === "auto" ? "auto" : "e-rickshaw"} lekar apni exact destination tak jayein.`,
      approxFareINR: cheapestLastMile.approxFareRangeINR,
      notes: cheapestLastMile.notes || null,
    });
  }

  return {
    from: fromHub.name,
    to: toHub.name,
    priority,
    steps,
    totalFareEstimateINR: totalFareEstimate,
    totalTimeEstimateMin: mainLegTimeMin
      ? mainLegTimeMin + 15 // + rough first/last mile buffer
      : null,
    emergencyInfo: {
      atDestination: toHub.emergency || null,
    },
  };
}

/**
 * POST /api/journey/plan
 * Body: { from, to, priority? } priority: "cheapest" | "fastest" | "balanced"
 */
function planJourney(req, res, next) {
  try {
    const { from, to, priority } = req.body;
    if (!from || !to) {
      return res.status(400).json({ success: false, message: "'from' and 'to' are required." });
    }

    const fromHub = findHub(from);
    const toHub = findHub(to);

    if (!fromHub || !toHub) {
      return res.status(404).json({
        success: false,
        message: `Sorry, we don't have data for ${!fromHub ? `"${from}"` : `"${to}"`} yet. Our MVP currently covers: ${transportData.hubs.map((h) => h.name).join(", ")}.`,
        supportedHubs: transportData.hubs.map((h) => ({ id: h.id, name: h.name })),
      });
    }

    if (fromHub.id === toHub.id) {
      return res.status(400).json({ success: false, message: "Source and destination cannot be the same place." });
    }

    const plan = buildJourneyPlan(fromHub, toHub, priority || "balanced");

    // Save journey history if the user is authenticated (optional field)
    if (req.user) {
      db.get("journeys")
        .push({
          id: uuidv4(),
          userId: req.user.id,
          from: fromHub.name,
          to: toHub.name,
          priority: priority || "balanced",
          createdAt: new Date().toISOString(),
        })
        .write();
    }

    res.json({ success: true, plan });
  } catch (err) {
    next(err);
  }
}

/** GET /api/journey/hubs - list all supported places (for autocomplete) */
function listHubs(req, res) {
  res.json({
    success: true,
    city: transportData.city,
    hubs: transportData.hubs.map((h) => ({ id: h.id, name: h.name, type: h.type, aliases: h.aliases })),
  });
}

/** GET /api/journey/history - requires auth, returns the user's past searches */
function getHistory(req, res) {
  const history = db
    .get("journeys")
    .filter({ userId: req.user.id })
    .sortBy("createdAt")
    .reverse()
    .value();
  res.json({ success: true, history });
}

module.exports = { planJourney, listHubs, getHistory, findHub, buildJourneyPlan };
