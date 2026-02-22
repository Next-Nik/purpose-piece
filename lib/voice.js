// PURPOSE PIECE — VOICE LAYER
// All language the system produces lives here. No logic.
// Register: Zor-El. Calm authority. Declarative. Invites correction, not agreement.
// "Your life may not reflect this yet. This is your native pattern. Where does it miss?"

// ─── Welcome ──────────────────────────────────────────────────────────────────
const WELCOME = `Welcome.

There's a role you're built for in shaping the future we want to live into.

You may already sense it — that feeling that you're meant to contribute in a specific way, even if you haven't fully stepped into it yet.

This is a way to bring that into focus.

We'll move through a few focused questions to surface the pattern — and then we'll test it carefully. Not as an idea, but as something that either resonates in your bones or doesn't.

If it fits, you'll leave with clarity about your Purpose Piece — and a clear path for inhabiting it more fully.

There are no right answers.

Don't choose what sounds impressive.
Choose what feels most like you when you're not trying to be anything.

Ready?`;

// ─── Phase transition markers ─────────────────────────────────────────────────
const TRANSITIONS = {
  phase1Complete:  "Pattern is coming into focus.",
  phase2Opening:   "A few more things to place it correctly.",
  recognitionOpen: "Here's the pattern."
};

// ─── Acknowledgments (minimal — only when earned) ────────────────────────────
// Used sparingly. Rich free-text answers only.
const ACKNOWLEDGMENTS = {
  structuralAnswer:  "That's a structural move. Noted.",
  broadScopeAnswer:  "Someone building the container others work inside. Let's find where your energy sits within it.",
  civilizationalWithBreadth: "Scale and cross-domain awareness. Both matter here.",
  behaviorRich:      null  // intentionally silent — question follows without comment
};

// ─── Clarification prompts ────────────────────────────────────────────────────
const CLARIFICATIONS = {
  phase1BadInput:    "Select a letter — A through G.",
  scaleBadInput:     "Select a letter — A, B, C, or D.",
  subdomainBadInput: "Select one of the options listed.",
  ambiguousMultiple: "Sometimes two feel close. If you had to choose the one that survives under pressure — which is it?"
};

// ─── Recognition sequence ─────────────────────────────────────────────────────
// Declarative first. Invite correction. Never ask for agreement.

function recognitionStep1(behavioralDescription) {
  return `${behavioralDescription}

Your life may not fully reflect this yet. This is your native pattern of contribution. Where does it miss?`;
}

function recognitionGap(archetypeName) {
  return `That gap — between what you're built for and what you're currently living — is worth naming directly.

The pattern doesn't require your current circumstances to confirm it. It's present whether or not life has given it room yet.

Does the ${archetypeName} pattern feel true at your core — separate from what you're doing right now?`;
}

function recognitionStep2(worldImpact) {
  return `${worldImpact}

That's the contribution this pattern makes in the world. Where does that land?`;
}

function recognitionCorrection(attempt) {
  if (attempt === 1) {
    return "What part doesn't fit?";
  }
  if (attempt === 2) {
    return "Still not quite right. Let's try a different angle — what does feel true about how you move in the world?";
  }
  // attempt >= 3: offer alternate or close honestly
  return null; // engine handles alternate archetype offer at this point
}

function recognitionAlternateOffer(primaryArchetype, alternateArchetype) {
  return `The ${cap(primaryArchetype)} pattern may not be the right one.

Looking at what you've described, there's also a strong ${cap(alternateArchetype)} signal — ${getArchetypeEssenceShort(alternateArchetype)}.

Does that fit better?`;
}

function recognitionHonestClose() {
  return `The pattern isn't locking in clearly from this end.

That sometimes happens — the questions don't always catch everyone. You may be in a transitional moment, or your pattern may be genuinely hybrid in a way the current system doesn't resolve cleanly.

What we can say: the signal points toward ${"{primary}"}. Take that as a starting point, not a verdict.`;
}

// ─── Reveal ───────────────────────────────────────────────────────────────────
function archetypeReveal(archetypeName, secondaryName, archEssence) {
  let text = `What keeps showing up across everything you've described: ${archEssence}

The name for this pattern is ${archetypeName}.`;

  if (secondaryName) {
    text += `\n\nThere's also a ${secondaryName} quality in how you operate — not equal weight, but present.`;
  }

  return text;
}

// ─── Full profile delivery ────────────────────────────────────────────────────
function formatFullProfile({ archetype, secondary, domain, scale, profile, domainModifier, scaleModifier }) {
  const domainLabel = domainModifier ? domainModifier.label : domain;
  const scaleLabel  = scaleModifier  ? scaleModifier.label  : scale;

  let text = `YOUR PURPOSE PIECE\n\n`;
  text += `${profile.label}`;
  if (secondary) text += ` + ${cap(secondary)}`;
  text += `\n${domainLabel} · ${scaleLabel}\n\n`;

  // If dual archetype, render the blended bridge before the primary profile description.
  // Key is always sorted alphabetically so lookup is consistent regardless of which
  // archetype is primary and which is secondary.
  if (secondary) {
    const { blendedDescriptions } = require("./profiles");
    const blendKey = [archetype, secondary].sort().join("_");
    const blend = blendedDescriptions[blendKey];
    if (blend) {
      text += `${blend.tagline.toUpperCase()}\n`;
      text += `${blend.bridge}\n`;
      if (blend.uniqueNote) text += `\nWatch: ${blend.uniqueNote}\n`;
      text += `\n`;
    }
  }

  text += `${profile.description}\n\n`;

  if (domainModifier) text += `${domainModifier.context}\n\n`;
  if (scaleModifier)  text += `${scaleModifier.context}\n\n`;

  text += `WHAT YOU'RE BUILT FOR:\n`;
  profile.signatureStrengths.forEach(s => { text += `· ${s}\n`; });
  text += `\n`;

  text += `WHERE YOU CAN LOSE THE THREAD:\n`;
  profile.shadowPatterns.forEach(s => { text += `· ${s}\n`; });
  text += `\n`;

  text += `QUESTIONS TO COME BACK TO:\n`;
  profile.realignmentCues.forEach(q => { text += `· ${q}\n`; });
  text += `\n`;

  text += `WHY THIS MATTERS:\n${profile.whyItMatters}\n\n`;

  text += `─────\n\n`;
  text += `This is your Purpose Piece. Not a label — a pattern that's already in you.\nThe question now is where it belongs in the work.`;

  return text;
}

// ─── Off-road / conversational response templates ────────────────────────────
// Used by chat.js when user goes off-script during structured questions.

const OFF_ROAD = {
  // User asks a question mid-assessment
  questionDuringAssessment: (userQuestion) =>
    `${userQuestion}\n\nWe can go into that. What specifically are you wondering about?`,

  // User expresses doubt about the process
  doubtAboutProcess:
    `Reasonable. This isn't trying to reduce you to a type.\n\nIt's looking for a dominant pattern in how you move — the contribution mode that's most native to you. The questions are behavioural by design: not who you want to be, but what you actually do.\n\nWant to continue?`,

  // User says they're multiple archetypes
  claimsMultiple:
    `Most people have more than one pattern available to them. That's not the same as having a primary one.\n\nThe question isn't which modes you're capable of — it's which one you default to when you're not thinking about it. What happens automatically, before you decide?`,

  // User says the options don't fit
  optionsDontFit:
    `If none of the options quite fit, describe your actual first move in your own words. We'll work from that.`,

  // User expresses frustration
  frustration:
    `Noted. If the questions are missing something real about how you operate, tell me what they're missing. That's more useful than guessing at the closest option.`,

  // Generic off-road catch
  generic: (userInput) =>
    `Heard. Before we continue — is there something specific you want to address, or shall we keep going?`
};

// ─── Archetype essences (short form, for reveal and recognition) ──────────────
const ARCHETYPE_ESSENCES = {
  steward:   "keeps things alive — tends what exists, repairs what breaks, maintains what others take for granted",
  maker:     "builds — moves from concept to creation and values function over perfection",
  architect: "designs the container — creates the structures other people operate inside",
  connector: "weaves relationships — sees how people and ideas belong together and makes those connections real",
  guardian:  "holds the line — recognises threats before others do and protects what matters",
  explorer:  "goes first — ventures into unknown territory and brings back what's needed",
  sage:      "sees why — holds complexity without simplifying it and offers perspective that clarifies what's true"
};

function getArchetypeEssenceShort(archetype) {
  return ARCHETYPE_ESSENCES[archetype] || "contributes in a distinctive way";
}

function getArchetypeEssenceLong(archetype) {
  const longs = {
    steward:   "someone who keeps things alive — who tends what exists, repairs what breaks, and maintains what others take for granted",
    maker:     "someone who builds — who moves from concept to creation and values function over perfection",
    architect: "someone who designs the container — who creates the structures other people operate inside, not just instances within those structures",
    connector: "someone who weaves relationships — who sees how people and ideas belong together and makes those connections real",
    guardian:  "someone who holds the line — who recognises threats before others do and holds boundaries so that what matters can survive",
    explorer:  "someone who goes first — who ventures into unknown territory and brings back what's needed",
    sage:      "someone who sees why — who holds complexity without simplifying it and offers perspective that clarifies what's true"
  };
  return longs[archetype] || "someone who contributes in a distinctive way";
}

// ─── Progress bar labels ──────────────────────────────────────────────────────
// No misleading "X of 8" — phase-based only
const PHASE_LABELS = {
  1:              "Rapid Signal",
  "1-tiebreaker": "Rapid Signal",
  "1-fork":       "Rapid Signal",
  "2-behavior":   "Clarifying Signal",
  "2-scale":      "Clarifying Signal",
  "2-domain-needed": "Clarifying Signal",
  "2-subdomain":  "Clarifying Signal",
  3:              "Recognition",
  4:              "Your Purpose Piece"
};

function getPhaseLabel(phase) {
  return PHASE_LABELS[phase] || "In Progress";
}

// ─── Utility ──────────────────────────────────────────────────────────────────
function cap(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = {
  WELCOME,
  TRANSITIONS,
  ACKNOWLEDGMENTS,
  CLARIFICATIONS,
  OFF_ROAD,
  ARCHETYPE_ESSENCES,
  recognitionStep1,
  recognitionGap,
  recognitionStep2,
  recognitionCorrection,
  recognitionAlternateOffer,
  recognitionHonestClose,
  archetypeReveal,
  formatFullProfile,
  getArchetypeEssenceShort,
  getArchetypeEssenceLong,
  getPhaseLabel,
  cap
};
