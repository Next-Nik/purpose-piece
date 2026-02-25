// PURPOSE PIECE — ENGINE (STATE MACHINE)
// Pure flow control. No language, no UI.
// All strings come from voice.js. All data from questions/scoring/profiles.
//
// FILE NAMING: requires use plain names — questions.js, scoring.js, profiles.js, voice.js
// Phase map:
//   1 → 1-tiebreaker → 2-fork (0-2 forks, conditional) → 2-domain → 2-scale → 3-handoff
//   Phase 3 is a conversational agent (Signal Reader). Engine produces handoff JSON.
//
// Confidence → fork rules:
//   strong  (3/3 same)      → 0 forks → scale → domain → handoff
//   moderate (2/3 + 1 other) → 1 fork if ambiguous pair detected → scale → domain → handoff
//   weak    (tie/split)      → up to 2 forks (second only if first produces blend) → scale → domain → handoff

const questions = require("./questions");
const scoring   = require("./scoring");
const profiles  = require("./profiles");

// ─── Handoff JSON builder ──────────────────────────────────────────────────────
// Called when Phase 2 is complete. Produces structured context for Phase 3 agent.
function buildHandoff(session) {
  return {
    primary_archetype:    session.primaryArchetype,
    secondary_archetype:  session.secondaryArchetype || null,
    domain:               session.domain,
    scale:                session.scale,
    confidence:           session.confidence || "moderate",
    forks_triggered:      session.forksTriggered || [],
    phase1_answers:       session.answers.map(a => a.answer),
    tiebreaker_text:      session.tiebreakerText || null,
    phase2_answers:       session.phase2Answers || []
  };
}

function start(session) {
  return {
    type: "question",
    question: questions.PHASE_1_QUESTIONS[0],
    phase: session.phase
  };
}

function answer(session, rawInput) {
  const trimmed = rawInput.trim();
  const lower   = trimmed.toLowerCase();

  // ── PHASE 1: Rapid Signal ──────────────────────────────────────────────────
  if (session.phase === 1) {
    const qIndex = session.answeredQuestions.filter(id => id.startsWith("p1_q")).length;
    const question = questions.PHASE_1_QUESTIONS[qIndex];

    // Strict first-character extraction.
    // Buttons send "b) full option text..." — we read only the first char.
    // This prevents the false-positive multi-letter detection that fires when
    // option text happens to contain standalone letters (a, b, c, etc.).
    const firstChar = trimmed.charAt(0).toLowerCase();
    const validLetters = ["a","b","c","d","e","f","g"];
    const selectedOption = question && validLetters.includes(firstChar) &&
      question.options.find(opt => opt.id === firstChar);

    if (!selectedOption) {
      return { type: "clarification", key: "phase1BadInput" };
    }

    // Genuine multi-selection: user typed two letters explicitly (e.g. "A and C").
    // Only flag this for very short inputs where letters are the whole content —
    // never match against full option text.
    const shortInput = trimmed.length <= 10;
    if (shortInput) {
      const extraLetters = trimmed.toLowerCase().match(/\b[a-g]\b/g) || [];
      if (extraLetters.length > 1) {
        return { type: "clarification", key: "ambiguousMultiple" };
      }
    }

    scoring.tallyArchetype(session, selectedOption.archetype);
    session.answeredQuestions.push(question.id);
    session.answers.push({
      questionId: question.id,
      answer: trimmed,
      archetype: selectedOption.archetype
    });

    // All three Phase 1 questions answered
    if (session.answeredQuestions.filter(id => id.startsWith("p1_q")).length === 3) {
      const top = scoring.getTopArchetypes(session);
      session.confidence = top.confidence;
      session.forksTriggered = [];
      session.phase2Answers = [];

      // General tie — tiebreaker first
      if (top.isTie && !top.isClear) {
        session.phase = "1-tiebreaker";
        return { type: "question", question: questions.TIEBREAKER_QUESTION, phase: session.phase };
      }

      session.primaryArchetype = top.primary;
      if (top.secondaryCount > 0 && top.primaryCount - top.secondaryCount <= 1) {
        session.pendingSecondary = top.secondary;
      }

      // Queue forks needed (max 2, stored for sequential triggering)
      session.pendingForks = top.neededForks.slice(0, 2);
      session.forksCompleted = 0;

      if (session.pendingForks.length > 0) {
        const forkKey = session.pendingForks[0];
        const fork = questions.PHASE_2_FORKS[forkKey];
        session.phase = "2-fork";
        session.activeForkKey = forkKey;
        return { type: "question", question: fork, phase: session.phase };
      }

      // No forks — go straight to scale
      session.phase = "2-domain";
      return { type: "question", question: questions.PHASE_2_QUESTIONS.domain, phase: session.phase };
    }

    // Next Phase 1 question
    const nextQuestion = questions.PHASE_1_QUESTIONS[qIndex + 1];
    return { type: "question", question: nextQuestion, phase: session.phase };
  }

  // ── PHASE 2-FORK: Sequential disambiguation forks ─────────────────────────
  if (session.phase === "2-fork") {
    const fork = questions.PHASE_2_FORKS[session.activeForkKey];
    const firstChar = trimmed.charAt(0).toLowerCase();
    const selected = fork && ["a","b"].includes(firstChar) &&
      fork.options.find(opt => opt.id === firstChar);

    if (!selected) return { type: "clarification", key: "phase1BadInput" };

    // Record fork result
    scoring.tallyArchetype(session, selected.archetype);
    session.forksTriggered.push(session.activeForkKey);
    session.phase2Answers.push(selected.text);
    session.forksCompleted++;

    // Recalculate after fork
    const top = scoring.getTopArchetypes(session);
    session.primaryArchetype = top.primary;
    session.confidence = top.confidence;

    // Second fork: only if result is still a blend AND we haven't hit max
    const blendStillPresent = top.primaryCount - top.secondaryCount <= 1;
    const remainingForks = session.pendingForks.slice(session.forksCompleted);
    const canRunSecond = session.forksCompleted < 2 && blendStillPresent && remainingForks.length > 0;

    if (canRunSecond) {
      const nextForkKey = remainingForks[0];
      const nextFork = questions.PHASE_2_FORKS[nextForkKey];
      session.activeForkKey = nextForkKey;
      return { type: "question", question: nextFork, phase: session.phase };
    }

    // Forks complete — store secondary if blend resolved
    if (blendStillPresent) {
      session.secondaryArchetype = top.secondary;
    }

    // Move to scale
    session.phase = "2-domain";
    return { type: "question", question: questions.PHASE_2_QUESTIONS.domain, phase: session.phase };
  }

  // ── PHASE 1-FORK (legacy — only reached via old tiebreaker path) ──────────
  if (session.phase === "1-fork") {
    const firstChar = trimmed.charAt(0).toLowerCase();
    const fork = questions.MAKER_ARCHITECT_FORK;
    const selected = ["a","b"].includes(firstChar) &&
      fork.options.find(opt => opt.id === firstChar);

    if (!selected) return { type: "clarification", key: "phase1BadInput" };

    scoring.tallyArchetype(session, selected.archetype);
    const top = scoring.getTopArchetypes(session);
    session.primaryArchetype = top.primary;
    session.confidence = top.confidence;
    session.pendingForks = [];
    session.forksCompleted = 0;
    session.phase2Answers = [];

    session.phase = "2-domain";
    return { type: "question", question: questions.PHASE_2_QUESTIONS.domain, phase: session.phase };
  }

  // ── PHASE 1-TIEBREAKER ────────────────────────────────────────────────────
  if (session.phase === "1-tiebreaker") {
    session.tiebreakerText = trimmed;

    const archSignalCount = scoring.detectArchitectSignal(trimmed);
    const top = scoring.getTopArchetypes(session);
    const tied = Object.entries(session.archetypeTally)
      .filter(([, v]) => v === top.primaryCount)
      .map(([k]) => k);

    let resolved;
    if (archSignalCount >= 2 && tied.includes("architect")) {
      resolved = "architect";
    } else {
      resolved = scoring.breakTieFromText(trimmed, tied);
    }

    session.primaryArchetype = resolved;
    session.confidence = "weak";
    session.pendingForks = top.neededForks.slice(0, 2);
    session.forksCompleted = 0;
    session.forksTriggered = [];
    session.phase2Answers = [];

    if (session.pendingForks.length > 0) {
      const forkKey = session.pendingForks[0];
      const fork = questions.PHASE_2_FORKS[forkKey];
      session.phase = "2-fork";
      session.activeForkKey = forkKey;
      return { type: "question", question: fork, phase: session.phase };
    }

    session.phase = "2-domain";
    return { type: "question", question: questions.PHASE_2_QUESTIONS.domain, phase: session.phase };
  }

  // ── PHASE 2-DOMAIN ────────────────────────────────────────────────────────
  if (session.phase === "2-domain") {
    const dq = questions.PHASE_2_QUESTIONS.domain;
    const firstChar = trimmed.charAt(0).toLowerCase();
    const selected = ["a","b","c","d","e","f","g"].includes(firstChar) &&
      dq.options.find(opt => opt.id === firstChar);

    if (!selected) return { type: "clarification", key: "phase1BadInput" };

    session.domain = selected.domain;
    if (!session.phase2Answers) session.phase2Answers = [];
    session.phase2Answers.push(selected.text);

    session.phase = "2-scale";
    return { type: "question", question: questions.PHASE_2_QUESTIONS.scale, phase: session.phase };
  }

  // ── PHASE 2-SCALE ─────────────────────────────────────────────────────────
  if (session.phase === "2-scale") {
    const sq = questions.PHASE_2_QUESTIONS.scale;
    const firstChar = trimmed.charAt(0).toLowerCase();
    const selected = ["a","b","c","d"].includes(firstChar) &&
      sq.options.find(opt => opt.id === firstChar);

    if (!selected) return { type: "clarification", key: "scaleBadInput" };

    session.scale = selected.scale;
    session.phase2Answers.push(selected.text);

    // Phase 2 complete — hand off to Phase 3 conversational agent
    session.phase = "3-handoff";
    session.status = "handoff";

    return {
      type: "phase3_handoff",
      handoff: buildHandoff(session),
      phase: session.phase
    };
  }

  // ── PHASE 3-HANDOFF: User responded to "Ready?" — enter recognition ────────
  if (session.phase === "3-handoff") {
    session.phase = 3;
    session.recognitionStep = 1;
    session.recognitionAttempts = 0;
    return {
      type: "recognition_step_1",
      archetype: session.primaryArchetype,
      secondary: null,
      phase: session.phase
    };
  }

  // ── PHASE 3: Recognition Sequence ─────────────────────────────────────────
  if (session.phase === 3) {

    // ── Correction routing (must run BEFORE sentiment checks) ─────────────
    // When we ask "what part doesn't fit?", the next user message is correction
    // data, not a new sentiment vote. awaitingCorrection gates this routing.
    if (session.awaitingCorrection) {
      session.awaitingCorrection = false;

      // Re-infer archetype from correction text.
      // Architect is the most common miss — check for structural signals first.
      const archSignals = scoring.detectArchitectSignal(trimmed);
      if (archSignals >= 1 && session.primaryArchetype !== "architect") {
        session.primaryArchetype = "architect";
        // Reset attempts so the user isn't penalised for the system's initial miss.
        session.recognitionAttempts = 0;
        session.recognitionStep = 1;
        return {
          type: "recognition_step_1",
          archetype: session.primaryArchetype,
          secondary: null,
          phase: session.phase,
          reframed: true
        };
      }

      // No archetype shift detected — re-present step 1 in reframed mode once,
      // then let normal sentiment loop continue.
      return {
        type: "recognition_step_1",
        archetype: session.primaryArchetype,
        secondary: null,
        phase: session.phase,
        reframed: true
      };
    }

    if (session.recognitionStep === 1) {
      const sentiment = readSentiment(lower);

      if (sentiment === "positive") {
        session.recognitionStep = 2;
        return {
          type: "recognition_step_2",
          archetype: session.primaryArchetype,
          phase: session.phase
        };
      }

      if (sentiment === "uncertain") {
        // Gap response — hold it, then move to step 2 with gap framing
        session.recognitionStep = 2;
        return {
          type: "recognition_gap",
          archetype: session.primaryArchetype,
          phase: session.phase
        };
      }

      if (sentiment === "negative") {
        session.recognitionAttempts++;
        if (session.recognitionAttempts === 1) {
          session.awaitingCorrection = true;
          return { type: "correction_request", attempt: 1, phase: session.phase };
        }
        if (session.recognitionAttempts === 2) {
          session.awaitingCorrection = true;
          return { type: "correction_request", attempt: 2, phase: session.phase };
        }
        // Third failure — offer alternate
        const alternate = getAlternateArchetype(session);
        if (alternate) {
          session.proposedAlternate = alternate;
          return {
            type: "alternate_offer",
            primary: session.primaryArchetype,
            alternate,
            phase: session.phase
          };
        }
        // No clear alternate — honest close
        return { type: "honest_close", primary: session.primaryArchetype, phase: session.phase };
      }

      // Ambiguous — treat as uncertain
      session.recognitionStep = 2;
      return { type: "recognition_gap", archetype: session.primaryArchetype, phase: session.phase };
    }

    if (session.recognitionStep === 2) {
      const sentiment = readSentiment(lower);

      if (sentiment === "positive" || sentiment === "uncertain") {
        // Confirm secondary if pending and resonance is happening
        if (session.pendingSecondary) {
          session.secondaryArchetype = session.pendingSecondary;
        }
        session.recognitionStep = 3;
        return {
          type: "recognition_step_3",
          archetype: session.primaryArchetype,
          secondary: session.secondaryArchetype || null,
          phase: session.phase
        };
      }

      session.recognitionAttempts++;
      if (session.recognitionAttempts >= 3) {
        const alternate = getAlternateArchetype(session);
        return alternate
          ? { type: "alternate_offer", primary: session.primaryArchetype, alternate, phase: session.phase }
          : { type: "honest_close", primary: session.primaryArchetype, phase: session.phase };
      }

      return { type: "correction_request", attempt: session.recognitionAttempts, phase: session.phase };
    }

    if (session.recognitionStep === 3) {
      // User acknowledges reveal — deliver profile
      session.phase = 4;
      return buildProfileDelivery(session);
    }
  }

  // Handle alternate offer response
  if (session.proposedAlternate) {
    const sentiment = readSentiment(lower);
    if (sentiment === "positive" || sentiment === "uncertain") {
      session.primaryArchetype = session.proposedAlternate;
      delete session.proposedAlternate;
      session.recognitionAttempts = 0;
      session.recognitionStep = 2;
      return {
        type: "recognition_step_2",
        archetype: session.primaryArchetype,
        phase: session.phase
      };
    }
    // Neither fits — honest close
    delete session.proposedAlternate;
    return { type: "honest_close", primary: session.primaryArchetype, phase: session.phase };
  }

  // ── PHASE 4: Delivery ─────────────────────────────────────────────────────
  if (session.phase === 4) {
    return buildProfileDelivery(session);
  }

  return { type: "error" };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readSentiment(lower) {
  const positiveTerms = [
    "yes", "that fits", "accurate", "true", "right", "exactly", "definitely",
    "absolutely", "totally", "correct", "makes sense", "resonates", "that's it"
  ];
  const uncertainTerms = [
    "think so", "kind of", "sort of", "mostly", "trying", "not yet", "not fully",
    "want to", "hope", "working toward", "becoming", "aspire", "learning", "getting there",
    "somewhat", "partially", "more or less", "i guess"
  ];
  const negativeTerms = [
    "no", "doesn't fit", "not really", "off", "wrong", "nope", "not quite",
    "not totally", "not accurate", "that's not", "doesn't sound"
  ];

  for (const t of positiveTerms)  if (lower.includes(t)) return "positive";
  for (const t of uncertainTerms) if (lower.includes(t)) return "uncertain";
  for (const t of negativeTerms)  if (lower.includes(t)) return "negative";

  return "ambiguous";
}

function getAlternateArchetype(session) {
  const tally = session.archetypeTally;
  const primary = session.primaryArchetype;

  const sorted = Object.entries(tally)
    .filter(([k]) => k !== primary && tally[k] > 0)
    .sort((a, b) => b[1] - a[1]);

  return sorted.length > 0 ? sorted[0][0] : null;
}

function buildProfileDelivery(session) {
  const profile       = profiles.profiles[session.primaryArchetype];
  const domainMod     = profiles.domainModifiers[session.domain];
  const scaleMod      = profiles.scaleModifiers[session.scale];

  return {
    type:     "full_profile",
    archetype: session.primaryArchetype,
    secondary: session.secondaryArchetype || null,
    domain:    session.domain,
    scale:     session.scale,
    profile,
    domainModifier: domainMod,
    scaleModifier:  scaleMod,
    phase: 4
  };
}

module.exports = {
  createSession: scoring.createSession,
  start,
  answer
};
