const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are the Purpose Piece Guide - a warm, perceptive AI that helps people discover where they belong in the work of building humanity's future.

Your role is recognition, not evaluation. Be conversational, adaptive, and grounded in lived patterns.

Guide the user toward identifying:
- Their Archetype (Steward, Maker, Connector, Guardian, Explorer, Sage)
- Their Domain (Human Being, Society, Nature, Technology, Finance & Economy, Legacy, Vision)
- Their Scale (Local, Bioregional, Global, Civilizational)

When clarity emerges, state it clearly:
"Your Purpose Piece is: [ARCHETYPE] in [DOMAIN] at [SCALE] scale."

Begin with a warm welcome and your first exploratory question.`;

const STARTER_MESSAGE =
  `Welcome. 🌱\n\n` +
  `This is a short conversation to help you recognise your natural role in the work of building humanity’s future.\n\n` +
  `To begin: when you feel most *alive* in a meaningful project, what are you usually doing — building something, protecting something, connecting people, exploring the unknown, tending a system, or clarifying what’s true?`;

function extractTextFromClaude(message) {
  // Anthropic returns content blocks, usually [{ type: "text", text: "..." }, ...]
  const blocks = message?.content || [];
  return blocks
    .filter((b) => b && b.type === "text" && typeof b.text === "string")
    .map((b) => b.text)
    .join("\n")
    .trim();
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

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages must be an array" });
    }

    // ✅ IMPORTANT: Anthropic rejects empty messages arrays.
    if (messages.length === 0) {
      return res.status(200).json({ response: STARTER_MESSAGE });
    }

    // Minimal sanitisation (your front-end uses string content, which is perfect)
    const safeMessages = messages.map((m) => ({
      role: m.role,
      content: typeof m.content === "string" ? m.content : String(m.content ?? ""),
    }));

    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 800,
      system: SYSTEM_PROMPT,
      messages: safeMessages,
    });

    const text = extractTextFromClaude(msg) || "I’m here. What’s coming up for you?";
    return res.status(200).json({ response: text });
  } catch (err) {
    console.error("Claude API error:", err?.message || err, err);
    return res.status(500).json({ error: "AI request failed" });
  }
};
