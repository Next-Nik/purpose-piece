// PURPOSE PIECE v3 — SCORING ENGINE
// Simplified: tally archetypes, infer domain from free text, confirm scale

const ARCHETYPES = ["steward", "maker", "connector", "guardian", "explorer", "sage"];

const DOMAINS = ["human_being", "society", "nature", "technology", "finance", "legacy", "vision"];

const SCALES = ["local", "bioregional", "global", "civilizational"];

// Domain keywords for Q4 free-text inference
const DOMAIN_KEYWORDS = {
  human_being: ["body", "mind", "therapy", "healing", "consciousness", "awareness", "somatic", "mental health", "emotional", "capacity", "development", "inner", "self", "wellness", "meditation", "spiritual"],
  society: ["community", "governance", "policy", "education", "culture", "justice", "equity", "social", "organize", "collective", "political", "civic", "neighborhood", "city", "government"],
  nature: ["ecosystem", "biodiversity", "climate", "soil", "water", "agriculture", "farming", "conservation", "environment", "regenerative", "ecological", "watershed", "habitat", "species", "planet"],
  technology: ["software", "digital", "infrastructure", "AI", "code", "system", "platform", "tech", "engineering", "tool", "data", "internet", "computer", "algorithm", "network"],
  finance: ["money", "capital", "investment", "economic", "wealth", "resources", "funding", "budget", "finance", "currency", "allocation", "market", "economy", "financial", "redistribution"],
  legacy: ["future", "generations", "preservation", "knowledge", "archive", "tradition", "cultural", "heritage", "long-term", "intergenerational", "ancestor", "history", "memory", "century"],
  vision: ["future", "possibility", "imagination", "coordinate", "alignment", "scenario", "foresight", "collective vision", "narrative", "hope", "movement", "direction", "planning"]
};

function createSession() {
  return {
    phase: 1,
    archetypeTally: {
      steward: 0,
      maker: 0,
      connector: 0,
      guardian: 0,
      explorer: 0,
      sage: 0
    },
    answeredQuestions: [],
    answers: [],
    domain: null,
    subdomain: null,
    scale: null,
    primaryArchetype: null,
    secondaryArchetype: null,
    behaviorText: null,
    status: "active"
  };
}

function tallyArchetype(session, archetype) {
  session.archetypeTally[archetype] = (session.archetypeTally[archetype] || 0) + 1;
}

function getTopArchetypes(session) {
  const sorted = Object.entries(session.archetypeTally)
    .sort((a, b) => b[1] - a[1]);
  
  const primary = sorted[0];
  const secondary = sorted[1];
  
  return {
    primary: primary[0],
    primaryCount: primary[1],
    secondary: secondary[0],
    secondaryCount: secondary[1],
    isTie: primary[1] === secondary[1],
    isClear: primary[1] >= 2
  };
}

function inferDomainFromText(text) {
  if (!text) return null;
  
  const lowerText = text.toLowerCase();
  const domainScores = {};
  
  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    domainScores[domain] = 0;
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        domainScores[domain]++;
      }
    }
  }
  
  const sorted = Object.entries(domainScores)
    .filter(([_, score]) => score > 0)
    .sort((a, b) => b[1] - a[1]);
  
  return sorted.length > 0 ? sorted[0][0] : null;
}

function generateBehavioralDescription(archetype, secondary = null) {
  const descriptions = {
    steward: "You sustain. Where others build and move on, you stay — tending, maintaining, improving what exists. You notice what needs attention before it becomes a problem. You carry things others forget they handed to you.",
    
    maker: "You create. Ideas aren't real to you until they exist in the world. You move from concept to creation quickly. You value function over perfection. When something needs to exist, you're the one who brings it into being.",
    
    connector: "You weave relationships. You see who needs who. You notice complementary patterns. You facilitate collaboration without dominating it. When groups work well together, you're often the reason — you made people feel safe enough to show up.",
    
    guardian: "You protect what matters. You see threats before they materialize. You hold boundaries. You ask the questions others avoid: 'What could go wrong?' 'Who's protecting this?' You defend so others don't have to.",
    
    explorer: "You move toward edges. Toward what hasn't been mapped yet. You're comfortable with uncertainty. You don't explore for novelty — you explore because something's needed and it's not here yet. You go out, you find it, you bring it back.",
    
    sage: "You see patterns. Not just once — across time, across contexts. You understand why things are the way they are. You hold complexity without simplifying prematurely. When people are stuck, you're the one who names what's actually happening underneath."
  };
  
  if (secondary) {
    return descriptions[archetype] + "\n\nYou also show up as " + secondary + " — " + descriptions[secondary].split('.')[0].toLowerCase() + ".";
  }
  
  return descriptions[archetype];
}

function generateWorldImpact(archetype) {
  const impacts = {
    steward: "In the world, this looks like: you're the one things don't fall apart around. Systems stay functional. Knowledge doesn't get lost. The work that matters keeps moving because you're tending it.",
    
    maker: "In the world, this looks like: the tools exist. The structures are there. The solutions people needed actually get built. You turn 'we should' into 'here it is.'",
    
    connector: "In the world, this looks like: people find each other. Partnerships form. Communities cohere. The right people end up in the same room at the right time, and things happen that wouldn't have otherwise.",
    
    guardian: "In the world, this looks like: what's vulnerable gets to survive. What's sacred doesn't get destroyed. The line holds. People who can't protect themselves don't have to — because you're standing there.",
    
    explorer: "In the world, this looks like: new territory gets mapped. Breakthroughs happen. The answers that weren't available become available because you went and found them.",
    
    sage: "In the world, this looks like: people see more clearly. Groups stop repeating the same patterns. The right question gets asked. Understanding deepens."
  };
  
  return impacts[archetype];
}

module.exports = {
  ARCHETYPES,
  DOMAINS,
  SCALES,
  createSession,
  tallyArchetype,
  getTopArchetypes,
  inferDomainFromText,
  generateBehavioralDescription,
  generateWorldImpact
};
