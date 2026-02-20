// Purpose Piece — Scoring Engine v2.0
// Handles: archetype scoring, domain inference, scale inference,
// confidence tracking, blended archetype rules, result generation

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const ARCHETYPES = ["steward", "maker", "connector", "guardian", "explorer", "sage"];

const DOMAINS = ["human_being", "society", "nature", "technology", "finance", "legacy", "vision"];

const SCALES = ["local", "bioregional", "global", "civilizational"];

const THRESHOLDS = {
  phase1_advance: 0.55,        // Top archetype share needed to advance to Phase 2
  phase1_early_advance: 0.70,  // Top archetype share to skip remaining Phase 1 Qs
  phase2_advance: 0.75,        // Archetype confidence needed to advance to Phase 3
  blend_delta: 0.12,           // If top two archetypes within this %, deliver as blended
  domain_confirm: 0.40,        // Domain share needed to call it "confirmed"
  domain_noise_floor: 0.25,    // Domain share below which signal is treated as noise (don't ask clarifier)
  scale_leader: 0.60,          // Scale share above which one scale clearly dominates (don't ask clarifier)
};

// ─────────────────────────────────────────────
// SCORE STATE
// ─────────────────────────────────────────────

function initScoreState() {
  return {
    archetypes: {
      steward: 0,
      maker: 0,
      connector: 0,
      guardian: 0,
      explorer: 0,
      sage: 0
    },
    domains: {
      human_being: 0,
      society: 0,
      nature: 0,
      technology: 0,
      finance: 0,
      legacy: 0,
      vision: 0
    },
    scales: {
      local: 0,
      bioregional: 0,
      global: 0,
      civilizational: 0
    },
    answeredQuestions: [],
    phase: 1,
    correctionCycles: 0
  };
}

// ─────────────────────────────────────────────
// ANSWER PROCESSING
// ─────────────────────────────────────────────

/**
 * Process a multiple-choice answer and update score state.
 * @param {Object} state - current score state
 * @param {Object} question - the question object
 * @param {string} selectedOptionId - the option ID the user selected
 * @returns {Object} updated state
 */
function processMultipleChoice(state, question, selectedOptionId) {
  const option = question.options.find(o => o.id === selectedOptionId);
  if (!option) return state;

  const newState = deepClone(state);

  // Apply archetype scoring weights
  if (option.scoring) {
    for (const [archetype, weight] of Object.entries(option.scoring)) {
      if (newState.archetypes.hasOwnProperty(archetype)) {
        newState.archetypes[archetype] += weight;
      }
    }
  }

  // Apply domain signal
  if (option.domain) {
    newState.domains[option.domain] = (newState.domains[option.domain] || 0) + 1;
  }

  // Apply domain confirm (stronger signal from domain clarifier questions)
  if (option.domainConfirm) {
    newState.domains[option.domainConfirm] = (newState.domains[option.domainConfirm] || 0) + 2;
  }

  // Apply scale signal
  if (option.scale) {
    newState.scales[option.scale] = (newState.scales[option.scale] || 0) + 1;
  }

  if (option.scaleConfirm) {
    newState.scales[option.scaleConfirm] = (newState.scales[option.scaleConfirm] || 0) + 2;
  }

  newState.answeredQuestions.push({
    questionId: question.id,
    selectedOptionId,
    phase: question.phase
  });

  return newState;
}

/**
 * Process a free-text answer using keyword/semantic matching.
 * @param {Object} state - current score state
 * @param {Object} question - the question object
 * @param {string} responseText - the user's free-text response
 * @returns {Object} updated state
 */
function processFreeText(state, question, responseText) {
  const newState = deepClone(state);
  const text = responseText.toLowerCase();

  const signals = extractSemanticSignals(text);

  for (const [archetype, weight] of Object.entries(signals.archetypes)) {
    newState.archetypes[archetype] = (newState.archetypes[archetype] || 0) + weight;
  }

  for (const domain of signals.domains) {
    newState.domains[domain] = (newState.domains[domain] || 0) + 1;
  }

  for (const scale of signals.scales) {
    newState.scales[scale] = (newState.scales[scale] || 0) + 1;
  }

  // Flag if abstract (Sage signal)
  if (signals.isAbstract) {
    newState.archetypes.sage = (newState.archetypes.sage || 0) + 1;
    newState._abstractResponseDetected = true;
  }

  newState.answeredQuestions.push({
    questionId: question.id,
    responseText,
    phase: question.phase,
    signals
  });

  return newState;
}

// ─────────────────────────────────────────────
// SEMANTIC KEYWORD MAP
// Maps language patterns → archetype/domain/scale signals
// ─────────────────────────────────────────────

const semanticKeywords = {
  archetypes: {
    steward: [
      "maintain", "maintain", "care for", "sustain", "manage", "oversee", "tend",
      "preserve", "protect", "responsible", "accountable", "looking after",
      "making sure", "keeping", "running", "track", "organise", "organised"
    ],
    maker: [
      "build", "built", "create", "created", "make", "made", "design", "designed",
      "produce", "produce", "fix", "fixed", "construct", "develop", "code", "write",
      "craft", "workshop", "physical", "hands", "prototype", "launch", "ship"
    ],
    connector: [
      "people", "team", "relationship", "conversation", "community", "together",
      "helping", "support", "listen", "connect", "network", "collaborate",
      "introduce", "bridge", "group", "with others", "for them", "they needed"
    ],
    guardian: [
      "protect", "safe", "security", "risk", "prevent", "careful", "thorough",
      "check", "verify", "ensure", "standard", "quality", "reliable", "consistent",
      "rules", "process", "boundaries", "defend", "avoid"
    ],
    explorer: [
      "discover", "explore", "new", "experiment", "try", "test", "venture",
      "unknown", "different", "travel", "curious", "opportunity", "frontier",
      "first time", "never done", "new territory", "possibility"
    ],
    sage: [
      "understand", "learn", "research", "analyse", "think", "reflect", "read",
      "study", "pattern", "meaning", "insight", "wisdom", "question", "why",
      "root cause", "teaching", "explain", "framework", "theory", "principle"
    ]
  },
  domains: {
    human_being: ["myself", "personal", "my own", "health", "growth", "emotions", "identity"],
    society: ["people", "community", "organisation", "system", "culture", "politics", "social"],
    nature: ["land", "water", "environment", "ecology", "nature", "climate", "garden", "soil", "watershed"],
    technology: ["tech", "software", "tool", "platform", "code", "digital", "data", "machine", "system"],
    finance: ["money", "investment", "budget", "revenue", "fund", "economic", "capital", "financial"],
    legacy: ["future", "lasting", "generations", "impact", "history", "heritage", "long-term", "endure"],
    vision: ["possibility", "imagine", "potential", "transform", "world", "humanity", "civilisation", "purpose"]
  },
  scales: {
    local: ["my neighbourhood", "my street", "immediate", "household", "local", "nearby", "close to home"],
    bioregional: ["region", "city", "watershed", "county", "state", "province", "bioregion"],
    global: ["national", "international", "global", "worldwide", "across countries"],
    civilizational: ["humanity", "civilisation", "species", "the whole", "systemic", "root", "planetary"]
  }
};

/**
 * Extract archetype/domain/scale signals from free text.
 */
function extractSemanticSignals(text) {
  const result = {
    archetypes: {},
    domains: [],
    scales: [],
    isAbstract: false
  };

  // Check archetype keywords
  for (const [archetype, keywords] of Object.entries(semanticKeywords.archetypes)) {
    const matches = keywords.filter(kw => text.includes(kw)).length;
    if (matches > 0) {
      result.archetypes[archetype] = Math.min(matches, 2); // cap at 2 per free-text
    }
  }

  // Check domain keywords
  for (const [domain, keywords] of Object.entries(semanticKeywords.domains)) {
    if (keywords.some(kw => text.includes(kw))) {
      result.domains.push(domain);
    }
  }

  // Check scale keywords
  for (const [scale, keywords] of Object.entries(semanticKeywords.scales)) {
    if (keywords.some(kw => text.includes(kw))) {
      result.scales.push(scale);
    }
  }

  // Abstract detection: long words, no concrete verbs, philosophical framing
  const concreteVerbs = ["did", "built", "made", "wrote", "ran", "called", "met",
    "fixed", "helped", "worked", "created", "organised", "went"];
  const hasConcreteVerb = concreteVerbs.some(v => text.includes(v));
  const wordCount = text.split(" ").length;
  const abstractIndicators = ["believe", "think that", "feel that", "in general",
    "fundamentally", "essence", "nature of", "concept", "notion"];
  const hasAbstractIndicator = abstractIndicators.some(a => text.includes(a));

  if (!hasConcreteVerb && wordCount > 15 && hasAbstractIndicator) {
    result.isAbstract = true;
  }

  return result;
}

// ─────────────────────────────────────────────
// CONFIDENCE CALCULATION
// ─────────────────────────────────────────────

/**
 * Calculate normalised archetype confidence scores.
 * Returns object: { archetype: normalised_share }
 */
function calculateArchetypeConfidence(state) {
  const total = Object.values(state.archetypes).reduce((sum, v) => sum + v, 0);
  if (total === 0) return Object.fromEntries(ARCHETYPES.map(a => [a, 0]));

  return Object.fromEntries(
    ARCHETYPES.map(a => [a, state.archetypes[a] / total])
  );
}

/**
 * Get the top archetype and its confidence level.
 */
function getTopArchetype(state) {
  const confidence = calculateArchetypeConfidence(state);
  const sorted = Object.entries(confidence).sort((a, b) => b[1] - a[1]);
  return {
    archetype: sorted[0][0],
    confidence: sorted[0][1],
    second: sorted[1][0],
    secondConfidence: sorted[1][1],
    sorted
  };
}

/**
 * Determine if result should be blended.
 */
function shouldBlend(state) {
  const top = getTopArchetype(state);
  return (top.confidence - top.secondConfidence) <= THRESHOLDS.blend_delta;
}

// ─────────────────────────────────────────────
// DOMAIN & SCALE INFERENCE
// ─────────────────────────────────────────────

/**
 * Get the confirmed primary domain.
 * Returns null if no domain clears the threshold.
 */
function getPrimaryDomain(state) {
  const total = Object.values(state.domains).reduce((sum, v) => sum + v, 0);
  if (total === 0) return null;

  const sorted = Object.entries(state.domains).sort((a, b) => b[1] - a[1]);
  const topShare = sorted[0][1] / total;

  return topShare >= THRESHOLDS.domain_confirm ? sorted[0][0] : null;
}

/**
 * Get the primary scale.
 */
function getPrimaryScale(state) {
  const total = Object.values(state.scales).reduce((sum, v) => sum + v, 0);
  if (total === 0) return "local"; // default fallback

  const sorted = Object.entries(state.scales).sort((a, b) => b[1] - a[1]);
  return sorted[0][0];
}

// ─────────────────────────────────────────────
// PHASE TRANSITION LOGIC
// ─────────────────────────────────────────────

/**
 * Check whether to advance from Phase 1 to Phase 2.
 * Returns: { advance: bool, early: bool, reason: string }
 */
function checkPhase1Advance(state, questionsAnswered) {
  const top = getTopArchetype(state);

  if (top.confidence >= THRESHOLDS.phase1_early_advance && questionsAnswered >= 3) {
    return { advance: true, early: true, reason: "early_high_confidence" };
  }

  if (top.confidence >= THRESHOLDS.phase1_advance && questionsAnswered >= 5) {
    return { advance: true, early: false, reason: "standard_advance" };
  }

  if (questionsAnswered >= 7) {
    if (top.confidence >= THRESHOLDS.phase1_advance) {
      return { advance: true, early: false, reason: "extended_advance" };
    } else {
      return { advance: true, early: false, reason: "max_questions_reached", ambiguous: true };
    }
  }

  return { advance: false };
}

/**
 * Check whether to advance from Phase 2 to Phase 3.
 */
function checkPhase2Advance(state, phase2QuestionsAnswered) {
  const top = getTopArchetype(state);
  const domain = getPrimaryDomain(state);

  if (top.confidence >= THRESHOLDS.phase2_advance && domain !== null) {
    return { advance: true, reason: "confident_result" };
  }

  if (phase2QuestionsAnswered >= 4) {
    return { advance: true, reason: "max_questions_reached", blended: true };
  }

  return { advance: false };
}

// ─────────────────────────────────────────────
// PHASE 2 QUESTION SELECTION
// ─────────────────────────────────────────────

/**
 * Select the next Phase 2 question based on current state.
 * @param {Object} state - current score state
 * @param {Array} allQuestions - full question bank
 * @param {Array} askedIds - question IDs already asked
 * @returns {Object|null} next question or null if Phase 2 complete
 */
function selectPhase2Question(state, allQuestions, askedIds) {
  const top = getTopArchetype(state);
  const phase2Qs = allQuestions.filter(q => q.phase === 2 && !askedIds.includes(q.id));

  // Priority 1: Differentiator (if top two archetypes close)
  if ((top.confidence - top.secondConfidence) <= 0.15) {
    const pair = [top.archetype, top.second].sort().join("_");
    const differentiator = phase2Qs.find(
      q => q.type === "differentiator" &&
      q.targetArchetypes &&
      q.targetArchetypes.includes(top.archetype) &&
      q.targetArchetypes.includes(top.second)
    );
    if (differentiator) return differentiator;
  }

  // Priority 2: Domain clarifier (if domain ambiguous but has a meaningful signal)
  // Guard: only trigger if top domain has a real signal share (> 25%) but hasn't
  // cleared the confirmation threshold (< 40%). Below 25% = noise, not worth asking about.
  const domain = getPrimaryDomain(state);
  if (!domain) {
    const totalDomainSignals = Object.values(state.domains).reduce((sum, v) => sum + v, 0);
    if (totalDomainSignals > 0) {
      const topDomainEntry = Object.entries(state.domains).sort((a, b) => b[1] - a[1])[0];
      const topDomainShare = topDomainEntry[1] / totalDomainSignals;

      // Only ask a domain clarifier if there's a genuine but inconclusive signal.
      // < 0.25 = noise (2 accidental tags out of 8 total is not a signal).
      // >= 0.40 = already confirmed — getPrimaryDomain() would have returned it.
      if (topDomainShare >= 0.25 && topDomainShare < THRESHOLDS.domain_confirm) {
        const clarifier = phase2Qs.find(
          q => q.type === "domain_clarifier" && q.targetDomain === topDomainEntry[0]
        );
        if (clarifier) return clarifier;
      }
      // If topDomainShare < 0.25: domain signals are scattered noise — skip clarifier,
      // let free-text or result inference handle domain assignment.
    }
  }

  // Priority 3: Scale clarifier (if scale is genuinely unknown)
  // Guard: only trigger if scale signals are absent OR too scattered to mean anything.
  // "Local" appearing 3 times because every Phase 1 question is locally-framed
  // is structural noise, not a real signal. Require at least 2 distinct scale values
  // to have fired before asking, OR zero signals at all.
  const scaleTotal = Object.values(state.scales).reduce((sum, v) => sum + v, 0);
  const distinctScalesPresent = Object.values(state.scales).filter(v => v > 0).length;
  const topScaleEntry = Object.entries(state.scales).sort((a, b) => b[1] - a[1])[0];
  const topScaleShare = scaleTotal > 0 ? topScaleEntry[1] / scaleTotal : 0;

  // Ask scale clarifier only if:
  // (a) no scale signals at all, OR
  // (b) signals present but split across 2+ scales with no clear leader (top < 60%)
  // Do NOT ask if one scale dominates — that's a real signal, not ambiguity.
  if (scaleTotal === 0 || (distinctScalesPresent >= 2 && topScaleShare < 0.60)) {
    const scaleClarifier = phase2Qs.find(q => q.type === "scale_clarifier");
    if (scaleClarifier) return scaleClarifier;
  }

  // Priority 4: Free text (if still below confidence threshold)
  const topConf = getTopArchetype(state).confidence;
  if (topConf < 0.70) {
    const freeText = phase2Qs.find(q => q.type === "free_text_behaviour");
    if (freeText) return freeText;
  }

  return null; // Phase 2 complete
}

// ─────────────────────────────────────────────
// RESULT GENERATION
// ─────────────────────────────────────────────

const archetypeDescriptions = {
  steward: {
    label: "Steward",
    core: "You operate as a custodian — someone who sustains, maintains, and improves what exists. You show up most powerfully in roles where something real is depending on you to keep it working and growing.",
    inAction: "You notice what others overlook. You do the work that doesn't get applause. When things are running well, it's often because you made sure they could.",
    toward: "Your contribution lives in continuity — the systems, relationships, and places that last because someone like you cared for them."
  },
  maker: {
    label: "Maker",
    core: "You operate through creation — you need to be building something. Ideas aren't enough until they exist in the world. You're most alive when you're making something real.",
    inAction: "You move from concept to execution faster than most. You're restless with pure theory. The satisfaction is in the thing that exists at the end.",
    toward: "Your contribution is what you leave behind that didn't exist before — things people can use, experience, or build on."
  },
  connector: {
    label: "Connector",
    core: "You operate through relationships — you see the humans first. You're most powerful in the spaces between people: the introductions that change things, the conversations that unlock things, the belonging you help create.",
    inAction: "You remember details others forget. You sense when someone needs to meet someone else. The network grows around you because you actually care.",
    toward: "Your contribution is the community, the trust, and the human fabric you weave — often without anyone fully realising you're the reason it exists."
  },
  guardian: {
    label: "Guardian",
    core: "You operate through protection — you hold the line. You're the person who asks 'but what if it goes wrong?' not out of pessimism, but because you've thought about it and someone has to.",
    inAction: "You maintain standards others let slide. You create the safety others take for granted. The thing that didn't blow up often didn't because you were paying attention.",
    toward: "Your contribution is the stability, integrity, and safety that lets other people take risks. That's not a small thing."
  },
  explorer: {
    label: "Explorer",
    core: "You operate through discovery — you're pulled toward what doesn't exist yet. New territory is home for you, not anxiety. You move fastest when there's no map.",
    inAction: "You spot the opening others haven't seen. You're the person who's already onto the next thing. You create the path so others don't have to.",
    toward: "Your contribution is the territory you open up — the futures made possible because you went first."
  },
  sage: {
    label: "Sage",
    core: "You operate through understanding — you need to know why. You move slowly on purpose, because you've learned that acting on incomplete understanding costs more than the pause.",
    inAction: "You ask the question that reframes the whole conversation. You see the pattern in the noise. People walk away from time with you thinking differently.",
    toward: "Your contribution is clarity — the frameworks, insights, and questions that help others navigate complexity they couldn't see through alone."
  }
};

const domainLabels = {
  human_being: "Human Being",
  society: "Society",
  nature: "Nature",
  technology: "Technology",
  finance: "Finance & Economy",
  legacy: "Legacy",
  vision: "Vision"
};

const scaleLabels = {
  local: "Local",
  bioregional: "Bioregional",
  global: "Global",
  civilizational: "Civilizational"
};

const blendedBridges = {
  "connector_steward": "You're someone who holds communities together over time — not just connecting people but making sure the relationships and systems around them actually last.",
  "maker_explorer": "You're most alive on the frontier of making — not just building what exists but pushing into territory that hasn't been mapped yet.",
  "sage_connector": "You bring understanding into relationships — you're the person who makes people feel genuinely seen because you're actually thinking about them, not just reflecting them back.",
  "guardian_steward": "You're someone who protects what matters most — not just maintaining what works but ensuring it can't be compromised.",
  "maker_connector": "You build things that bring people together — the product, the tool, the event that creates the conditions for connection.",
  "explorer_sage": "You're a thinking pioneer — you need to understand something deeply before moving, but once you do, you go further than most people would dare.",
  "steward_sage": "You understand systems in order to sustain them — you're the person who reads the whole history before touching anything.",
  "guardian_connector": "You protect people — not abstract principles, but the specific humans in your care.",
  "maker_guardian": "You build things that last and can be trusted — quality and durability are non-negotiable for you.",
  "explorer_connector": "You expand the world for people — you go somewhere new and then make sure others can follow.",
  "guardian_sage": "You hold the line on what's true — you protect understanding from distortion, shortcuts, and wishful thinking.",
  "steward_connector": "You cultivate the relationships and places that sustain people — long-term, quietly, and thoroughly.",
  "maker_steward": "You build the infrastructure that keeps running — not just creating but ensuring what you create can last.",
  "explorer_steward": "You explore in order to tend — you go somewhere new to understand it well enough to protect it.",
  "sage_guardian": "You think in order to protect — your understanding is in service of preventing the mistakes that come from not thinking deeply enough."
};

/**
 * Generate the full result object from scored state.
 */
function generateResult(state) {
  const top = getTopArchetype(state);
  const isBlended = shouldBlend(state);
  const domain = getPrimaryDomain(state) || Object.entries(state.domains).sort((a, b) => b[1] - a[1])[0]?.[0] || "human_being";
  const scale = getPrimaryScale(state);

  if (isBlended) {
    const pairKey = [top.archetype, top.second].sort().join("_");
    const bridge = blendedBridges[pairKey] || `You show a genuine blend of ${archetypeDescriptions[top.archetype].label} and ${archetypeDescriptions[top.second].label}.`;

    return {
      type: "blended",
      primaryArchetype: top.archetype,
      secondaryArchetype: top.second,
      domain,
      scale,
      summary: {
        label: `${archetypeDescriptions[top.archetype].label} + ${archetypeDescriptions[top.second].label}`,
        domainLabel: domainLabels[domain],
        scaleLabel: scaleLabels[scale],
        blend: bridge,
        inAction: `${archetypeDescriptions[top.archetype].inAction} ${archetypeDescriptions[top.second].inAction}`,
        toward: archetypeDescriptions[top.archetype].toward
      },
      confidence: {
        archetype: Math.round(top.confidence * 100),
        secondArchetype: Math.round(top.secondConfidence * 100)
      }
    };
  }

  const desc = archetypeDescriptions[top.archetype];

  return {
    type: "single",
    primaryArchetype: top.archetype,
    domain,
    scale,
    summary: {
      label: desc.label,
      domainLabel: domainLabels[domain],
      scaleLabel: scaleLabels[scale],
      core: desc.core,
      inAction: desc.inAction,
      toward: desc.toward
    },
    confidence: {
      archetype: Math.round(top.confidence * 100)
    }
  };
}

/**
 * Format result for display.
 * Returns plain-language text output.
 */
function formatResult(result) {
  if (result.type === "blended") {
    return `YOUR PURPOSE PIECE

Primary Archetype: ${result.summary.label}
Domain: ${result.summary.domainLabel}
Scale: ${result.summary.scaleLabel}

${result.summary.blend}

In practice: ${result.summary.inAction}

What this points toward: ${result.summary.toward}`;
  }

  return `YOUR PURPOSE PIECE

Primary Archetype: ${result.summary.label}
Domain: ${result.summary.domainLabel}
Scale: ${result.summary.scaleLabel}

${result.summary.core}

In practice: ${result.summary.inAction}

What this points toward: ${result.summary.toward}`;
}

/**
 * Generate the Phase 3 summary statement for validation.
 * (Shorter, conversational — not the full result yet.)
 */
function generateValidationSummary(state) {
  const result = generateResult(state);

  if (result.type === "blended") {
    return `Based on what you've shared, I'm seeing someone who shows up as both ${archetypeDescriptions[result.primaryArchetype].label} and ${archetypeDescriptions[result.secondaryArchetype].label} — particularly in the domain of ${domainLabels[result.domain]}. ${blendedBridges[[result.primaryArchetype, result.secondaryArchetype].sort().join("_")] || "These two sides seem to work together in how you operate."}`;
  }

  const desc = archetypeDescriptions[result.primaryArchetype];
  return `Based on what you've shared, I'm seeing a ${desc.label} operating in the domain of ${domainLabels[result.domain]}. ${desc.core}`;
}

// ─────────────────────────────────────────────
// RE-SCORING AFTER CORRECTION
// ─────────────────────────────────────────────

/**
 * Apply a targeted correction when user says "Partly" and identifies
 * what's off (role / domain / scale).
 */
function applyCorrection(state, correctionType, correctionValue) {
  const newState = deepClone(state);
  newState.correctionCycles = (newState.correctionCycles || 0) + 1;

  switch (correctionType) {
    case "role":
      // Dampen top archetype, let second rise
      const top = getTopArchetype(newState);
      newState.archetypes[top.archetype] = Math.max(0, newState.archetypes[top.archetype] - 2);
      break;

    case "domain":
      // Reset domain scores and apply the correction
      if (correctionValue && newState.domains.hasOwnProperty(correctionValue)) {
        for (const d of DOMAINS) {
          newState.domains[d] = Math.floor(newState.domains[d] * 0.5);
        }
        newState.domains[correctionValue] += 3;
      }
      break;

    case "scale":
      if (correctionValue && newState.scales.hasOwnProperty(correctionValue)) {
        for (const s of SCALES) {
          newState.scales[s] = 0;
        }
        newState.scales[correctionValue] = 3;
      }
      break;

    case "all":
      // Full correction: treat as Phase 2 restart with new free-text signal
      // The re-targeted free-text answer should be processed separately
      // and state will be updated by processFreeText()
      break;
  }

  return newState;
}

// ─────────────────────────────────────────────
// AMBIGUITY PROTOCOL
// Called when confidence never clears threshold
// ─────────────────────────────────────────────

function generateAmbiguousResult(state) {
  const top = getTopArchetype(state);
  const domain = getPrimaryDomain(state) || "society";
  const scale = getPrimaryScale(state);

  return {
    type: "ambiguous",
    primaryArchetype: top.archetype,
    secondaryArchetype: top.second,
    domain,
    scale,
    summary: {
      label: `${archetypeDescriptions[top.archetype].label} leaning`,
      domainLabel: domainLabels[domain],
      scaleLabel: scaleLabels[scale],
      core: `The picture here is genuinely complex — you show real signals across multiple modes. The strongest lean is toward ${archetypeDescriptions[top.archetype].label}, but this isn't a definitive read. That's not a failure of the process — some people genuinely operate across multiple archetypes depending on context. ${archetypeDescriptions[top.archetype].core}`,
      note: "A live coaching conversation would likely sharpen this. What you've shared points toward more than one pattern, which is itself useful information."
    }
  };
}

// ─────────────────────────────────────────────
// UTILITY
// ─────────────────────────────────────────────

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// ─────────────────────────────────────────────
// ACCEPTANCE TEST VALIDATOR
// Run this to verify question concreteness before shipping
// ─────────────────────────────────────────────

/**
 * Simulates the four test personas through Phase 1.
 * Expected: different archetype signals for each persona.
 *
 * ISTA Coach → likely: Connector or Sage
 * Water Rights Specialist → likely: Guardian or Steward
 * Electronics Salesperson → likely: Maker or Connector
 * Sports Podcaster → likely: Explorer or Connector
 *
 * Run this with test answer sets to verify scoring differentiation.
 */
function runAcceptanceTest(testPersonas, allQuestions) {
  const results = {};

  for (const [persona, answers] of Object.entries(testPersonas)) {
    let state = initScoreState();

    for (const answer of answers) {
      const question = allQuestions.find(q => q.id === answer.questionId);
      if (!question) continue;

      if (question.inputType === "multiple_choice") {
        state = processMultipleChoice(state, question, answer.selectedOptionId);
      } else if (question.inputType === "free_text") {
        state = processFreeText(state, question, answer.text);
      }
    }

    results[persona] = {
      top: getTopArchetype(state),
      isBlended: shouldBlend(state),
      domain: getPrimaryDomain(state),
      scale: getPrimaryScale(state),
      rawScores: state.archetypes
    };
  }

  return results;
}

module.exports = {
  initScoreState,
  processMultipleChoice,
  processFreeText,
  calculateArchetypeConfidence,
  getTopArchetype,
  shouldBlend,
  getPrimaryDomain,
  getPrimaryScale,
  checkPhase1Advance,
  checkPhase2Advance,
  selectPhase2Question,
  generateResult,
  formatResult,
  generateValidationSummary,
  applyCorrection,
  generateAmbiguousResult,
  runAcceptanceTest,
  THRESHOLDS,
  ARCHETYPES,
  DOMAINS,
  SCALES,
  archetypeDescriptions,
  semanticKeywords
};

// ─────────────────────────────────────────────
// ACCEPTANCE TEST ANSWER SETS
// v2 — Archetype-first personas, not job-title personas
//
// FRAMEWORK NOTE (important context for anyone reading this):
// The 6 archetypes were derived by asking: "what functional roles does any
// healthy team, organisation, or system need to operate?" — not "what jobs
// do people have?" A job title is an application of an archetype, not the
// archetype itself. The same job (e.g. sales) can be performed by any archetype.
// An electronics sales TEAM that works well probably has all 6 archetypes on it.
//
// Therefore: the acceptance test should verify that 6 behaviourally distinct
// people — each representing a different functional intelligence — produce 6
// different results. The domain and scale are secondary; the archetype is primary.
//
// These personas are named by functional drive, not occupation.
// Each one could hold any number of job titles. The behaviour is what's being tested.
//
// Run: runAcceptanceTest(testPersonaAnswers, questions)
// Pass criteria: each persona produces a distinct primary archetype.
// ─────────────────────────────────────────────

const testPersonaAnswers = {

  // ── PERSONA 1: THE SUSTAINER ──────────────────────────────
  // Expected archetype: Steward
  // Functional drive: keeps things alive, maintains what others built,
  //   carries institutional memory, shows up reliably over time.
  // Could be: a property manager, a nurse, a community organiser,
  //   a finance director, a parent, a head groundskeeper.
  // Key behaviour signature: maps before touching, documents after finishing,
  //   defaults to continuity over change, manages resources conservatively.
  "sustainer": [
    {
      questionId: "p1_q1",
      selectedOptionId: "a",
      // "Sort everything into folders — I want to understand what's there"
      // → Steward: 3, Guardian: 1
      // The Sustainer wants to know the full picture before acting
    },
    {
      questionId: "p1_q2",
      selectedOptionId: "d",
      // "Suggest a practical solution — shared fence, different area"
      // → Steward: 2, Maker: 2, Guardian: 1
      // Sustainable resolution over confrontation or avoidance
    },
    {
      questionId: "p1_q3",
      selectedOptionId: "a",
      // "It goes into savings or pays down something I owe"
      // → Steward: 3, Guardian: 2
      // Resource management is instinctive, not calculated
    },
    {
      questionId: "p1_q4",
      selectedOptionId: "b",
      // "Map what's already in motion before touching anything"
      // → Steward: 3, Guardian: 2
      // Classic Steward leadership: understand the system first
    },
    {
      questionId: "p1_q5",
      selectedOptionId: "b",
      // "Helped with something — food, music, keeping things running"
      // → Steward: 3, Maker: 1
      // Contributes through service to the whole, not through connection or exploration
    }
    // Expected Phase 1 result: Steward dominant (~55–65%)
    // Domain signals: technology × 1, finance × 1, society × 2 — ambiguous, Phase 2 clarifies
    // Final expected: Steward / [domain via Phase 2] / Local
  ],

  // ── PERSONA 2: THE BUILDER ────────────────────────────────
  // Expected archetype: Maker
  // Functional drive: brings things into existence, moves from idea to output,
  //   needs to be making something, judges by what's produced.
  // Could be: a software engineer, a carpenter, a chef, a product designer,
  //   a filmmaker, a fabricator, an entrepreneur.
  // Key behaviour signature: acts before fully planning, fixes by building,
  //   spends on tools and materials, leads by doing.
  "builder": [
    {
      questionId: "p1_q1",
      selectedOptionId: "b",
      // "Delete fast — clear the junk, keep what I'm using"
      // → Maker: 3, Explorer: 1
      // Pragmatic, action-first, doesn't linger on analysis
    },
    {
      questionId: "p1_q2",
      selectedOptionId: "b",
      // "Fix the garden first, then figure out how to prevent it happening again"
      // → Maker: 3, Steward: 1
      // Makes the problem go away through work, not conversation
    },
    {
      questionId: "p1_q3",
      selectedOptionId: "b",
      // "Buy something I've been needing for a project"
      // → Maker: 3
      // Money flows toward making capacity, not experiences or security
    },
    {
      questionId: "p1_q4",
      selectedOptionId: "c",
      // "Pick one thing that would make a visible difference and get it done"
      // → Maker: 3, Explorer: 1
      // Leads through output, not through structure or conversation
    },
    {
      questionId: "p1_q5",
      selectedOptionId: "b",
      // "Helped with something — food, music, whatever needed doing"
      // → Steward: 3, Maker: 1
      // NOTE: This scores Steward, not Maker — but the overall pattern
      // across Q1–Q4 is strongly Maker. This tests that Phase 1 accumulates
      // signal correctly rather than over-weighting any single answer.
    }
    // Expected Phase 1 result: Maker dominant (~45–55%), Steward as close second
    // May trigger Steward/Maker differentiator in Phase 2
    // Final expected: Maker / Technology / Local
  ],

  // ── PERSONA 3: THE WEAVER ─────────────────────────────────
  // Expected archetype: Connector
  // Functional drive: sees people, builds relationships, creates belonging,
  //   bridges between individuals who need to know each other.
  // Could be: a coach, a therapist, a community manager, a recruiter,
  //   a sales person who leads with care, a social worker, a host.
  // Key behaviour signature: reads people before tasks, spends on experiences
  //   with others, leads by understanding, social presence is depth-first not breadth-first.
  // NOTE: This is the archetype an electronics salesperson has IF their drive is
  //   "make sure people are taken care of" — not the job, the purpose underneath it.
  "weaver": [
    {
      questionId: "p1_q1",
      selectedOptionId: "c",
      // "Ask someone else — there's probably a smarter way I don't know"
      // → Connector: 3, Sage: 1
      // Defaults to people as the first resource
    },
    {
      questionId: "p1_q2",
      selectedOptionId: "e",
      // "Use it as a chance to actually get to know them"
      // → Connector: 2, Explorer: 2
      // Turns friction into relationship opportunity
    },
    {
      questionId: "p1_q3",
      selectedOptionId: "c",
      // "Experience with people I care about"
      // → Connector: 3, Explorer: 1
      // Value expressed through being with people, not accumulation or production
    },
    {
      questionId: "p1_q4",
      selectedOptionId: "a",
      // "Find out what each person is good at and what they actually care about"
      // → Connector: 3, Steward: 1
      // People-first before task structure — instinctive, not strategic
    },
    {
      questionId: "p1_q5",
      selectedOptionId: "a",
      // "Found one person and had a real conversation — the rest of the room didn't matter"
      // → Connector: 3, Sage: 1
      // Depth of one genuine connection over breadth of many surface contacts
    }
    // Expected Phase 1 result: Connector dominant (~65–75%)
    // Domain signals: human_being × 3, society × 1
    // Final expected: Connector / Human Being / Local
  ],

  // ── PERSONA 4: THE PROTECTOR ──────────────────────────────
  // Expected archetype: Guardian
  // Functional drive: holds the line, protects what matters, enforces standards,
  //   asks what could go wrong so others don't have to.
  // Could be: a lawyer, a compliance officer, a security architect, a doctor,
  //   a safety inspector, a risk manager, a parent, a conservation defender.
  // Key behaviour signature: backs up before acting, sets expectations explicitly,
  //   manages resources for security, stays close to trusted others in unfamiliar territory.
  "protector": [
    {
      questionId: "p1_q1",
      selectedOptionId: "d",
      // "Back everything up first before touching anything"
      // → Guardian: 3, Steward: 1
      // Protect before optimise — non-negotiable default
    },
    {
      questionId: "p1_q2",
      selectedOptionId: "a",
      // "Talk directly — explain what's been damaged and what I need"
      // → Guardian: 3, Steward: 1
      // Clear boundary-setting; names the harm and the expectation directly
    },
    {
      questionId: "p1_q3",
      selectedOptionId: "a",
      // "It goes into savings or pays down something I owe"
      // → Steward: 3, Guardian: 2
      // Financial security as a form of protection
    },
    {
      questionId: "p1_q4",
      selectedOptionId: "d",
      // "Set clear expectations and make sure everyone knows what success looks like"
      // → Guardian: 3, Steward: 1
      // Structure and accountability as the first leadership act
    },
    {
      questionId: "p1_q5",
      selectedOptionId: "e",
      // "Stayed close to the person I came with — I warm up slowly"
      // → Guardian: 2, Steward: 1
      // Caution in unfamiliar social terrain; trust built slowly
    }
    // Expected Phase 1 result: Guardian dominant (~55–65%), Steward second
    // Will likely trigger Steward/Guardian differentiator in Phase 2
    // Final expected: Guardian / [domain via Phase 2] / [scale via Phase 2]
  ],

  // ── PERSONA 5: THE PIONEER ────────────────────────────────
  // Expected archetype: Explorer
  // Functional drive: moves toward new territory, tests what doesn't exist yet,
  //   creates the path so others can follow, thrives at the frontier.
  // Could be: a venture investor, a researcher, a travel writer, an early-stage
  //   founder, a trend analyst, an expedition guide, an investigative journalist.
  // Key behaviour signature: moves to fix the constraint (not just the symptom),
  //   invests in bets and new knowledge, leads by opening territory, scans social
  //   environments for what's emerging rather than deepening what's there.
  "pioneer": [
    {
      questionId: "p1_q1",
      selectedOptionId: "e",
      // "Move everything to the cloud — fix the constraint, not the contents"
      // → Maker: 3, Steward: 1
      // NOTE: This now scores Maker (revised in v2). The Pioneer's Explorer signal
      // comes through more clearly in Q3, Q4, Q5 — this tests that the system
      // doesn't over-index on a single answer.
    },
    {
      questionId: "p1_q2",
      selectedOptionId: "e",
      // "Use it as a chance to get to know them — we've never spoken"
      // → Connector: 2, Explorer: 2
      // Turns friction into discovery; treats the unexpected as an opening
    },
    {
      questionId: "p1_q3",
      selectedOptionId: "e",
      // "Invest in learning something new or a bet on something I believe in"
      // → Explorer: 3, Sage: 2
      // Money flows toward new territory and new understanding
    },
    {
      questionId: "p1_q4",
      selectedOptionId: "c",
      // "Pick one thing that would make a visible difference and get it done"
      // → Maker: 3, Explorer: 1
      // Moves fast on the concrete, doesn't wait for full structure
    },
    {
      questionId: "p1_q5",
      selectedOptionId: "c",
      // "Moved around — I wanted a read on who was there and what was happening"
      // → Explorer: 3, Connector: 1
      // Scans the landscape; treats the room as a territory to understand
    }
    // Expected Phase 1 result: Explorer dominant (~35–45%), Maker and Sage as secondary
    // Will likely trigger Explorer/Sage or Explorer/Maker differentiator in Phase 2
    // Final expected: Explorer / Vision / [scale via clarifier — likely Global or Civilizational]
  ],

  // ── PERSONA 6: THE ILLUMINATOR ───────────────────────────
  // Expected archetype: Sage
  // Functional drive: understands in order to clarify, asks the question that
  //   reframes everything, sees pattern and root cause where others see noise.
  // Could be: a philosopher, a systems thinker, a scientist, a strategist,
  //   a teacher, a therapist who leads with insight, a senior advisor.
  // Key behaviour signature: organises before acting (but to understand, not to protect),
  //   reflects before spending, lets meaning emerge before imposing structure,
  //   observes before engaging.
  "illuminator": [
    {
      questionId: "p1_q1",
      selectedOptionId: "a",
      // "Sort everything into folders — understand what's actually there"
      // → Steward: 3, Guardian: 1
      // NOTE: Sage and Steward both want to understand before acting.
      // The difference emerges in Q4 and Q5 — and in Phase 2 free text.
    },
    {
      questionId: "p1_q2",
      selectedOptionId: "c",
      // "Have the conversation but make sure we both walk away fine"
      // → Connector: 3, Sage: 1
      // Seeks mutual understanding; not just resolution but comprehension
    },
    {
      questionId: "p1_q3",
      selectedOptionId: "e",
      // "Invest in learning something new or a bet on something I believe in"
      // → Explorer: 3, Sage: 2
      // Knowledge and understanding as the primary investment
    },
    {
      questionId: "p1_q4",
      selectedOptionId: "e",
      // "Ask what the team thinks the week should be for — let the purpose emerge"
      // → Sage: 3, Connector: 1
      // Meaning before structure; the question before the answer
    },
    {
      questionId: "p1_q5",
      selectedOptionId: "d",
      // "Mostly observed — taking it all in before deciding how to engage"
      // → Sage: 3, Guardian: 1
      // Deliberate observation over immediate action or connection
    }
    // Expected Phase 1 result: Sage dominant (~35–50%), Explorer as secondary
    // Will likely trigger Explorer/Sage differentiator in Phase 2
    // Final expected: Sage / Vision / [scale via clarifier — likely Global or Civilizational]
  ]

};

// ─────────────────────────────────────────────
// HOW TO RUN THE ACCEPTANCE TEST
// ─────────────────────────────────────────────
//
// const { questions } = require('./questions');
// const scoring = require('./scoring');
//
// const results = scoring.runAcceptanceTest(testPersonaAnswers, questions);
// console.log(JSON.stringify(results, null, 2));
//
// PASS CRITERIA:
// 1. Each persona produces a distinct primary archetype (or a meaningful blend
//    that Phase 2 will differentiate)
// 2. No persona below 35% confidence after Phase 1 — if so, question weights
//    aren't differentiating enough
// 3. Weaver (Connector) scores Connector >= 50% after Phase 1
// 4. Protector (Guardian) scores Guardian >= 45% after Phase 1
// 5. Sustainer (Steward) and Builder (Maker) are differentiated by Phase 2
//    even if close after Phase 1 — Steward/Maker differentiator handles this
//
// UNDERSTANDING SHARED JOB TITLES:
// Two people with the same job (e.g. "salesperson") can have different Purpose Pieces.
// The Weaver-salesperson: driven by taking care of people → Connector
// The Builder-salesperson: driven by configuring the right solution → Maker
// The Illuminator-salesperson: driven by understanding what the customer actually needs → Sage
// This is correct behaviour, not a scoring error. The system surfaces the person
// underneath the job, not the job itself.

module.exports.testPersonaAnswers = testPersonaAnswers;

