const transportData = require("../data/transportData.json");
const { findHub, buildJourneyPlan } = require("./journeyController");

const SYSTEM_PROMPT = `You are "SafarSaathi AI", a friendly local-mobility assistant for people travelling in an unfamiliar part of Delhi NCR, India.

Your job is NOT to just give a route like a map app. You must give a complete, practical, step-by-step TRANSPORT plan covering:
1. First-mile: how to reach the nearest metro/bus point from the starting place (auto/e-rickshaw pickup point if relevant).
2. Main transport: which metro line / bus to take, approx fare and time.
3. Last-mile: how to cover the final stretch to the exact destination (auto/e-rickshaw pickup point).
4. Approximate total fare and time.
5. If the user mentions a budget or a deadline time, tailor your suggestion (cheapest vs fastest) and explicitly say whether their constraint is achievable.

You can ONLY reliably answer for places in this known dataset (do not invent data for places outside it — say so honestly and suggest the closest known hub instead):
${transportData.hubs.map((h) => `- ${h.name} (${h.type})`).join("\n")}

Style rules:
- Reply in the SAME language mix the user used (Hindi/Hinglish/English). If they wrote in Hindi or Hinglish, reply in Hindi/Hinglish. If English, reply in English.
- Be concise, use short numbered steps with emojis (🚶 🛺 🚇 🚌 💰 ⏱️), not long paragraphs.
- Never invent fare/time numbers for hubs outside the dataset — be honest about data limitations.
- If asked something completely unrelated to travel/mobility in this app's scope, politely redirect back to journey planning, but you may still give a brief helpful general answer first.`;

/** Returns true if any "significant" word (4+ letters) of `name` appears in `text`. */
function partialNameMatch(text, name) {
  const words = name
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 4 && !["station", "terminal", "gate"].includes(w));
  return words.some((w) => text.includes(w));
}

function buildContextForQuery(message) {
  // Lightweight retrieval: if the message mentions any known hub name/alias
  // (even partially, e.g. "Kashmere Gate" instead of full "Kashmere Gate ISBT"),
  // pull its structured data into context so the AI grounds its answer in real data.
  const lower = message.toLowerCase();
  const matchedHubs = transportData.hubs.filter(
    (h) =>
      lower.includes(h.name.toLowerCase()) ||
      (h.aliases || []).some((a) => lower.includes(a.toLowerCase())) ||
      partialNameMatch(lower, h.name) ||
      (h.aliases || []).some((a) => partialNameMatch(lower, a))
  );
  return matchedHubs;
}

/**
 * POST /api/ai/ask
 * Body: { message, history? }
 * Uses Claude (Anthropic API) when ANTHROPIC_API_KEY is configured.
 * Falls back to a deterministic rule-based answer otherwise, so the
 * feature always works even without an API key configured.
 */
async function ask(req, res, next) {
  try {
    const { message, history } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "'message' is required." });
    }

    const matchedHubs = buildContextForQuery(message);

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.json({
        success: true,
        source: "rule-based-fallback",
        reply: fallbackReply(message, matchedHubs),
      });
    }

    const contextBlock =
      matchedHubs.length > 0
        ? `\n\nRelevant structured data for this query:\n${JSON.stringify(matchedHubs, null, 2)}`
        : "";

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
        max_tokens: 700,
        system: SYSTEM_PROMPT + contextBlock,
        messages: [
          ...(Array.isArray(history) ? history.slice(-6) : []),
          { role: "user", content: message },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", errText);
      return res.json({
        success: true,
        source: "rule-based-fallback",
        reply: fallbackReply(message, matchedHubs),
        note: "AI service temporarily unavailable, showing a rule-based answer instead.",
      });
    }

    const data = await response.json();
    const textBlocks = (data.content || []).filter((b) => b.type === "text").map((b) => b.text);

    res.json({
      success: true,
      source: "ai",
      reply: textBlocks.join("\n"),
    });
  } catch (err) {
    next(err);
  }
}

/** Deterministic fallback so the "AI assistant" always answers something useful, even with no API key. */
function fallbackReply(message, matchedHubs) {
  if (matchedHubs.length >= 2) {
    const plan = buildJourneyPlan(matchedHubs[0], matchedHubs[1]);
    return (
      `Here's a journey plan from ${plan.from} to ${plan.to}:\n\n` +
      plan.steps
        .map((s) => `${s.icon} ${s.instruction_en}`)
        .join("\n") +
      `\n\n💰 Approx total fare: ₹${plan.totalFareEstimateINR.min}-${plan.totalFareEstimateINR.max}` +
      (plan.totalTimeEstimateMin ? `\n⏱️ Approx time: ${plan.totalTimeEstimateMin} min` : "")
    );
  }
  if (matchedHubs.length === 1) {
    const h = matchedHubs[0];
    return `I found "${h.name}" in our dataset. Please tell me your source AND destination (e.g. "New Delhi Railway Station to Rajiv Chowk") so I can build a full first-mile + transport + last-mile plan for you.`;
  }
  return `I can currently help with journeys within Delhi NCR, between these places: ${require("../data/transportData.json").hubs.map((h) => h.name).join(", ")}. Please mention your source and destination clearly (e.g. "Kashmere Gate to IGI Airport").`;
}

module.exports = { ask };
