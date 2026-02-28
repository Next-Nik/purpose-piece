// PURPOSE PIECE — REVELATION ENGINE
// Architecture: Behavior → Tension → Mirror → Frame
// Stateless: session object lives on the client, sent with every request.

const Anthropic = require("@anthropic-ai/sdk");
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Session factory ──────────────────────────────────────────────────────────
function createSession() {
  return {
    phase:         "welcome",
    questionIndex: 0,
    probeCount:    0,
    transcript:    [],
    synthesis:     null,
    status:        "active"
  };
}

// ─── The five questions ───────────────────────────────────────────────────────
const QUESTIONS = [
  {
    label: "The Moment",
    text: "Think of a recent moment where something around you was off — at work, in a community, at home, anywhere. Maybe you stepped in. Maybe you didn't. Maybe you're still not sure you did the right thing either way.\n\nWhat happened, and what did you do — or not do?"
  },
  {
    label: "The Frustration",
    text: "What's something you keep noticing in the world around you — in organisations, communities, systems, relationships — that frustrates you not because it affects you personally, but because it simply shouldn't be that way?\n\nBe specific. What is it exactly?"
  },
  {
    label: "The Pressure",
    text: "Describe a moment in the last year or two where you had to make a real decision with incomplete information and something genuinely at stake.\n\nWhat did you do — and what did you deliberately not do?"
  },
  {
    label: "The Cost",
    text: "This one is harder. Take your time.\n\nWhat does your particular way of moving through the world cost you? Not what you find difficult in general — what specifically does your instinct ask of you that others don't seem to pay?"
  },
  {
    label: "The Obligation",
    text: "What's something you haven't done yet that sits with you — not as a goal you're working toward, but as something that feels more like a debt?\n\nSomething that would produce guilt if it remained undone."
  }
];

// ─── Scripted probes per question ────────────────────────────────────────────
const PROBES = [
  [
    "Give me one specific moment from that situation. Where were you, and what did you actually do first?",
    "Even a small action counts. What was the very first thing you did — or consciously chose not to do?"
  ],
  [
    "Can you name a specific instance where you saw this? Even a recent small example.",
    "What does it look like in practice — what actually happens that shouldn't be happening?"
  ],
  [
    "What were the actual stakes — what could have gone wrong? And what did you do in the first 24-48 hours?",
    "Walk me through one decision you made. What information did you have, and what did you do with it?"
  ],
  [
    "Think of a specific situation where your way of operating made something harder for you. What happened?",
    "What do people around you not seem to pay — what's the thing you carry that others put down more easily?"
  ],
  [
    "What makes this feel like a debt rather than a goal? Is there a person involved, or a moment you're aware of passing?",
    "If it remained undone — what specifically would you feel guilty about?"
  ]
];

// ─── Thin answer detection ────────────────────────────────────────────────────
const GENERIC_DEFLECTORS = [
  "it depends","not sure","i guess","maybe","hard to say",
  "whatever","idk","don't know","no idea","not really",
  "i don't know","nothing comes to mind","can't think"
];

const TIME_ANCHORS = [
  "last week","yesterday","last month","last year","recently",
  "in 2024","in 2023","a few weeks","a few months","this year",
  "this week","today","ago","when i","after i","before i"
];

const ACTION_VERBS = [
  "called","asked","built","avoided","stepped","said","told",
  "decided","chose","left","stayed","went","made","helped",
  "stopped","started","reached out","spoke","wrote","created",
  "organized","refused","accepted","pushed","pulled","watched"
];

function isThin(answer, qi) {
  const lower = answer.toLowerCase().trim();
  const words = answer.trim().split(/\s+/).filter(Boolean);

  const minWords = qi === 3 ? 15 : 20;
  if (words.length < minWords) return true;

  const deflectorCount = GENERIC_DEFLECTORS.filter(d => lower.includes(d)).length;
  if (deflectorCount >= 2) return true;

  if ([0, 1, 2].includes(qi)) {
    const hasTime    = TIME_ANCHORS.some(t => lower.includes(t));
    const hasAction  = ACTION_VERBS.some(v => lower.includes(v));
    const hasSetting = /\b(work|office|home|family|friend|community|meeting|team|partner|colleague|school|hospital|city|neighbourhood|neighborhood)\b/.test(lower);
    if (!hasTime && !hasAction && !hasSetting) return true;
  }

  return false;
}

// ─── Claude signal check (escalation after 2 failed probes) ──────────────────
async function claudeSignalCheck(question, answer) {
  try {
    const response = await anthropic.messages.create({
      model:      "claude-sonnet-4-20250514",
      max_tokens: 200,
      messages:   [{
        role:    "user",
        content: `Evaluate signal quality for a behavioural assessment answer.\n\nQuestion: "${question}"\nAnswer: "${answer}"\n\nReturn JSON only:\n{"has_signal": true or false, "missing": ["concrete_example","emotions","cost","stakes"], "one_probe_question": "single best follow-up"}`
      }]
    });
    return extractJSON(response.content[0].text);
  } catch {
    return { has_signal: true };
  }
}

// ─── Robust JSON extractor ───────────────────────────────────────────────────
function extractJSON(text) {
  // Strip markdown fences
  let clean = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
  // Try direct parse first
  try { return JSON.parse(clean); } catch {}
  // Find first { to last } 
  const start = clean.indexOf("{");
  const end   = clean.lastIndexOf("}");
  if (start !== -1 && end !== -1) {
    try { return JSON.parse(clean.slice(start, end + 1)); } catch {}
  }
  throw new Error("Could not extract JSON from response: " + text.slice(0, 200));
}

// ─── Phase 3 system prompt ────────────────────────────────────────────────────
const PHASE3_SYSTEM = `You are the synthesis layer of Purpose Piece — a recognition engine designed to make someone's pattern of movement undeniable to them.

You have just received five answers from a person who has responded to five behavioural questions. Your job is not to categorise them. Not yet. Your job is to hold up a mirror so precise and specific that they feel — before any label arrives — that they have been genuinely studied.

WHAT YOU ARE DOING:
You are identifying the pattern that repeats across all five answers. Not the content of each answer — the movement underneath the content. The instinct that shows up regardless of context. The emotional logic that connects what they did in Q1 to what frustrated them in Q2 to how they moved under pressure in Q3 to what it costs them in Q4 to what sits unfinished in Q5.

Your synthesis must feel like: "I have been watching you for a long time."
Not like: "Based on your answers, you appear to be..."

WHAT YOU ARE NOT DOING:
You are not naming an archetype. Not yet. Not even implicitly.
You are not praising them. Warmth is appropriate. Flattery is not.
You are not diagnosing them. You are observing pattern.
You are not summarising their answers back to them. Reflection is not repetition.

STRUCTURE — three to four paragraphs. No headers. No bullet points. Flowing, precise prose.

Paragraph 1 — The repeated instinct:
What does this person do — or not do — when something requires attention? Describe the consistent movement in behavioural terms. Reference their actual situations without quoting them directly. You may echo one short phrase they used (3-6 words max) if it sharpens recognition — no more than once. Do not open with generic summarising language. Enter through something specific — a detail, a moment, a word that unlocks the pattern.

Paragraph 2 — The emotional logic:
Why do they move that way? What does the emotional signal in Q2 reveal about what they value? What does Q3 reveal about how they think under pressure? Connect instinct to motivation. If multiple competing patterns appear, acknowledge the tension rather than prematurely resolving it. Real people are often blended. That tension is not a problem — it is part of the pattern.

Paragraph 3 — The cost and the tension:
What does Q4 reveal about what this pattern asks of them? Name it precisely. Do not soften it. At least one sentence should name something the person may not be fully comfortable admitting. That discomfort is the "oh." If Q5 connects to the cost, bring it in here.

Paragraph 4 — The throughline:
Attempt to name the underlying throughline. If the pattern is clear, name it directly. If subtle or blended, articulate the tension rather than forcing profundity. Reach. Do not default to safety. Stay tethered to their evidence.

THE RULES:
- Never write "You are." Use "You tend to" / "When under pressure, you" / "What appears across everything you've described"
- Never mention an archetype name. Not even as a hint.
- Never mention domain or scale.
- Never use "clearly" or "simply"
- Avoid declarative identity language even if grammatically subtle
- Avoid grandiose claims. Stay tethered to their evidence.
- Avoid filler transitions. Every sentence must introduce new insight or deepen the pattern.
- If an answer was thin or evasive — note what that reveals. Avoidance is data.
- Tone: measured, calm, precise, unhurried.
- Length: 250-350 words. Every sentence earns its place.

THE TEST:
Does this read like something that could have been written about anyone? If yes — go deeper.
The emotional endpoint is not "that's accurate." It is "oh."

OUTPUT — return JSON only, no other text:
{
  "synthesis_text": "250-350 word mirror",
  "internal_signals": {
    "signals_detected": {
      "movement_style": "brief description",
      "decision_bias": "brief description",
      "primary_value": "brief description",
      "stress_response": "brief description",
      "cost_pattern": "brief description",
      "avoidance_signal": "brief description or null",
      "scale_pull": "brief description",
      "relational_vector": "brief description"
    },
    "confidence": "strong / blended / thin / contradictory",
    "confidence_notes": "1-2 sentences on signal quality"
  }
}`;

async function runPhase3(transcript) {
  const transcriptText = transcript.map((entry, i) => {
    let text = `Q${i+1} — ${QUESTIONS[i].label}\nQuestion: ${QUESTIONS[i].text}\nAnswer: ${entry.answer}`;
    if (entry.probes && entry.probes.length > 0) {
      entry.probes.forEach(p => { text += `\nProbe: ${p.probe}\nResponse: ${p.response}`; });
    }
    if (entry.thin) text += `\n[Note: Answer remained thin after probing — treat evasion as signal.]`;
    return text;
  }).join("\n\n---\n\n");

  const response = await anthropic.messages.create({
    model:      "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system:     PHASE3_SYSTEM,
    messages:   [{ role: "user", content: `Here are the five answers:\n\n${transcriptText}` }]
  });

  return extractJSON(response.content[0].text);
}

// ─── Phase 4 system prompt ────────────────────────────────────────────────────
const PHASE4_SYSTEM = `You are the framing layer of Purpose Piece. Phase 3 has delivered a precise behavioural mirror. The user has recognised themselves in it. Now name what was observed — and frame what that naming asks of them.

This is not a reveal. It is a consequence.

THE SEVEN ARCHETYPES:
- STEWARD: Tends systems, ensures they remain whole. Maintains, repairs, sustains. Patient with operational work.
- MAKER: Builds what doesn't exist. Concept to creation. Comfortable with iteration. Values function over perfection.
- ARCHITECT: Designs the structural conditions that determine what can be built at all. Doesn't build the thing — designs the container the thing lives inside. When something keeps breaking, redesigns the conditions producing the break. Energised by making the system sound, not shipping the output.
- CONNECTOR: Weaves relationships, creates networks. Sees who needs who. Facilitates without dominating.
- GUARDIAN: Protects what matters, holds boundaries. Recognises threats early. Fierce protecting, gentle tending.
- EXPLORER: Ventures into unknown territory, brings back what's needed. Comfortable with uncertainty.
- SAGE: Holds wisdom, offers perspective that clarifies. Sees patterns across time. Values understanding over action.

THE SEVEN DOMAINS:
- HUMAN BEING: Personal development, consciousness, inner work, transformation.
- SOCIETY: Governance, culture, community, social structures.
- NATURE: Environment, ecology, planetary health, regeneration.
- TECHNOLOGY: Tools, infrastructure, innovation, digital and physical systems.
- FINANCE & ECONOMY: Resources, exchange, wealth, value creation and distribution.
- LEGACY: Long-term thinking, intergenerational work, preservation, deep time.
- VISION: Future imagination, possibility, coordination, collective direction.

THE FOUR SCALES:
- LOCAL: Neighbourhood, community level. Face-to-face. Immediate impact.
- BIOREGIONAL: Watershed, region level. Multi-community. Ecological boundaries.
- GLOBAL: International, planetary systems. Cross-border challenges.
- CIVILISATIONAL: Intergenerational, species-level. 100+ year timelines.

STRUCTURE:

Section 1 — State the pattern (1 paragraph, 1-3 sentences):
Restate the throughline from Phase 3 — sharper. Compression, not repetition. Do not open with the archetype name. Open with the pattern.

Section 2 — Introduce the archetype (1 paragraph):
"The pattern most aligned with this movement is [Archetype]."
Explain what this archetype does in concrete behavioural terms — not what it is, what it does. Avoid mythic abstraction. If confidence is blended or contradictory — name primary and acknowledge secondary directly. Do not smooth over tension.

Section 3 — Domain (1 paragraph):
"The territory where this pattern most wants to operate is [Domain]."
Derive from what they actually said. Justify with at least one reference to their specific lived example.

Section 4 — Scale (1 paragraph):
"The scale where this pattern is most coherent right now is [Scale]."
Scale = coherence bandwidth, not ambition. Do not assume larger scale is more evolved. If there is tension between current and aspirational scale — name it. Do not resolve it.

Section 5 — Responsibility (2-4 sentences):
Name what this pattern asks of them. What does carrying this instinct require? What does it cost if left unexpressed? Include one line grounding responsibility in capacity: this pattern exists because something in them is built for it. That is not praise — it is why the responsibility is legitimate.

Section 6 — Actions:
Introduce: "Here is what this looks like in practice."
Three tiers — each specific to this person's context, not generic archetype actions:
Light (this week): 30-60 minutes. No special resources. Start today.
Medium (ongoing): A few hours, recurring. Builds over time.
Deep (structural): Weeks to months. The thing their pattern is built for.

Section 7 — Resources (3-5 items):
Chosen for this specific person's pattern, tension, and texture — not a generic reading list.
Each: title + author/source + one sentence explaining why it is specifically for them.
At least one must address the tension or cost from Phase 3 — not just archetype strength.
At least one must be immediately accessible today.
Mix formats: books, essays, talks, organisations, people.

THE RULES:
- Never say "You are a [Archetype]." Say "The pattern most aligned with this is [Archetype]."
- Never smooth over blended/contradictory signals. Name the tension.
- Never motivate. Responsibility carries weight, not energy.
- Never produce generic actions or resources.
- Avoid grandiose claims. Stay tethered to evidence.
- Tone: measured, precise, calm. Phase 4 is not louder than Phase 3. It is clearer.

TONAL TRANSITION:
Phase 3: "I see you."
Phase 4: "Now this matters."
User finishes feeling located, not celebrated.

OUTPUT — return JSON only, no other text:
{
  "pattern_restatement": "1 paragraph",
  "archetype_frame": "1 paragraph",
  "domain_frame": "1 paragraph",
  "scale_frame": "1 paragraph",
  "responsibility": "2-4 sentences",
  "actions": {
    "light": "specific action with brief context",
    "medium": "specific action with brief context",
    "deep": "specific action with brief context"
  },
  "resources": [
    {"title": "Title — Author or Source", "why": "one sentence specific to this person"}
  ]
}`;

async function runPhase4(transcript, synthesis) {
  const transcriptText = transcript.map((entry, i) =>
    `Q${i+1} — ${QUESTIONS[i].label}\nAnswer: ${entry.answer}${entry.thin ? " [thin/evasive]" : ""}`
  ).join("\n\n");

  const payload = `PHASE 3 SYNTHESIS:\n${synthesis.synthesis_text}\n\nINTERNAL SIGNALS:\n${JSON.stringify(synthesis.internal_signals, null, 2)}\n\nORIGINAL ANSWERS:\n${transcriptText}`;

  const response = await anthropic.messages.create({
    model:      "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system:     PHASE4_SYSTEM,
    messages:   [{ role: "user", content: payload }]
  });

  return extractJSON(response.content[0].text);
}

// ─── Sanitise text for safe HTML insertion ───────────────────────────────────
function esc(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ─── Render Phase 4 as structured HTML ───────────────────────────────────────
function renderPhase4(p4) {

  // Extract archetype / domain / scale from frame text
  const archetypeMatch = p4.archetype_frame.match(/pattern most aligned with this (?:movement )?is ([\w]+)/i);
  const archetypeName  = archetypeMatch ? archetypeMatch[1] : "Your Pattern";

  const domainMatch = p4.domain_frame.match(/territory.*?is ([A-Z][a-z]+(?: ?[&A-Z][a-z]+)*)/); 
  const domainName  = domainMatch ? domainMatch[1].trim() : "";

  const scaleMatch = p4.scale_frame.match(/scale.*?is ([A-Z][a-z]+)/);
  const scaleName  = scaleMatch ? scaleMatch[1].trim() : "";

  const resourcesHtml = p4.resources.map(r =>
    `<div class="profile-resource">
      <div class="profile-resource-title">${esc(r.title)}</div>
      <div class="profile-resource-why">${esc(r.why)}</div>
    </div>`
  ).join("");

  return `<div class="profile-card">

    <div class="profile-hero">
      <div class="profile-archetype-name">${esc(archetypeName)}</div>
      <div class="profile-meta">${esc(domainName)}${domainName && scaleName ? " &middot; " : ""}${esc(scaleName)}</div>
    </div>

    <div class="profile-section">
      <div class="profile-section-label">Pattern</div>
      <p>${esc(p4.pattern_restatement)}</p>
    </div>

    <div class="profile-section">
      <div class="profile-section-label">Archetype</div>
      <p>${esc(p4.archetype_frame)}</p>
    </div>

    <div class="profile-section">
      <div class="profile-section-label">Domain</div>
      <p>${esc(p4.domain_frame)}</p>
    </div>

    <div class="profile-section">
      <div class="profile-section-label">Scale</div>
      <p>${esc(p4.scale_frame)}</p>
    </div>

    <div class="profile-section">
      <div class="profile-section-label">Responsibility</div>
      <p>${esc(p4.responsibility)}</p>
    </div>

    <div class="profile-rule"></div>

    <div class="profile-section">
      <div class="profile-section-label">What this looks like</div>
      <div class="profile-actions">
        <div class="profile-action">
          <span class="profile-action-tier">This week</span>
          <span>${esc(p4.actions.light)}</span>
        </div>
        <div class="profile-action">
          <span class="profile-action-tier">Ongoing</span>
          <span>${esc(p4.actions.medium)}</span>
        </div>
        <div class="profile-action">
          <span class="profile-action-tier">Structural</span>
          <span>${esc(p4.actions.deep)}</span>
        </div>
      </div>
    </div>

    <div class="profile-section profile-section-resources">
      <div class="profile-section-label">Worth exploring</div>
      <div class="profile-resources">${resourcesHtml}</div>
    </div>

    <div class="profile-closing">Your Purpose Piece. This is where you fit.</div>

  </div>`;
}

// ─── Welcome message ──────────────────────────────────────────────────────────
const WELCOME = `Five questions. Each one asks for a specific moment, a real decision, an honest cost.

Answer as yourself — not who you're working toward.

At the end, you'll receive a profile: your Purpose Piece, the domain where it belongs, the scale where it's most coherent right now, and what it asks of you.

The pattern speaks through what you actually do.`;

// ─── Main handler ─────────────────────────────────────────────────────────────
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");

  if (req.method === "OPTIONS") { res.status(200).end(); return; }

  // ── Parse body ──────────────────────────────────────────────────────────────
  const { messages, session: clientSession } = req.body || {};
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array required" });
  }

  try {
    // ── New session (no session sent, or first call) ──────────────────────────
    let session = clientSession || null;

    if (!session || session.status === undefined) {
      session = createSession();
      session.phase = "questions";
      return res.status(200).json({
        message:       `Question 1 of 5\n\n${QUESTIONS[0].text}`,
        session,
        phase:         "questions",
        phaseLabel:    "Behavioural Evidence",
        questionIndex: 0,
        inputMode:     "text"
      });
    }

    // ── Complete ──────────────────────────────────────────────────────────────
    if (session.status === "complete") {
      return res.status(200).json({
        message:   "Your Purpose Piece has been delivered. Refresh to begin again.",
        session,
        phase:     "complete",
        inputMode: "none"
      });
    }

    const userMessages = messages.filter(m => m.role === "user");
    const latestInput  = userMessages[userMessages.length - 1]?.content?.trim() || "";
    const qi           = session.questionIndex;

    // ── Welcome → Q1 ─────────────────────────────────────────────────────────
    if (session.phase === "welcome") {
      session.phase = "questions";
      return res.status(200).json({
        message:       `Question 1 of 5\n\n${QUESTIONS[0].text}`,
        session,
        phase:         "questions",
        phaseLabel:    "Behavioural Evidence",
        questionIndex: 0,
        inputMode:     "text"
      });
    }

    // ── Question phase ────────────────────────────────────────────────────────
    if (session.phase === "questions") {
      const entry = session.transcript[qi];

      // No entry yet — first answer to this question
      if (!entry) {
        const thin = isThin(latestInput, qi);

        if (!thin) {
          session.transcript.push({ question: QUESTIONS[qi].text, answer: latestInput, probes: [], thin: false });
          session.probeCount = 0;
          session.questionIndex++;

          if (session.questionIndex >= 5) {
          // Return thinking state first — client will autoAdvance into synthesis
          session.phase = "thinking";
          return res.status(200).json({
            message:      "Reading the pattern in your answers.\n\nThis takes a moment...",
            session,
            phase:        "thinking",
            phaseLabel:   "Signal Reading",
            inputMode:    "none",
            autoAdvance:  true,
            advanceDelay: 2000
          });
        }

          return res.status(200).json({
            message:       `Question ${session.questionIndex + 1} of 5\n\n${QUESTIONS[session.questionIndex].text}`,
            session,
            phase:         "questions",
            phaseLabel:    "Behavioural Evidence",
            questionIndex: session.questionIndex,
            inputMode:     "text"
          });
        }

        // Thin — probe 1
        session.transcript.push({ question: QUESTIONS[qi].text, answer: latestInput, probes: [], thin: false });
        session.probeCount = 1;
        return res.status(200).json({
          message: PROBES[qi][0], session, phase: "questions",
          phaseLabel: "Behavioural Evidence", inputMode: "text", isProbe: true
        });
      }

      // Responding to a probe
      entry.probes.push({ probe: PROBES[qi][session.probeCount - 1], response: latestInput });
      const combined = entry.answer + " " + entry.probes.map(p => p.response).join(" ");
      const thin     = isThin(combined, qi);

      if (!thin || session.probeCount >= 2) {
        if (session.probeCount >= 2 && thin) {
          const check = await claudeSignalCheck(QUESTIONS[qi].text, combined);
          entry.thin = !check.has_signal;
        }

        session.probeCount = 0;
        session.questionIndex++;

        if (session.questionIndex >= 5) {
          session.phase = "thinking";
          return res.status(200).json({
            message:      "Reading the pattern in your answers.\n\nThis takes a moment...",
            session,
            phase:        "thinking",
            phaseLabel:   "Signal Reading",
            inputMode:    "none",
            autoAdvance:  true,
            advanceDelay: 2000
          });
        }

        return res.status(200).json({
          message:       `Question ${session.questionIndex + 1} of 5\n\n${QUESTIONS[session.questionIndex].text}`,
          session,
          phase:         "questions",
          phaseLabel:    "Behavioural Evidence",
          questionIndex: session.questionIndex,
          inputMode:     "text"
        });
      }

      // Still thin — probe 2
      session.probeCount = 2;
      return res.status(200).json({
        message: PROBES[qi][1], session, phase: "questions",
        phaseLabel: "Behavioural Evidence", inputMode: "text", isProbe: true
      });
    }

    // ── Thinking phase → trigger synthesis ───────────────────────────────────
    if (session.phase === "thinking") {
      return await synthesiseAndFrame(session, res);
    }

    // ── Framing phase (Phase 4) ───────────────────────────────────────────────
    if (session.phase === "framing") {
      return await frameAndDeliver(session, res);
    }

    return res.status(200).json({ message: "Something went wrong. Please refresh.", session, inputMode: "text" });

  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

// ─── Synthesis → framing pipeline ────────────────────────────────────────────
async function synthesiseAndFrame(session, res) {
  session.phase = "synthesis";

  let synthesis;
  try {
    synthesis = await runPhase3(session.transcript);
  } catch (e) {
    console.error("Phase 3 error:", e);
    return res.status(500).json({ error: "Synthesis failed", details: e.message });
  }

  session.synthesis = synthesis;
  session.phase     = "framing";

  return res.status(200).json({
    message:      synthesis.synthesis_text,
    session,
    phase:        "synthesis",
    phaseLabel:   "Signal Reading",
    inputMode:    "none",
    autoAdvance:  true,
    advanceDelay: 6000
  });
}

async function frameAndDeliver(session, res) {
  let p4;
  try {
    p4 = await runPhase4(session.transcript, session.synthesis);
  } catch (e) {
    console.error("Phase 4 error:", e);
    return res.status(500).json({ error: "Framing failed", details: e.message });
  }

  session.status = "complete";

  return res.status(200).json({
    message:    renderPhase4(p4),
    session,
    phase:      "complete",
    phaseLabel: "Your Purpose Piece",
    inputMode:  "none",
    complete:   true,
    profile:    p4
  });
}
