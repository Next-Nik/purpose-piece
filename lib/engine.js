// Purpose Piece — Conversation Engine v2.0
//
// Responsibilities:
//   1. Drive the question flow (Phase 1 → 2 → 3)
//   2. Call scoring.js after each answer
//   3. Insert acknowledgments between questions
//   4. Select next Phase 2 question dynamically
//   5. Generate Phase 3 validation summary
//   6. Handle correction cycles
//   7. Render the final full profile to chat
//
// Usage:
//   const engine = require('./engine');
//   const session = engine.createSession();
//   const first = engine.start(session);       // returns first question to display
//   const next  = engine.answer(session, 'b'); // returns next question or result
//
// The engine is stateless between calls — all state lives in the session object.
// Sessions can be serialised to JSON for persistence.

const scoring = require('./scoring');
const { questions, phase2SelectionRules } = require('./questions');
const { profiles, domainModifiers, scaleModifiers, blendedDescriptions } = require('./profiles');

// ─────────────────────────────────────────────
// ACKNOWLEDGMENT LIBRARY
// Neutral, non-evaluative. Rotated to avoid mechanical feel.
// Phase 1: terse. Phase 2: slightly warmer. Phase 3: transitional.
// ─────────────────────────────────────────────

const acknowledgments = {
  // Phase 1 — used from Q3 onward (Q1 and Q2 show next Q directly)
  phase1: [
    "Got it.",
    "Noted.",
    "Makes sense.",
    "Okay.",
    "Good."
  ],
  // Phase 2
  phase2: [
    "That's helpful.",
    "Good to know.",
    "Okay, one more.",
    "Interesting — this'll sharpen the picture."
  ],
  // Before Phase 3 summary
  phase3_intro: [
    "Alright — here's what I'm seeing.",
    "Okay. Based on what you've shared:",
    "Here's the pattern that comes through."
  ]
};

// Track which acknowledgment was last used (per-session) to avoid immediate repeats
function getAcknowledgment(pool, lastUsed) {
  const available = pool.filter(a => a !== lastUsed);
  return available[Math.floor(Math.random() * available.length)];
}

// ─────────────────────────────────────────────
// PHASE 1 QUESTION SEQUENCE
// Fixed order. Supplemental questions added if needed.
// ─────────────────────────────────────────────

const PHASE1_CORE_IDS = ["p1_q1", "p1_q2", "p1_q3", "p1_q4", "p1_q5"];
const PHASE1_SUPPLEMENTAL_IDS = ["p1_q6", "p1_q7"];

// ─────────────────────────────────────────────
// SESSION
// ─────────────────────────────────────────────

/**
 * Create a new session. Call once per user quiz attempt.
 */
function createSession() {
  return {
    scoreState: scoring.initScoreState(),
    phase: 1,
    phase1QuestionsAnswered: 0,
    phase2QuestionsAnswered: 0,
    askedQuestionIds: [],
    correctionCycles: 0,
    lastAcknowledgment: null,
    status: "active",  // active | validating | correcting | complete
    pendingResult: null // set after Phase 2, used in Phase 3
  };
}

// ─────────────────────────────────────────────
// START
// ─────────────────────────────────────────────

/**
 * Start the session. Returns the first question object to display.
 */
function start(session) {
  const firstQuestion = questions.find(q => q.id === PHASE1_CORE_IDS[0]);
  session.askedQuestionIds.push(firstQuestion.id);
  return { type: "question", question: firstQuestion, acknowledgment: null };
}

// ─────────────────────────────────────────────
// ANSWER
// Main loop. Call with session + user's answer.
// Returns one of:
//   { type: "question",    question, acknowledgment }
//   { type: "validation",  summary, acknowledgment, options }
//   { type: "result",      profile }
//   { type: "correction",  question, acknowledgment }
// ─────────────────────────────────────────────

function answer(session, userAnswer) {

  // ── Validation response (Phase 3) ──────────
  if (session.status === "validating") {
    return handleValidationResponse(session, userAnswer);
  }

  // ── Correction cycle ────────────────────────
  if (session.status === "correcting") {
    return handleCorrectionResponse(session, userAnswer);
  }

  // ── Normal question answer ──────────────────
  const currentQuestion = questions.find(q => q.id === session.askedQuestionIds[session.askedQuestionIds.length - 1]);
  if (!currentQuestion) return { type: "error", message: "Session state error: no current question found." };

  // Process the answer
  if (currentQuestion.inputType === "multiple_choice") {
    session.scoreState = scoring.processMultipleChoice(session.scoreState, currentQuestion, userAnswer);
  } else if (currentQuestion.inputType === "free_text") {
    session.scoreState = scoring.processFreeText(session.scoreState, currentQuestion, userAnswer);
  }

  // Update question counters
  if (currentQuestion.phase === 1) {
    session.phase1QuestionsAnswered++;
  } else if (currentQuestion.phase === 2) {
    session.phase2QuestionsAnswered++;
  }

  // ── Decide what comes next ───────────────────
  return advanceSession(session, currentQuestion.phase);
}

// ─────────────────────────────────────────────
// ADVANCE SESSION
// Called after each answer. Determines what comes next.
// ─────────────────────────────────────────────

function advanceSession(session, justCompletedPhase) {

  if (justCompletedPhase === 1) {
    const advance = scoring.checkPhase1Advance(session.scoreState, session.phase1QuestionsAnswered);

    if (advance.advance) {
      if (advance.ambiguous) {
        // Went to max questions, still low confidence — move to Phase 2 anyway
        session.phase = 2;
        return nextPhase2Question(session);
      }
      session.phase = 2;
      return nextPhase2Question(session);
    } else {
      // Continue Phase 1
      return nextPhase1Question(session);
    }
  }

  if (justCompletedPhase === 2) {
    const advance = scoring.checkPhase2Advance(session.scoreState, session.phase2QuestionsAnswered);

    if (advance.advance) {
      return enterValidation(session);
    } else {
      return nextPhase2Question(session);
    }
  }

  return { type: "error", message: "Unexpected phase state." };
}

// ─────────────────────────────────────────────
// PHASE 1 — NEXT QUESTION
// ─────────────────────────────────────────────

function nextPhase1Question(session) {
  // Determine which Phase 1 question comes next
  const remaining = PHASE1_CORE_IDS.filter(id => !session.askedQuestionIds.includes(id));

  if (remaining.length > 0) {
    const nextId = remaining[0];
    const nextQ = questions.find(q => q.id === nextId);
    session.askedQuestionIds.push(nextId);

    // Acknowledgment: skip for Q1→Q2 (no ack before Q2), add from Q3 onward
    const ack = session.phase1QuestionsAnswered >= 2
      ? getAcknowledgment(acknowledgments.phase1, session.lastAcknowledgment)
      : null;
    if (ack) session.lastAcknowledgment = ack;

    return { type: "question", question: nextQ, acknowledgment: ack };
  }

  // Core Phase 1 done — check if supplementals needed
  const top = scoring.getTopArchetype(session.scoreState);
  if (top.confidence < scoring.THRESHOLDS.phase1_advance) {
    const supplementalRemaining = PHASE1_SUPPLEMENTAL_IDS.filter(id => !session.askedQuestionIds.includes(id));
    if (supplementalRemaining.length > 0) {
      const nextId = supplementalRemaining[0];
      const nextQ = questions.find(q => q.id === nextId);
      session.askedQuestionIds.push(nextId);
      const ack = getAcknowledgment(acknowledgments.phase1, session.lastAcknowledgment);
      session.lastAcknowledgment = ack;
      return { type: "question", question: nextQ, acknowledgment: ack };
    }
  }

  // All Phase 1 done — advance regardless
  session.phase = 2;
  return nextPhase2Question(session);
}

// ─────────────────────────────────────────────
// PHASE 2 — NEXT QUESTION (dynamic selection)
// ─────────────────────────────────────────────

function nextPhase2Question(session) {
  const nextQ = scoring.selectPhase2Question(
    session.scoreState,
    questions,
    session.askedQuestionIds
  );

  if (!nextQ) {
    // No more Phase 2 questions needed or available — go to validation
    return enterValidation(session);
  }

  session.askedQuestionIds.push(nextQ.id);
  const ack = getAcknowledgment(acknowledgments.phase2, session.lastAcknowledgment);
  session.lastAcknowledgment = ack;

  return { type: "question", question: nextQ, acknowledgment: ack };
}

// ─────────────────────────────────────────────
// PHASE 3 — VALIDATION
// ─────────────────────────────────────────────

function enterValidation(session) {
  session.phase = 3;
  session.status = "validating";

  // Generate result now — used for both summary and (if confirmed) full profile
  session.pendingResult = scoring.generateResult(session.scoreState);

  const summary = scoring.generateValidationSummary(session.scoreState);
  const ack = getAcknowledgment(acknowledgments.phase3_intro, session.lastAcknowledgment);
  session.lastAcknowledgment = ack;

  const validationQuestion = questions.find(q => q.id === "p3_summary_prompt");

  return {
    type: "validation",
    acknowledgment: ack,
    summary,
    prompt: validationQuestion.template.replace("{summary}", summary),
    options: validationQuestion.options
  };
}

function handleValidationResponse(session, userResponse) {
  // Options: "It all fits" | "Most of it fits — one part is off" | "It's partly right" | "This doesn't feel like me"

  if (userResponse === "It all fits") {
    return deliverResult(session);
  }

  if (userResponse === "This doesn't feel like me") {
    if (session.correctionCycles >= 2) {
      // Max cycles reached — deliver ambiguous result
      session.pendingResult = scoring.generateAmbiguousResult(session.scoreState);
      return deliverResult(session);
    }
    session.status = "correcting";
    session.correctionCycles++;
    const correctionQ = questions.find(q => q.id === "p3_correction_no");
    return {
      type: "correction",
      acknowledgment: "Okay — let's back up.",
      question: correctionQ
    };
  }

  // "Most of it fits — one part is off" or "It's partly right"
  if (session.correctionCycles >= 2) {
    return deliverResult(session);
  }
  session.status = "correcting";
  session.correctionCycles++;
  const correctionQ = questions.find(q => q.id === "p3_correction_partly");
  return {
    type: "correction",
    acknowledgment: "Noted.",
    question: correctionQ
  };
}

function handleCorrectionResponse(session, userResponse) {
  const lastCorrectionQ = session.askedQuestionIds.includes("p3_correction_partly")
    ? "p3_correction_partly"
    : "p3_correction_no";

  if (lastCorrectionQ === "p3_correction_partly") {
    // Map response to correction type
    const correctionMap = {
      "The role / how I show up": "role",
      "The area of life (nature, technology, people, etc.)": "domain",
      "The scale (local vs. global etc.)": "scale",
      "All of it feels a bit off": "all"
    };
    const correctionType = correctionMap[userResponse] || "all";
    session.scoreState = scoring.applyCorrection(session.scoreState, correctionType, null);
  } else {
    // Free-text correction — process as semantic signal
    const fakeQ = { id: "correction_freetext", phase: 3, inputType: "free_text" };
    session.scoreState = scoring.processFreeText(session.scoreState, fakeQ, userResponse);
  }

  // Re-generate result with corrected state
  session.pendingResult = scoring.generateResult(session.scoreState);
  session.status = "validating";

  // Re-enter validation with updated summary
  const summary = scoring.generateValidationSummary(session.scoreState);
  const validationQuestion = questions.find(q => q.id === "p3_summary_prompt");

  return {
    type: "validation",
    acknowledgment: "Let me recalibrate.",
    summary,
    prompt: validationQuestion.template.replace("{summary}", summary),
    options: validationQuestion.options
  };
}

// ─────────────────────────────────────────────
// RESULT DELIVERY
// Builds and returns the full formatted profile
// ─────────────────────────────────────────────

function deliverResult(session) {
  session.status = "complete";
  const result = session.pendingResult;
  const formatted = renderProfile(result);
  return { type: "result", result, formatted };
}

// ─────────────────────────────────────────────
// PROFILE RENDERER
// Assembles the full profile text from profiles.js data
// Called with the result object from scoring.generateResult()
// ─────────────────────────────────────────────

function renderProfile(result) {
  const domain = domainModifiers[result.domain] || domainModifiers["human_being"];
  const scale = scaleModifiers[result.scale] || scaleModifiers["local"];

  if (result.type === "blended") {
    return renderBlendedProfile(result, domain, scale);
  }

  if (result.type === "ambiguous") {
    return renderAmbiguousProfile(result, domain, scale);
  }

  return renderSingleProfile(result, domain, scale);
}

// ─────────────────────────────────────────────

function renderSingleProfile(result, domain, scale) {
  const profile = profiles[result.primaryArchetype];
  if (!profile) return "Profile data not found for archetype: " + result.primaryArchetype;

  const lines = [];

  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  lines.push("YOUR PURPOSE PIECE");
  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  lines.push("");
  lines.push(`Archetype:  ${profile.label}`);
  lines.push(`Domain:     ${domain.label}`);
  lines.push(`Scale:      ${scale.label}`);
  lines.push("");
  lines.push(`${profile.tagline.toUpperCase()}`);
  lines.push("");

  // Description + domain context
  lines.push(profile.description);
  lines.push("");
  lines.push(domain.context);
  lines.push("");
  lines.push(`At the ${scale.label.toLowerCase()} scale: ${scale.context}`);
  lines.push("");

  // Signature Strengths
  lines.push("SIGNATURE STRENGTHS");
  lines.push("─────────────────────");
  for (const strength of profile.signatureStrengths) {
    lines.push(`• ${strength}`);
  }
  lines.push("");

  // Shadow Patterns
  lines.push("SHADOW PATTERNS");
  lines.push("─────────────────────");
  for (const shadow of profile.shadowPatterns) {
    lines.push(`• ${shadow}`);
  }
  lines.push("");

  // Re-alignment Cues
  lines.push("RE-ALIGNMENT CUES");
  lines.push("─────────────────────");
  lines.push("When things feel off, ask yourself:");
  for (const cue of profile.realignmentCues) {
    lines.push(`• ${cue}`);
  }
  lines.push("");

  // Why It Matters
  lines.push("WHY THIS MATTERS");
  lines.push("─────────────────────");
  lines.push(profile.whyItMatters);
  lines.push("");

  // Actions
  lines.push("ACTIONS YOU CAN TAKE");
  lines.push("─────────────────────");
  lines.push(`Light:   ${profile.actions.light}`);
  lines.push("");
  lines.push(`Medium:  ${profile.actions.medium}`);
  lines.push("");
  lines.push(`Deep:    ${profile.actions.deep}`);
  lines.push("");

  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  return lines.join("\n");
}

// ─────────────────────────────────────────────

function renderBlendedProfile(result, domain, scale) {
  const primaryProfile = profiles[result.primaryArchetype];
  const secondaryProfile = profiles[result.secondaryArchetype];

  const pairKey = [result.primaryArchetype, result.secondaryArchetype].sort().join("_");
  const blended = blendedDescriptions[pairKey];

  if (!primaryProfile || !secondaryProfile) {
    return "Profile data not found for blend: " + pairKey;
  }

  const lines = [];

  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  lines.push("YOUR PURPOSE PIECE");
  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  lines.push("");
  lines.push(`Archetype:  ${primaryProfile.label} + ${secondaryProfile.label}`);
  lines.push(`Domain:     ${domain.label}`);
  lines.push(`Scale:      ${scale.label}`);
  lines.push("");

  if (blended) {
    lines.push(blended.tagline.toUpperCase());
    lines.push("");
    lines.push(blended.bridge);
    lines.push("");
    if (blended.uniqueNote) {
      lines.push(blended.uniqueNote);
      lines.push("");
    }
  } else {
    lines.push(`${primaryProfile.label.toUpperCase()} + ${secondaryProfile.label.toUpperCase()}`);
    lines.push("");
    lines.push(`You show a genuine blend of ${primaryProfile.label} and ${secondaryProfile.label}. These two modes work together in your case — this isn't a tie, it's a distinct profile.`);
    lines.push("");
  }

  lines.push(domain.context);
  lines.push("");
  lines.push(`At the ${scale.label.toLowerCase()} scale: ${scale.context}`);
  lines.push("");

  // Merge strengths from both archetypes, interleaved
  lines.push("SIGNATURE STRENGTHS");
  lines.push("─────────────────────");
  const mergedStrengths = mergeListsInterleaved(
    primaryProfile.signatureStrengths,
    secondaryProfile.signatureStrengths,
    4  // max items from each
  );
  for (const strength of mergedStrengths) {
    lines.push(`• ${strength}`);
  }
  lines.push("");

  // Shadow patterns — primary only (to keep it focused)
  lines.push("SHADOW PATTERNS");
  lines.push("─────────────────────");
  for (const shadow of primaryProfile.shadowPatterns.slice(0, 3)) {
    lines.push(`• ${shadow}`);
  }
  // Add one secondary shadow if it adds something not covered
  lines.push(`• ${secondaryProfile.shadowPatterns[0]}`);
  lines.push("");

  // Re-alignment Cues — one from each
  lines.push("RE-ALIGNMENT CUES");
  lines.push("─────────────────────");
  lines.push("When things feel off, ask yourself:");
  lines.push(`• ${primaryProfile.realignmentCues[0]}`);
  lines.push(`• ${secondaryProfile.realignmentCues[0]}`);
  // Add the blend-specific tension question if available
  if (blended) {
    lines.push(`• Which of my two modes — ${primaryProfile.label} or ${secondaryProfile.label} — is actually called for right now?`);
  }
  lines.push("");

  // Why It Matters — primary
  lines.push("WHY THIS MATTERS");
  lines.push("─────────────────────");
  lines.push(primaryProfile.whyItMatters);
  lines.push("");

  // Actions — primary
  lines.push("ACTIONS YOU CAN TAKE");
  lines.push("─────────────────────");
  lines.push(`Light:   ${primaryProfile.actions.light}`);
  lines.push("");
  lines.push(`Medium:  ${primaryProfile.actions.medium}`);
  lines.push("");
  lines.push(`Deep:    ${secondaryProfile.actions.deep}`);  // deep from secondary for variety
  lines.push("");

  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  return lines.join("\n");
}

// ─────────────────────────────────────────────

function renderAmbiguousProfile(result, domain, scale) {
  const primaryProfile = profiles[result.primaryArchetype];
  const secondaryProfile = profiles[result.secondaryArchetype];

  const lines = [];

  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  lines.push("YOUR PURPOSE PIECE");
  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  lines.push("");
  lines.push(`Archetype:  ${primaryProfile ? primaryProfile.label + " (primary lean)" : "Ambiguous"}`);
  lines.push(`Domain:     ${domain.label}`);
  lines.push(`Scale:      ${scale.label}`);
  lines.push("");
  lines.push("A NOTE ON YOUR RESULT");
  lines.push("─────────────────────");
  lines.push(result.summary.core);
  lines.push("");
  lines.push(result.summary.note);
  lines.push("");

  if (primaryProfile) {
    lines.push("STRONGEST CURRENT SIGNALS");
    lines.push("─────────────────────");
    lines.push(`Based on what you've shared, the following ${primaryProfile.label} strengths seem most relevant:`);
    lines.push("");
    for (const strength of primaryProfile.signatureStrengths.slice(0, 3)) {
      lines.push(`• ${strength}`);
    }
    lines.push("");

    lines.push("ACTIONS YOU CAN TAKE");
    lines.push("─────────────────────");
    lines.push(`Light:   ${primaryProfile.actions.light}`);
    lines.push("");
    lines.push(`Deep:    A live conversation would likely sharpen this picture. Consider this result a starting point, not a final read.`);
    lines.push("");
  }

  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  return lines.join("\n");
}

// ─────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────

/**
 * Interleave two arrays up to maxPerList items each.
 * Used for blended strength lists.
 */
function mergeListsInterleaved(listA, listB, maxPerList) {
  const result = [];
  const limit = Math.min(maxPerList, Math.max(listA.length, listB.length));
  for (let i = 0; i < limit; i++) {
    if (i < listA.length && i < maxPerList) result.push(listA[i]);
    if (i < listB.length && i < maxPerList) result.push(listB[i]);
  }
  return result;
}

/**
 * Convenience: run a full session from a pre-defined answer sequence.
 * Useful for testing and demos. Returns the final formatted profile.
 *
 * @param {Array} answerSequence - [{ questionId, selectedOptionId|text }, ...]
 * @returns {string} formatted profile text
 */
function runSequence(answerSequence) {
  const session = createSession();
  let response = start(session);

  for (const ans of answerSequence) {
    if (response.type === "result") break;
    response = answer(session, ans.selectedOptionId || ans.text);
  }

  // If we've exhausted answers but haven't reached a result, force it
  if (response.type !== "result") {
    if (session.status === "validating") {
      response = answer(session, "It all fits");
    }
  }

  return response.type === "result" ? response.formatted : "Sequence did not complete.";
}

module.exports = {
  createSession,
  start,
  answer,
  renderProfile,
  runSequence
};
