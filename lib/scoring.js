// PURPOSE PIECE — SCORING ENGINE
// Pure logic. No questions, no UI, no language.
// Tallies archetypes, infers domain from free text, manages session state.

const ARCHETYPES = ["steward", "maker", "architect", "connector", "guardian", "explorer", "sage"];
const DOMAINS    = ["human_being", "society", "nature", "technology", "finance", "legacy", "vision"];
const SCALES     = ["local", "bioregional", "global", "civilizational"];

// ─── Domain inference keywords ────────────────────────────────────────────────
const DOMAIN_KEYWORDS = {
  human_being: ["body", "mind", "therapy", "healing", "consciousness", "awareness", "somatic", "mental health", "emotional", "capacity", "development", "inner", "self", "wellness", "meditation", "spiritual", "nervous system", "trauma"],
  society:     ["community", "governance", "policy", "education", "culture", "justice", "equity", "social", "organize", "collective", "political", "civic", "neighborhood", "city", "government", "school", "institution"],
  nature:      ["ecosystem", "biodiversity", "climate", "soil", "water", "agriculture", "farming", "conservation", "environment", "regenerative", "ecological", "watershed", "habitat", "species", "planet", "land", "forest"],
  technology:  ["software", "digital", "infrastructure", "AI", "code", "system", "platform", "tech", "engineering", "tool", "data", "internet", "computer", "algorithm", "network", "app", "product"],
  finance:     ["money", "capital", "investment", "economic", "wealth", "resources", "funding", "budget", "finance", "currency", "allocation", "market", "economy", "financial", "redistribution", "grants"],
  legacy:      ["future", "generations", "preservation", "knowledge", "archive", "tradition", "cultural", "heritage", "long-term", "intergenerational", "ancestor", "history", "memory", "century", "succession"],
  vision:      ["possibility", "imagination", "coordinate", "alignment", "scenario", "foresight", "collective vision", "narrative", "hope", "movement", "direction", "planning", "futures", "strategy", "coordination"]
};

// ─── Architect signal words (for tiebreaker + off-road detection) ─────────────
const ARCHITECT_SIGNALS = [
  "structure", "framework", "architecture", "system", "protocol", "model", "design",
  "container", "operating", "governance", "coordination", "alignment", "infrastructure",
  "coherence", "interface", "mechanism", "blueprint", "taxonomy", "constitution"
];

// ─── Archetype tiebreaker verbs ───────────────────────────────────────────────
const ARCHETYPE_VERBS = {
  steward:   ["maintain", "manage", "organise", "organize", "keep", "tend", "sustain", "handle", "care", "preserve"],
  maker:     ["build", "create", "make", "design", "construct", "develop", "produce", "ship", "launch"],
  architect: ["structure", "framework", "architect", "redesign", "coordinate", "align", "model", "blueprint", "systematise", "systematize"],
  connector: ["connect", "bring", "talk", "reach out", "coordinate", "facilitate", "introduce", "convene"],
  guardian:  ["protect", "defend", "prevent", "guard", "check", "ensure", "stop", "hold", "enforce"],
  explorer:  ["explore", "research", "investigate", "discover", "find", "learn", "try", "venture", "test"],
  sage:      ["understand", "analyze", "analyse", "observe", "reflect", "consider", "think", "study", "synthesise", "synthesize"]
};

// ─── Session ──────────────────────────────────────────────────────────────────
function createSession() {
  return {
    phase: 1,
    archetypeTally: {
      steward: 0, maker: 0, architect: 0,
      connector: 0, guardian: 0, explorer: 0, sage: 0
    },
    answeredQuestions: [],
    answers: [],
    domain: null,
    subdomain: null,
    scale: null,
    primaryArchetype: null,
    secondaryArchetype: null,
    pendingSecondary: null,
    confidence: null,
    tiebreakerText: null,
    pendingForks: [],
    forksCompleted: 0,
    forksTriggered: [],
    activeForkKey: null,
    phase2Answers: [],
    awaitingCorrection: false,
    status: "active"
  };
}

function tallyArchetype(session, archetype) {
  if (session.archetypeTally[archetype] !== undefined) {
    session.archetypeTally[archetype]++;
  }
}

// Returns primary, secondary, counts, flags
function getTopArchetypes(session) {
  const sorted = Object.entries(session.archetypeTally)
    .sort((a, b) => b[1] - a[1]);

  const primary   = sorted[0];
  const secondary = sorted[1];

  const isTie   = primary[1] === secondary[1] && primary[1] > 0;
  const isClear = primary[1] >= 2 && (primary[1] - secondary[1]) >= 1;

  // Confidence for Phase 3 handoff
  // strong:   3/3 same archetype
  // moderate: 2/3 with one secondary
  // weak:     tie or three-way split
  let confidence = "weak";
  if (primary[1] === 3) confidence = "strong";
  else if (primary[1] === 2 && !isTie) confidence = "moderate";

  // Detect all ambiguous pairs that need Phase 2 forks
  const FORK_PAIRS = [
    ["maker",     "architect"],
    ["sage",      "architect"],
    ["steward",   "guardian"],
    ["sage",      "explorer"],
    ["connector", "steward"]
  ];

  const neededForks = [];
  for (const [a, b] of FORK_PAIRS) {
    const scoreA = session.archetypeTally[a] || 0;
    const scoreB = session.archetypeTally[b] || 0;
    if (Math.abs(scoreA - scoreB) <= 1 && (scoreA + scoreB) >= 2) {
      neededForks.push(`${a}_${b}`);
    }
  }

  // Legacy: flag for engine backward compat
  const needsMakerArchitectFork = neededForks.includes("maker_architect");

  return {
    primary:               primary[0],
    primaryCount:          primary[1],
    secondary:             secondary[0],
    secondaryCount:        secondary[1],
    isTie,
    isClear,
    confidence,
    neededForks,
    needsMakerArchitectFork
  };
}

// Domain inference from free text
function inferDomainFromText(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  const scores = {};

  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    scores[domain] = keywords.filter(kw => lower.includes(kw)).length;
  }

  const sorted = Object.entries(scores)
    .filter(([, s]) => s > 0)
    .sort((a, b) => b[1] - a[1]);

  return sorted.length > 0 ? sorted[0][0] : null;
}

// Detect Architect signals in free text (for off-road handling)
function detectArchitectSignal(text) {
  const lower = text.toLowerCase();
  return ARCHITECT_SIGNALS.filter(s => lower.includes(s)).length;
}

// Break tiebreaker via verb matching
function breakTieFromText(text, candidates) {
  const lower = text.toLowerCase();
  let bestMatch = candidates[0];
  let maxCount  = 0;

  for (const archetype of candidates) {
    const verbs = ARCHETYPE_VERBS[archetype] || [];
    const count = verbs.filter(v => lower.includes(v)).length;
    if (count > maxCount) { maxCount = count; bestMatch = archetype; }
  }

  return bestMatch;
}

// ─── Behavioral description (shown in recognition sequence) ──────────────────
function generateBehavioralDescription(archetype, secondary = null) {
  const descriptions = {
    steward:   "You sustain. Where others build and move on, you stay — tending, maintaining, improving what exists. You notice what needs attention before it becomes a problem. You carry things others forget they handed to you.",
    maker:     "You build. Ideas aren't real to you until they exist in the world. You move from concept to creation faster than most people think possible. When something needs to exist, you close the gap.",
    architect: "You design the container. When you encounter chaos, your first move isn't to fix the immediate problem — it's to understand what structural conditions are producing it and redesign those conditions. You think in systems, interfaces, decision rules. You're not satisfied until the architecture is sound.",
    connector: "You weave relationships. You see who needs who. You notice what's left unsaid and who belongs in the same room. When groups work well together, you're often why — you made it safe enough for people to show up.",
    guardian:  "You protect what matters. You see threats before they materialise. You hold boundaries and ask the questions others avoid. You defend so others don't have to — and you do it precisely, not reflexively.",
    explorer:  "You move toward edges. Toward what hasn't been mapped yet. You're comfortable with uncertainty in a way that's genuinely rare. You don't explore for novelty — you explore because something's needed and it's not here yet.",
    sage:      "You see patterns. Not just once — across time, across contexts. You understand why things are the way they are. You hold complexity without simplifying it prematurely. When people are stuck, you're the one who names what's actually happening underneath."
  };

  let desc = descriptions[archetype] || "";

  // Secondary only shown after resonance confirmation — this flag is set by engine
  if (secondary && secondary !== archetype) {
    const secondaryOpeners = {
      steward:   "you also sustain — you tend what exists",
      maker:     "you also build — you move from idea to execution",
      architect: "you also design structure — you think in systems",
      connector: "you also weave relationships — you see who belongs together",
      guardian:  "you also protect — you hold the line on what matters",
      explorer:  "you also venture — you're pulled toward what doesn't exist yet",
      sage:      "you also see patterns — you understand why things work the way they do"
    };
    desc += `\n\nThere's also a ${cap(secondary)} quality in how you operate — ${secondaryOpeners[secondary] || ""}.`;
  }

  return desc;
}

// World impact statement (recognition step 2)
function generateWorldImpact(archetype) {
  const impacts = {
    steward:   "In the world, this looks like: systems stay functional. Knowledge doesn't get lost. The work that matters keeps moving because someone is tending it. That someone is often you.",
    maker:     "In the world, this looks like: the tools exist. The structures are there. The solutions people needed actually get built. You turn 'we should' into 'here it is.'",
    architect: "In the world, this looks like: things that kept breaking stop breaking — because the structure changed, not just the instance. Coordination that required heroic effort becomes routine. The container is sound, so the work inside it can be.",
    connector: "In the world, this looks like: people find each other. Partnerships form. Communities cohere. The right people end up in the same room at the right time, and things happen that wouldn't have otherwise.",
    guardian:  "In the world, this looks like: what's vulnerable gets to survive. What's sacred doesn't get destroyed. The line holds. People who can't protect themselves don't have to — because you're there.",
    explorer:  "In the world, this looks like: new territory gets mapped. Breakthroughs happen. The answers that weren't available become available because someone went and found them. That someone is often you.",
    sage:      "In the world, this looks like: people see more clearly. Groups stop repeating the same patterns. The right question gets asked at the right moment. Understanding deepens in ways that change what's possible."
  };

  return impacts[archetype] || "";
}

function cap(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = {
  ARCHETYPES,
  DOMAINS,
  SCALES,
  ARCHITECT_SIGNALS,
  ARCHETYPE_VERBS,
  createSession,
  tallyArchetype,
  getTopArchetypes,
  inferDomainFromText,
  detectArchitectSignal,
  breakTieFromText,
  generateBehavioralDescription,
  generateWorldImpact
};
