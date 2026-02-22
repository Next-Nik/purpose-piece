// PURPOSE PIECE — ENGINE (STATE MACHINE)
// Pure flow control. No language, no UI.
// All strings come from voice.js. All data from questions/scoring/profiles.
//
// FILE NAMING: requires use plain names — questions.js, scoring.js, profiles.js, voice.js
// Phase map:
//   1 → 1-tiebreaker → 1-fork (Maker/Architect) → 2-behavior → 2-scale
//   → 2-domain-needed → 2-subdomain → 3 (recognition) → 4 (delivery)

const questions = require("./questions");
const scoring   = require("./scoring");
const profiles  = require("./profiles");

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

      // Maker/Architect too close — run pressure fork
      if (top.needsMakerArchitectFork) {
        session.phase = "1-fork";
        return { type: "question", question: questions.MAKER_ARCHITECT_FORK, phase: session.phase };
      }

      // General tie — tiebreaker
      if (top.isTie && !top.isClear) {
        session.phase = "1-tiebreaker";
        return { type: "question", question: questions.TIEBREAKER_QUESTION, phase: session.phase };
      }

      // Clear signal
      session.primaryArchetype = top.primary;
      // Secondary only stored if close — NOT revealed until resonance confirmed
      if (top.secondaryCount > 0 && top.primaryCount - top.secondaryCount <= 1) {
        session.pendingSecondary = top.secondary;
      }
      session.phase = "2-behavior";
      return {
        type: "question",
        question: questions.PHASE_2_QUESTIONS.recentBehavior,
        phase: session.phase,
        acknowledgment: "phase1Complete"
      };
    }

    // Next Phase 1 question
    const nextQuestion = questions.PHASE_1_QUESTIONS[qIndex + 1];
    return { type: "question", question: nextQuestion, phase: session.phase };
  }

  // ── PHASE 1-FORK: Maker vs Architect ──────────────────────────────────────
  if (session.phase === "1-fork") {
    const letterMatch = lower.match(/\b([a-b])\b/);
    const fork = questions.MAKER_ARCHITECT_FORK;
    const selected = letterMatch && fork.options.find(opt => opt.id === letterMatch[1]);

    if (!selected) return { type: "clarification", key: "phase1BadInput" };

    scoring.tallyArchetype(session, selected.archetype);
    const top = scoring.getTopArchetypes(session);
    session.primaryArchetype = top.primary;

    session.phase = "2-behavior";
    return {
      type: "question",
      question: questions.PHASE_2_QUESTIONS.recentBehavior,
      phase: session.phase
    };
  }

  // ── PHASE 1-TIEBREAKER ────────────────────────────────────────────────────
  if (session.phase === "1-tiebreaker") {
    session.tiebreakerText = trimmed;

    // Check for Architect signals first
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
    session.phase = "2-behavior";
    return {
      type: "question",
      question: questions.PHASE_2_QUESTIONS.recentBehavior,
      phase: session.phase
    };
  }

  // ── PHASE 2-BEHAVIOR: Free text ───────────────────────────────────────────
  if (session.phase === "2-behavior") {
    session.behaviorText = trimmed;
    session.answeredQuestions.push(questions.PHASE_2_QUESTIONS.recentBehavior.id);

    // Infer domain
    const inferred = scoring.inferDomainFromText(trimmed);
    if (inferred) session.domain = inferred;

    // Check for Architect signals in free text — may upgrade/confirm
    const archSignals = scoring.detectArchitectSignal(trimmed);
    if (archSignals >= 2 && session.primaryArchetype !== "architect") {
      session.architectSignalInBehavior = true;
    }

    const isRich = trimmed.split(" ").length > 12;
    session.phase = "2-scale";

    return {
      type: "question",
      question: questions.PHASE_2_QUESTIONS.scale,
      phase: session.phase,
      richBehaviorAnswer: isRich,
      behaviorText: trimmed
    };
  }

  // ── PHASE 2-SCALE ─────────────────────────────────────────────────────────
  if (session.phase === "2-scale") {
    const letterMatch = lower.match(/\b([a-d])\b/);
    const sq = questions.PHASE_2_QUESTIONS.scale;
    const selected = letterMatch && sq.options.find(opt => opt.id === letterMatch[1]);

    if (!selected) return { type: "clarification", key: "scaleBadInput" };

    session.scale = selected.scale;
    session.answeredQuestions.push(sq.id);

    if (!session.domain) {
      session.phase = "2-domain-needed";
      return { type: "domain_question", phase: session.phase };
    }

    session.phase = "2-subdomain";
    return { type: "subdomain_question", domain: session.domain, phase: session.phase };
  }

  // ── PHASE 2-DOMAIN-NEEDED ─────────────────────────────────────────────────
  if (session.phase === "2-domain-needed") {
    const domainMap = {
      "inner": "human_being", "people": "human_being", "development": "human_being", "personal": "human_being",
      "social": "society", "community": "society", "governance": "society", "political": "society",
      "nature": "nature", "ecology": "nature", "environment": "nature", "land": "nature",
      "technology": "technology", "tech": "technology", "tools": "technology", "digital": "technology",
      "economic": "finance", "money": "finance", "resources": "finance", "finance": "finance",
      "preservation": "legacy", "long-term": "legacy", "intergenerational": "legacy",
      "future": "vision", "coordinate": "vision", "vision": "vision", "possibility": "vision",
      "all": "vision", "everything": "vision", "umbrella": "vision", "across": "vision"
    };

    let matched = null;
    for (const [kw, domain] of Object.entries(domainMap)) {
      if (lower.includes(kw)) { matched = domain; break; }
    }

    const expressedBreadth = lower.includes("all") || lower.includes("everything") ||
      lower.includes("umbrella") || lower.includes("across") || lower.includes("multiple");

    session.domain = matched || (expressedBreadth ? "vision" : "society");
    session.expressedBreadth = expressedBreadth;
    session.phase = "2-subdomain";

    return {
      type: "subdomain_question",
      domain: session.domain,
      phase: session.phase,
      expressedBreadth
    };
  }

  // ── PHASE 2-SUBDOMAIN ─────────────────────────────────────────────────────
  if (session.phase === "2-subdomain") {
    const menu = questions.SUBDOMAIN_MENUS[session.domain];
    const letterMatch = lower.match(/\b([a-e])\b/);
    const selected = menu && letterMatch &&
      menu.options.find((_, idx) => String.fromCharCode(97 + idx) === letterMatch[1]);

    if (selected) session.subdomain = selected.id;
    else if (!letterMatch) {
      return { type: "clarification", key: "subdomainBadInput" };
    }

    // If Architect signals appeared in behavior text and primary isn't Architect, surface note
    if (session.architectSignalInBehavior && session.primaryArchetype !== "architect") {
      session.architectSignalFlagged = true;
    }

    session.phase = 3;
    session.recognitionStep = 1;
    session.recognitionAttempts = 0;

    return {
      type: "recognition_step_1",
      archetype: session.primaryArchetype,
      secondary: null, // never show secondary before resonance confirmed
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
