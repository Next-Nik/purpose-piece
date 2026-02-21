// PURPOSE PIECE — API HANDLER
// FILE NAMING: lib files use plain names (engine.js, questions.js, scoring.js, profiles.js)

const Anthropic = require("@anthropic-ai/sdk");
const engine = require("../lib/engine");

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const sessions = new Map();

function generateSessionId() {
  return Math.random().toString(36).slice(2, 10);
}

function buildWelcome() {
  return `Welcome. We're here to help you see where you fit in building the future we want to live into.

This will take about 5 minutes. I'll ask some quick questions to get a sense of your pattern, then we'll make sure it fits.

There are no wrong answers. Pick what feels most true in your actual life — not what you wish were true, or what sounds impressive.`;
}

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
      lines.push(`${opt.id.toUpperCase()}) ${opt.text}`);
    }
  }

  if (question.inputType === "free_text") {
    lines.push("");
    lines.push("(Just a sentence or two is fine.)");
  }

  return lines.join("\n");
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");

  if (req.method === "OPTIONS") { res.status(200).end(); return; }

  const { messages, sessionId: clientSessionId } = req.body || {};

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array required" });
  }

  try {
    let sessionId = clientSessionId;
    let session;

    // New session
    if (!sessionId || !sessions.has(sessionId)) {
      sessionId = generateSessionId();
      session = engine.createSession();
      sessions.set(sessionId, session);

      const firstResponse = engine.start(session);
      const firstQuestion = formatQuestion(firstResponse.question, null);

      return res.status(200).json({
        message: `${buildWelcome()}\n\n${firstQuestion}`,
        sessionId
      });
    }

    session = sessions.get(sessionId);

    if (session.status === "complete") {
      return res.status(200).json({
        message: "Your Purpose Piece has been delivered. Refresh to start a new session.",
        sessionId
      });
    }

    const userMessages = messages.filter(m => m.role === "user");
    const latestUserMessage = userMessages[userMessages.length - 1]?.content || "";

    const engineResponse = engine.answer(session, latestUserMessage);

    // ── Regular multiple-choice question ──────────────────────────────────────
    if (engineResponse.type === "question") {
      return res.status(200).json({
        message: formatQuestion(engineResponse.question, engineResponse.acknowledgment),
        sessionId
      });
    }

    // ── Plain text question (subdomain menu, domain clarification) ────────────
    if (engineResponse.type === "question_text") {
      let text = engineResponse.acknowledgment ? engineResponse.acknowledgment + "\n\n" : "";
      text += engineResponse.text;
      return res.status(200).json({ message: text, sessionId });
    }

    // ── Clarification (bad input) ─────────────────────────────────────────────
    if (engineResponse.type === "clarification") {
      return res.status(200).json({ message: engineResponse.message, sessionId });
    }

    // ── Recognition Step 1: Behavioral description ────────────────────────────
    if (engineResponse.type === "recognition_step_1") {
      let text = engineResponse.acknowledgment ? engineResponse.acknowledgment + "\n\n" : "";
      text += engineResponse.behavioralDescription;
      text += "\n\nDoes that feel like you — even if your life doesn't fully reflect it yet?";
      return res.status(200).json({ message: text, sessionId });
    }

    // ── Recognition Gap: Person is aspirational, not yet fully living it ──────
    if (engineResponse.type === "recognition_gap") {
      const archName = engineResponse.archetype.charAt(0).toUpperCase() + engineResponse.archetype.slice(1);
      const text = `That gap — between what you're built for and what you're currently living — that's worth naming. A lot of people find their Purpose Piece before they're fully inhabiting it. The pattern is real even when life hasn't caught up yet.\n\nWith that in mind: does the ${archName} pattern feel like something that's true about you at your core?`;
      return res.status(200).json({ message: text, sessionId });
    }

    // ── Recognition Step 2: World impact ─────────────────────────────────────
    if (engineResponse.type === "recognition_step_2") {
      const text = engineResponse.worldImpact + "\n\nDoes that feel like the contribution you're here to make — even if you're still finding your way into it?";
      return res.status(200).json({ message: text, sessionId });
    }

    // ── Recognition Step 3: Name the pattern + deliver profile immediately ────
    if (engineResponse.type === "recognition_step_3") {
      const { archetypeName, secondaryName } = engineResponse;

      let nameText = `What keeps showing up in everything you've described is someone who ${getArchetypeEssence(archetypeName)}.`;
      if (secondaryName) {
        nameText += ` There's also a ${secondaryName} quality in how you operate.`;
      }
      nameText += `\n\nThe name for this pattern is: ${archetypeName}.\n\n`;

      // Deliver profile immediately
      session.phase = 4;
      const profileResponse = engine.answer(session, "deliver");
      const { profile, archetype, secondary, domain, scale } = profileResponse;

      let profileText = `YOUR PURPOSE PIECE\n\n`;
      profileText += `${archetype}`;
      if (secondary) profileText += ` + ${secondary}`;
      profileText += `\n${domain} · ${scale}\n\n`;
      profileText += `${profile.description}\n\n`;

      profileText += `WHAT YOU'RE BUILT FOR:\n`;
      profile.signatureStrengths.forEach(s => { profileText += `· ${s}\n`; });
      profileText += `\n`;

      profileText += `WHERE YOU CAN LOSE THE THREAD:\n`;
      profile.shadowPatterns.forEach(s => { profileText += `· ${s}\n`; });
      profileText += `\n`;

      profileText += `QUESTIONS TO COME BACK TO:\n`;
      profile.realignmentCues.forEach(q => { profileText += `· ${q}\n`; });
      profileText += `\n`;

      profileText += `WHY THIS MATTERS:\n${profile.whyItMatters}\n\n`;
      profileText += `─────\n\nThis is your Purpose Piece. Not a label — a pattern that's already in you. The question now is where it belongs in the work.`;

      session.status = "complete";
      return res.status(200).json({ message: nameText + profileText, sessionId });
    }

    // ── Correction needed ─────────────────────────────────────────────────────
    if (engineResponse.type === "correction_needed") {
      return res.status(200).json({ message: engineResponse.text, sessionId });
    }


    return res.status(200).json({
      message: "Something unexpected happened. Please refresh and try again.",
      sessionId
    });

  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

function getArchetypeEssence(name) {
  const essences = {
    Steward:   "keeps things whole — who tends what exists, repairs what breaks, and maintains what others take for granted",
    Maker:     "needs things to exist in the world before they feel real — who moves from concept to creation and values function over perfection",
    Connector: "sees how people and ideas belong together — who weaves relationships and creates the conditions for collaboration to emerge",
    Guardian:  "protects what matters — who recognises threats before others do and holds boundaries so that what's sacred can survive",
    Explorer:  "ventures into unknown territory and brings back what's needed — who's most alive at the frontier of what's possible",
    Sage:      "sees patterns across time and context — who holds complexity without simplifying it and offers perspective that helps others see clearly"
  };
  return essences[name] || "contributes in a distinctive way";
}
