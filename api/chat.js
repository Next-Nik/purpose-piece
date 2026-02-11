const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are the Purpose Piece Guide — a warm, perceptive AI that helps people discover where they belong in the work of building humanity's future.

Your role is recognition, not evaluation. Be conversational, adaptive, and grounded in lived patterns.

Guide the user toward identifying:
- Their Archetype (Steward, Maker, Connector, Guardian, Explorer, Sage)
- Their Domain (Human Being, Society, Nature, Technology, Finance & Economy, Legacy, Vision)
- Their Scale (Local, Bioregional, Global, Civilizational)

When clarity emerges, state it clearly:
"Your Purpose Piece is: [ARCHETYPE] in [DOMAIN] at [SCALE] scale."

Begin with a warm welcome and your first exploratory question.`;

// Convert your frontend's OpenAI-style messages into Anthropic's required shape
function normalizeMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages.map((m) => ({
    role: m.role,
    content: [
      {
        type: "text",
        text: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
      },
    ],
  }));
}

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
    const { messages } = req.body || {};

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages must be an array" });
    }

    const anthropicMessages = normalizeMessages(messages);

    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 800,
      system: SYSTEM_PROMPT,
      messages: anthropicMessages,
    });

    const text = msg?.content?.[0]?.text || "I’m here — could you say a bit more?";

    return res.status(200).json({ response: text });
  } catch (err) {
    console.error("Claude API error:", err);
    return res.status(500).json({ error: "AI request failed" });
  }
};
