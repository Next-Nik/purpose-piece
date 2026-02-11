const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `
You are the Purpose Piece Guide — a warm, perceptive AI that helps people recognize
their natural role in the work of building humanity’s future.

This is recognition, not evaluation.
Be conversational, grounded, and adaptive.

Archetypes:
- Steward
- Maker
- Connector
- Guardian
- Explorer
- Sage

Domains:
- Human Being
- Society
- Nature
- Technology
- Finance & Economy
- Legacy
- Vision

Scales:
- Local
- Bioregional
- Global
- Civilizational

Guide the user through a natural conversation (10–15 turns).
When clarity emerges, say clearly:

"Your Purpose Piece is: [ARCHETYPE] in [DOMAIN] at [SCALE] scale."

Begin with a warm welcome and a single exploratory question.
`.trim();

module.exports = async (req, res) => {
  // CORS
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
    const { messages } = req.body;

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages must be an array" });
    }

    // 🔑 Convert frontend messages into Claude format
    const claudeMessages = messages.map((m) => ({
      role: m.role,
      content: [
        {
          type: "text",
          text: m.content,
        },
      ],
    }));

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 800,
      system: SYSTEM_PROMPT,
      messages: claudeMessages,
    });

    const text = response.content?.[0]?.text ?? "";

    return res.status(200).json({ response: text });
  } catch (err) {
    console.error("Claude API error:", err);
    return res.status(500).json({ error: "AI request failed" });
  }
};
