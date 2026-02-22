// PURPOSE PIECE — API HANDLER
// Receives input, detects off-road, calls engine, calls voice, returns response.
// FILE NAMING: lib files use plain names — engine.js, voice.js (no version suffixes)

const Anthropic = require("@anthropic-ai/sdk");
const engine    = require("../lib/engine");
const voice     = require("../lib/voice");
const questions = require("../lib/questions");
const scoring   = require("../lib/scoring");

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const sessions  = new Map();

// ─── Session management ───────────────────────────────────────────────────────
function generateSessionId() {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Off-road detection ───────────────────────────────────────────────────────
// Called before engine.answer() for free-text inputs during structured phases
function isOffRoad(input, sessionPhase) {
  const lower = input.trim().toLowerCase();
  const len   = input.trim().length;

  // During multiple-choice phases, detect non-answer inputs
  const structuredPhases = [1, "1-fork"];
  if (structuredPhases.includes(sessionPhase)) {
    const hasLetter = /\b[a-g]\b/.test(lower);
    // If longer than a brief letter response and doesn't contain a clear letter selection
    if (!hasLetter && len > 15) return true;
  }

  // Detect questions
  if (lower.includes("?") || lower.startsWith("what") || lower.startsWith("why") ||
      lower.startsWith("how") || lower.startsWith("can you") || lower.startsWith("is this")) {
    return true;
  }

  // Detect expressions of doubt or pushback
  const doubtPhrases = [
    "not sure", "don't understand", "confused", "doesn't make sense",
    "none of these", "none of those", "don't fit", "not relevant",
    "what does this mean", "what is this", "why are you asking"
  ];
  if (doubtPhrases.some(p => lower.includes(p))) return true;

  return false;
}

// Classify off-road type for voice response selection
function classifyOffRoad(input) {
  const lower = input.toLowerCase();
  if (lower.includes("?"))                           return "question";
  if (lower.includes("none") || lower.includes("don't fit") || lower.includes("doesn't fit"))
                                                     return "optionsDontFit";
  if (lower.includes("not sure") || lower.includes("confused") || lower.includes("don't understand"))
                                                     return "doubtAboutProcess";
  if (lower.includes("all of") || lower.includes("multiple") || lower.includes("both"))
                                                     return "claimsMultiple";
  if (lower.includes("frustrat") || lower.includes("annoyed") || lower.includes("stupid"))
                                                     return "frustration";
  return "generic";
}

// Use Claude to respond conversationally to off-road input
async function handleOffRoad(input, session) {
  const offRoadType = classifyOffRoad(input);

  // For known types, use template responses (fast, no API cost)
  if (offRoadType === "doubtAboutProcess") return voice.OFF_ROAD.doubtAboutProcess;
  if (offRoadType === "claimsMultiple")    return voice.OFF_ROAD.claimsMultiple;
  if (offRoadType === "optionsDontFit")    return voice.OFF_ROAD.optionsDontFit;
  if (offRoadType === "frustration")       return voice.OFF_ROAD.frustration;

  // For genuine questions or generic off-road, use Claude
  const context = `You are the Purpose Piece assessment guide. Current phase: ${session.phase}. Primary archetype signal so far: ${session.primaryArchetype || "not yet determined"}.

The user has gone off-script with this input: "${input}"

Respond in Zor-El voice: calm authority, architect-level composed, kind but firm, no therapy, no hype, no flattery. 2-3 sentences maximum. Then return them to the assessment naturally.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      system: "You are the Purpose Piece assessment guide. Zor-El voice: calm, structural, certain, curious. Never therapeutic, never flattering.",
      messages: [{ role: "user", content: context }]
    });
    return response.content[0].text;
  } catch {
    return voice.OFF_ROAD.generic(input);
  }
}

// ─── Format engine responses into text ───────────────────────────────────────
function formatQuestion(question, acknowledgmentKey) {
  const lines = [];

  if (acknowledgmentKey && voice.ACKNOWLEDGMENTS[acknowledgmentKey]) {
    lines.push(voice.ACKNOWLEDGMENTS[acknowledgmentKey]);
    lines.push("");
  }

  lines.push(question.setup || question.text);

  // Options are rendered exclusively as buttons in the UI.
  // Do NOT repeat them as text in the message body — that's the duplicate rendering bug.

  if (question.inputType === "free_text") {
    lines.push("");
    lines.push("(A sentence or two is enough.)");
  }

  return lines.join("\n");
}

function formatDomainQuestion() {
  return `One more thing — what area of collective work does this belong to?\n\nIs it more about people's inner development, social structures, nature and ecology, technology and tools, economics and resources, long-term preservation, or coordinating toward a shared future?`;
}

function formatSubdomainQuestion(domain, expressedBreadth) {
  const menu = questions.SUBDOMAIN_MENUS[domain];
  if (!menu) return null;

  let text = "";
  if (expressedBreadth) {
    text += voice.ACKNOWLEDGMENTS.broadScopeAnswer + "\n\n";
  }

  text += menu.prompt;

  // Options are rendered exclusively as buttons in the UI.
  // Do NOT repeat them as text in the message body — same duplicate rendering bug as Phase 1.

  return text.trim();
}

function formatEngineResponse(engineResponse, session) {
  const { type } = engineResponse;

  // Standard question
  if (type === "question") {
    return {
      text: formatQuestion(engineResponse.question, engineResponse.acknowledgment),
      phase: engineResponse.phase,
      inputMode: engineResponse.question.inputType === "multiple_choice" ? "buttons" : "text",
      options: engineResponse.question.options || null,
      questionLabel: engineResponse.question.label || null
    };
  }

  // Domain question
  if (type === "domain_question") {
    return { text: formatDomainQuestion(), phase: engineResponse.phase, inputMode: "text" };
  }

  // Subdomain question
  if (type === "subdomain_question") {
    const menu = questions.SUBDOMAIN_MENUS[engineResponse.domain];
    return {
      text: formatSubdomainQuestion(engineResponse.domain, engineResponse.expressedBreadth),
      phase: engineResponse.phase,
      inputMode: "buttons",
      options: menu ? menu.options.map((opt, idx) => ({
        id: String.fromCharCode(97 + idx),
        text: opt.text,
        archetype: null
      })) : null
    };
  }

  // Clarification
  if (type === "clarification") {
    return {
      text: voice.CLARIFICATIONS[engineResponse.key] || "Please select one of the options.",
      phase: session.phase,
      inputMode: "text"
    };
  }

  // Phase 3 handoff — Phase 2 complete, pass structured context to Signal Reader agent
  if (type === "phase3_handoff") {
    return {
      text: voice.PHASE3_TRANSITION,
      phase: engineResponse.phase,
      inputMode: "none",
      handoff: engineResponse.handoff,
      isHandoff: true
    };
  }


  // Unknown engine response type — log it so we can catch new types that lack a formatter.
  // This turns a silent "Something went wrong" into a debuggable surface.
  console.warn("formatEngineResponse: unhandled type:", type, JSON.stringify(engineResponse));
  return {
    text: `Unexpected response type: ${type || "undefined"}. Please refresh and try again.`,
    phase: session.phase,
    inputMode: "text"
  };
}

// ─── Main handler ─────────────────────────────────────────────────────────────
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
      session   = engine.createSession();
      sessions.set(sessionId, session);

      const firstResponse = engine.start(session);
      const formatted     = formatEngineResponse(firstResponse, session);

      return res.status(200).json({
        message:   formatted.text,
        sessionId,
        phase:     formatted.phase,
        phaseLabel: voice.getPhaseLabel(session.phase),
        inputMode: formatted.inputMode,
        options:   formatted.options || null,
        questionLabel: formatted.questionLabel || null
      });
    }

    session = sessions.get(sessionId);

    if (session.status === "complete") {
      return res.status(200).json({
        message:   "Your Purpose Piece has been delivered. Refresh to start a new session.",
        sessionId,
        phase:     4,
        inputMode: "none"
      });
    }

    const userMessages     = messages.filter(m => m.role === "user");
    const latestInput      = userMessages[userMessages.length - 1]?.content || "";

    // ── Off-road detection ────────────────────────────────────────────────────
    if (isOffRoad(latestInput, session.phase)) {
      const offRoadResponse = await handleOffRoad(latestInput, session);
      return res.status(200).json({
        message:    offRoadResponse,
        sessionId,
        phase:      session.phase,
        phaseLabel: voice.getPhaseLabel(session.phase),
        inputMode:  "text",
        isOffRoad:  true
      });
    }

    // ── Engine ────────────────────────────────────────────────────────────────
    const engineResponse = engine.answer(session, latestInput);
    const formatted      = formatEngineResponse(engineResponse, session);

    return res.status(200).json({
      message:    formatted.text,
      sessionId,
      phase:      formatted.phase,
      phaseLabel: voice.getPhaseLabel(formatted.phase || session.phase),
      inputMode:  formatted.inputMode,
      options:    formatted.options || null,
      complete:   formatted.complete || false,
      questionLabel: formatted.questionLabel || null,
      isHandoff:  formatted.isHandoff || false,
      handoff:    formatted.handoff || null
    });

  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
};
