// PURPOSE PIECE — /api/chat.js
// Replaces chat-conversational.js
//
// Architecture:
//   - Engine controls all structure (questions, scoring, phase transitions)
//   - Claude handles only 3 moments: Phase 2 open questions, Phase 3 summary tone, result delivery
//   - Session state lives in the message history (no database needed)
//   - Frontend contract unchanged: POST { messages } → { message }

const Anthropic = require("@anthropic-ai/sdk");
const engine = require("../lib/engine");

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ─────────────────────────────────────────────
// SESSION STORE
// In-memory for now. Keyed by a session ID we
// embed in the conversation via a hidden marker.
// No database required — sessions live as long
// as the serverless function instance is warm.
// For production: replace with Redis or similar.
// ─────────────────────────────────────────────

const sessions = new Map();

// Extract session ID from message history
// We inject it as the very first assistant message
function getSessionId(messages) {
  for (const msg of messages) {
    if (msg.role === "assistant") {
      const match = msg.content.match(/\[session:([a-z0-9]+)\]/);
      if (match) return match[1];
    }
  }
  return null;
}

function generateSessionId() {
  return Math.random().toString(36).slice(2, 10);
}

// ─────────────────────────────────────────────
// QUESTION FORMATTER
// Converts a question object into chat-ready text
// ─────────────────────────────────────────────

function formatQuestion(question, acknowledgment) {
  const lines = [];

  if (acknowledgment) {
    lines.push(acknowledgment);
    lines.push("");
  }

  lines.push(question.text);

  if (question.inputType === "multiple_choice" && question.options) {
    lines.push("");
    for (const opt of question.options) {
      // Strip internal revision comments from option text before display
      lines.push(`${opt.id.toUpperCase()}) ${opt.text}`);
    }
  }

  if (question.inputType === "free_text") {
    lines.push("");
    lines.push("(Just a sentence or two is fine.)");
  }

  return lines.join("\n");
}

// ─────────────────────────────────────────────
// OPTION PARSER
// Extracts the selected option letter from user input
// Handles: "a", "A", "A)", "option a", "I'd say A", etc.
// ─────────────────────────────────────────────

function parseOptionLetter(userInput) {
  const cleaned = userInput.trim().toLowerCase();

  // Direct single letter
  if (/^[a-f]$/.test(cleaned)) return cleaned;

  // Letter with punctuation: "a." "a)" "a:"
  const withPunct = cleaned.match(/^([a-f])[.):\s]/);
  if (withPunct) return withPunct[1];

  // "option a" or "choice b"
  const withWord = cleaned.match(/(?:option|choice|answer)\s+([a-f])/);
  if (withWord) return withWord[1];

  // Letter anywhere in short input (≤ 10 chars)
  if (cleaned.length <= 10) {
    const anyLetter = cleaned.match(/([a-f])/);
    if (anyLetter) return anyLetter[1];
  }

  return null; // treat as free text
}

// ─────────────────────────────────────────────
// CLAUDE — NATURAL LANGUAGE MOMENTS ONLY
// Called for: Phase 3 validation summary + result delivery
// NOT called for: Phase 1 questions, Phase 2 multiple choice
// ─────────────────────────────────────────────

const CLAUDE_VOICE_PROMPT = `You are the Purpose Piece Guide — a warm, precise presence. 
You have just completed a behavioral assessment. 

Your voice: Jor-El's calm authority in a Rogerian posture. 
Grounded, not heavy. Precise, not clinical. Invitational, not eager.

Use short sentences. No jargon. No "you are a X type person."
Frame everything as pattern observed, not identity assigned.
Never say "fascinating" or "great answer" or anything evaluative.`;

async function callClaude(prompt) {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system: CLAUDE_VOICE_PROMPT,
    messages: [{ role: "user", content: prompt }]
  });
  return response.content[0].text;
}

// ─────────────────────────────────────────────
// WELCOME MESSAGE
// Shown once when conversation starts
// ─────────────────────────────────────────────

function buildWelcome(sessionId) {
  return `[session:${sessionId}]Welcome. I'm here to help you see where you fit in the work of building humanity's future.

This will take about 5 minutes. I'll ask some quick questions to get a sense of your pattern, then we'll make sure it fits.

There are no wrong answers. Pick what feels most true in your actual life — not what you wish were true.

Ready?`;
}

// ─────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────

module.exports = async (req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const { messages } = req.body || {};

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array required" });
  }

  try {
    // ── Step 1: Identify or create session ──────
    let sessionId = getSessionId(messages);
    let session;

    if (!sessionId || !sessions.has(sessionId)) {
      // New conversation
      sessionId = generateSessionId();
      session = engine.createSession();
      sessions.set(sessionId, session);

      // If this is literally the first message (user said "Ready")
      // send welcome + first question
      const welcomeText = buildWelcome(sessionId);
      const firstResponse = engine.start(session);
      const firstQuestion = formatQuestion(firstResponse.question, null);

      const fullMessage = `${welcomeText}\n\n${firstQuestion}`;
      return res.status(200).json({ message: fullMessage });
    }

    // ── Step 2: Retrieve existing session ───────
    session = sessions.get(sessionId);

    // ── Step 3: Get the user's latest message ───
    const userMessages = messages.filter(m => m.role === "user");
    const latestUserMessage = userMessages[userMessages.length - 1]?.content || "";

    // ── Step 4: Determine what to do with it ────

    // If session is complete, don't re-process
    if (session.status === "complete") {
      return res.status(200).json({
        message: "Your Purpose Piece has been delivered. Refresh the page to start a new session."
      });
    }

    // Find the current question to know what kind of answer to expect
    const currentQuestionId = session.askedQuestionIds[session.askedQuestionIds.length - 1];
    const { questions } = require("../lib/questions");
    const currentQuestion = questions.find(q => q.id === currentQuestionId);

    let userAnswer;

    if (session.status === "validating" || session.status === "correcting") {
      // Phase 3: answer is one of the validation options or free text
      // Try to match option text first
      const validationQ = questions.find(q => q.id === "p3_summary_prompt");
      const matchedOption = validationQ?.options?.find(
        opt => latestUserMessage.toLowerCase().includes(opt.toLowerCase().slice(0, 15))
      );
      userAnswer = matchedOption || latestUserMessage;

    } else if (currentQuestion?.inputType === "multiple_choice") {
      // Phase 1 or Phase 2 MC: parse the letter
      const letter = parseOptionLetter(latestUserMessage);
      if (!letter) {
        // Couldn't parse — ask them to pick a letter
        return res.status(200).json({
          message: `Just the letter is fine — A, B, C, D, or E.`
        });
      }
      userAnswer = letter;

    } else {
      // Free text question
      userAnswer = latestUserMessage;
    }

    // ── Step 5: Pass answer to engine ───────────
    const engineResponse = engine.answer(session, userAnswer);

    // ── Step 6: Format engine response for chat ──

    // Question (Phase 1 or 2 multiple choice / free text)
    if (engineResponse.type === "question") {
      const text = formatQuestion(engineResponse.question, engineResponse.acknowledgment);
      return res.status(200).json({ message: text });
    }

    // Validation (Phase 3 summary)
    if (engineResponse.type === "validation") {
      // Use Claude to write the summary in the right voice
      const claudePrompt = `The assessment is complete. Here is the raw summary to deliver:

${engineResponse.prompt}

Rewrite this in the Warm Architect voice — precise, grounded, 2-3 sentences max for the description. 
Then ask: "What part feels most accurate — and what part doesn't fit?"
Then show these options on separate lines:
- It all fits
- Most of it fits — one part is off  
- It's partly right
- This doesn't feel like me`;

      const claudeText = await callClaude(claudePrompt);
      return res.status(200).json({ message: engineResponse.acknowledgment + "\n\n" + claudeText });
    }

    // Correction loop
    if (engineResponse.type === "correction") {
      const text = formatQuestion(engineResponse.question, engineResponse.acknowledgment);
      return res.status(200).json({ message: text });
    }

    // Result (Phase 3 complete)
    if (engineResponse.type === "result") {
      // Use Claude to deliver the profile in the right voice
      const rawProfile = engineResponse.formatted;

      const claudePrompt = `Deliver this Purpose Piece result to the user. 

Raw profile data:
${rawProfile}

Deliver it exactly as written — this is their complete profile. 
Do not summarise or shorten it. 
Preserve all section headers and bullet points.
Add one sentence at the very end, in the Warm Architect voice, about what this means for how they show up in the work.`;

      const claudeText = await callClaude(claudePrompt);
      return res.status(200).json({ message: claudeText });
    }

    // Fallback
    return res.status(200).json({ message: "Something unexpected happened. Please refresh and try again." });

  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message
    });
  }
};
