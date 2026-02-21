// PURPOSE PIECE v3 — API HANDLER
// Uses engine-v3 for structure, Claude only for natural language moments

const Anthropic = require("@anthropic-ai/sdk");
const engine = require("../lib/engine-v3");

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const sessions = new Map();

function generateSessionId() {
  return Math.random().toString(36).slice(2, 10);
}

function buildWelcome() {
  return `Welcome. I'm here to help you see where you fit in the work of building humanity's future.

This will take about 5 minutes. Three quick questions to get a sense of your pattern, then we'll make sure it fits.

There are no wrong answers. Pick what feels most true in your actual life — not what you wish were true.

Ready?`;
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

async function callClaude(prompt) {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1200,
    system: "You are the Purpose Piece Guide. Warm Architect voice. Precise, grounded, never jargony. Frame results as pattern observed, not identity assigned.",
    messages: [{ role: "user", content: prompt }]
  });
  return response.content[0].text;
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");
  
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  
  const { messages, sessionId: clientSessionId } = req.body || {};
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array required" });
  }
  
  try {
    let sessionId = clientSessionId;
    let session;
    
    if (!sessionId || !sessions.has(sessionId)) {
      sessionId = generateSessionId();
      session = engine.createSession();
      sessions.set(sessionId, session);
      
      const welcomeText = buildWelcome();
      const firstResponse = engine.start(session);
      const firstQuestion = formatQuestion(firstResponse.question, null);
      
      return res.status(200).json({
        message: `${welcomeText}\n\n${firstQuestion}`,
        sessionId: sessionId
      });
    }
    
    session = sessions.get(sessionId);
    
    const userMessages = messages.filter(m => m.role === "user");
    const latestUserMessage = userMessages[userMessages.length - 1]?.content || "";
    
    if (session.status === "complete") {
      return res.status(200).json({
        message: "Your Purpose Piece has been delivered. Refresh to start a new session."
      });
    }
    
    const engineResponse = engine.answer(session, latestUserMessage);
    
    // Regular question
    if (engineResponse.type === "question") {
      const text = formatQuestion(engineResponse.question, engineResponse.acknowledgment);
      return res.status(200).json({ message: text });
    }
    
    // Question as plain text (subdomain menu)
    if (engineResponse.type === "question_text") {
      let text = "";
      if (engineResponse.acknowledgment) {
        text = engineResponse.acknowledgment + "\n\n";
      }
      text += engineResponse.text;
      return res.status(200).json({ message: text });
    }
    
    // Clarification
    if (engineResponse.type === "clarification") {
      return res.status(200).json({ message: engineResponse.message });
    }
    
    // Recognition Step 1: Behavioral description
    if (engineResponse.type === "recognition_step_1") {
      let text = "";
      if (engineResponse.acknowledgment) {
        text = engineResponse.acknowledgment + "\n\n";
      }
      text += engineResponse.behavioralDescription;
      text += "\n\nDoes that feel accurate?";
      
      return res.status(200).json({ message: text });
    }
    
    // Recognition Step 2: World impact
    if (engineResponse.type === "recognition_step_2") {
      const text = engineResponse.worldImpact + "\n\nDoes that feel like what you do in the world?";
      return res.status(200).json({ message: text });
    }
    
    // Recognition Step 3: Name the archetype
    if (engineResponse.type === "recognition_step_3") {
      let text = `The shorthand for this pattern: ${engineResponse.archetypeName}`;
      if (engineResponse.secondaryName) {
        text += ` with ${engineResponse.secondaryName} qualities`;
      }
      text += ".\n\nLet me show you the full picture.";
      
      // Trigger profile delivery on next turn
      session.recognitionStep = 4;
      return res.status(200).json({ message: text });
    }
    
    // Full profile delivery
    if (engineResponse.type === "full_profile") {
      const profile = engineResponse.profile;
      const archetype = engineResponse.archetype;
      const domain = engineResponse.domain;
      const scale = engineResponse.scale;
      
      // Build the profile text
      let profileText = `YOUR PURPOSE PIECE\n\n`;
      profileText += `Archetype: ${archetype}`;
      if (engineResponse.secondary) {
        profileText += ` + ${engineResponse.secondary}`;
      }
      profileText += `\n`;
      profileText += `Domain: ${domain}\n`;
      profileText += `Scale: ${scale}\n\n`;
      
      profileText += `${profile.description}\n\n`;
      
      profileText += `SIGNATURE STRENGTHS:\n`;
      profile.signatureStrengths.forEach(s => {
        profileText += `• ${s}\n`;
      });
      profileText += `\n`;
      
      profileText += `SHADOW PATTERNS:\n`;
      profile.shadowPatterns.forEach(s => {
        profileText += `• ${s}\n`;
      });
      profileText += `\n`;
      
      profileText += `RE-ALIGNMENT CUES:\n`;
      profile.realignmentCues.forEach(q => {
        profileText += `• ${q}\n`;
      });
      profileText += `\n`;
      
      profileText += `WHY THIS MATTERS:\n${profile.whyItMatters}\n\n`;
      
      profileText += `---\n\nThis is your Purpose Piece. Not who you are — but where you fit in the work of building humanity's future.`;
      
      session.status = "complete";
      
      return res.status(200).json({ message: profileText });
    }
    
    // Correction needed
    if (engineResponse.type === "correction_needed") {
      return res.status(200).json({ message: engineResponse.text });
    }
    
    // Error
    return res.status(200).json({ message: "Something unexpected happened. Please refresh and try again." });
    
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message
    });
  }
};
