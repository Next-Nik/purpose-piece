const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are the Purpose Piece Guide — a warm, perceptive AI that helps people discover where they belong in the work of building humanity's future through a conversational assessment.

Your goal: Help them recognize their archetype (Steward, Maker, Connector, Guardian, Explorer, or Sage), their domain of work (Human Being, Society, Nature, Technology, Finance & Economy, Legacy, or Vision), and their scale (Local, Bioregional, Global, or Civilizational).

Key principles:
- This is RECOGNITION work, not evaluation
- Be conversational, not quiz-like
- Ask adaptive follow-up questions based on what emerges
- Gently redirect aspirational answers to actual patterns
- Validate before finalizing
- The conversation should take ~10–15 exchanges
- When you identify their archetype, domain, and scale, state it clearly like:
  "Your Purpose Piece is: [ARCHETYPE] in [DOMAIN] at [SCALE] scale"

Start with a warm welcome and ask your first question to begin discovering their pattern.
`;

module.exports = async (req, res) => {
  // Basic CORS (fine for this use-case)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body || {};

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages must be an array" });
    }

    // Anthropic may reject an empty messages array.
    // Your frontend calls callAPI([]) on load, so we seed a minimal user turn.
    const safeMessages =
      messages.length > 0
        ? messages
        : [{ role: "user", content: "Begin." }];

    const msg = await anthropic.messages.create({
      // IMPORTANT: use a currently supported model.
      // Claude 3.5 Sonnet is deprecated/removed, so it causes 400 invalid_request_error.
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 900,
      system: SYSTEM_PROMPT,
      messages: safeMessages,
    });

    const text = msg?.content?.[0]?.text || "";

    return res.status(200).json({ response: text });
  } catch (err) {
    // Log full error server-side for Vercel logs
    console.error("Claude API error:", err);

    // Return something useful to the browser (without leaking secrets)
    const status = err?.status || 500;
    const message =
      err?.message ||
      err?.error?.message ||
      "AI request failed";

    return res.status(status).json({
      error: "AI request failed",
      details: message,
    });
  }
};
