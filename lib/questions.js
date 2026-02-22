// PURPOSE PIECE — QUESTION BANK
// Pure data. No logic. Seven options per Phase 1 question (A–G, Architect added).
// Pressure fork distinguishes Maker from Architect.

const PHASE_1_QUESTIONS = [
  {
    id: "p1_q1",
    phase: 1,
    label: "Question 1 — First Move Under Uncertainty",
    text: "You're joining a project that's been running for four months. The documentation lives in three different places. Two people on the team disagree about what's actually been delivered. Work is still happening, but there's no clear structure holding it. What's your actual first move?",
    inputType: "multiple_choice",
    options: [
      { id: "a", text: "Get clear on what's already done — I need an honest picture before I touch anything.", archetype: "steward" },
      { id: "b", text: "Pick the most important thing moving and start pushing it forward.", archetype: "maker" },
      { id: "c", text: "Talk to the people involved — I want to understand what each of them thinks is happening.", archetype: "connector" },
      { id: "d", text: "Identify what's creating the drift and name it, even if that's uncomfortable.", archetype: "guardian" },
      { id: "e", text: "Look for how other teams or projects have handled this kind of situation — I want outside angles.", archetype: "explorer" },
      { id: "f", text: "Sit with it until I understand the pattern underneath — then name it.", archetype: "sage" },
      { id: "g", text: "Pick one place docs live, name who decides what, set a simple weekly rhythm — even if it annoys people, even if it slows things briefly.", archetype: "architect" }
    ]
  },

  {
    id: "p1_q2",
    phase: 1,
    label: "Question 2 — The Unowned Problem",
    text: "Something matters in a community or organisation you're part of. It's not urgent. Nobody owns it. You've noticed it for a while. What actually happens?",
    inputType: "multiple_choice",
    options: [
      { id: "a", text: "I start handling the parts that aren't getting handled — quietly, without making it a production.", archetype: "steward" },
      { id: "b", text: "I start thinking about what a proper solution would look like and sketch it out.", archetype: "maker" },
      { id: "c", text: "I find out who else has noticed and whether there's energy to do something about it together.", archetype: "connector" },
      { id: "d", text: "I figure out what's at risk if this keeps being ignored and say so clearly.", archetype: "guardian" },
      { id: "e", text: "I go looking for how others have solved this — in different contexts, different fields.", archetype: "explorer" },
      { id: "f", text: "I observe it for longer — most unattended things are telling you something if you watch them.", archetype: "sage" },
      { id: "g", text: "Make it owned: decide who owns it, what done looks like, and what happens if nobody acts — even if naming this creates an awkward conversation.", archetype: "architect" }
    ]
  },

  {
    id: "p1_q3",
    phase: 1,
    label: "Question 3 — The Unclear Ending",
    text: "Something you've been part of is winding down. There's no clear plan for what happens to what was built — the relationships, the knowledge, the work itself. What do you pay attention to?",
    inputType: "multiple_choice",
    options: [
      { id: "a", text: "Making sure the handoffs are clean — nothing important falls through the gap.", archetype: "steward" },
      { id: "b", text: "What could be carried forward, repurposed, or built into something new.", archetype: "maker" },
      { id: "c", text: "Making sure the right people stay in contact when this ends.", archetype: "connector" },
      { id: "d", text: "What needs to be protected — what shouldn't be lost even if the project is gone.", archetype: "guardian" },
      { id: "e", text: "What this whole thing learned that should be documented and taken somewhere.", archetype: "explorer" },
      { id: "f", text: "What this project revealed about how this kind of work actually functions — the deeper pattern.", archetype: "sage" },
      { id: "g", text: "Decide what gets kept, where it lives, who holds it next, and what process carries it forward — so nothing just dissolves because nobody named it.", archetype: "architect" }
    ]
  }
];

// Tiebreaker — free text, keyword-matched in scoring.js
const TIEBREAKER_QUESTION = {
  id: "p1_tiebreaker",
  phase: "1-tiebreaker",
  text: "One more question to get clearer. Think about a time when something was genuinely broken — a project, a relationship, a system, a plan. What was the very first thing you actually did?",
  inputType: "free_text"
};

// ─── PHASE 2 FORKS ────────────────────────────────────────────────────────────
// Format: short tense setup line + two buttons (exact Phase 3 language).
// Triggered only when Phase 1 produces ambiguity between specific pairs.
// Maximum 2 forks per session. Second fork only if first produces a blend.

const PHASE_2_FORKS = {

  // Triggered when maker + architect scores are within 1 of each other
  maker_architect: {
    id: "p2_fork_maker_architect",
    pair: ["maker", "architect"],
    phase: "2-fork",
    setup: "Things are chaotic and stuck.",
    inputType: "multiple_choice",
    options: [
      { id: "a", text: "Ship something now that moves it forward.", archetype: "maker" },
      { id: "b", text: "Stabilise the structure so the right work continues without you.", archetype: "architect" }
    ]
  },

  // Triggered when sage + architect scores are within 1 of each other
  sage_architect: {
    id: "p2_fork_sage_architect",
    pair: ["sage", "architect"],
    phase: "2-fork",
    setup: "You see why it keeps failing.",
    inputType: "multiple_choice",
    options: [
      { id: "a", text: "Offer the insight to someone who needs it.", archetype: "sage" },
      { id: "b", text: "Design a structure so the insight does not need to be carried by individuals.", archetype: "architect" }
    ]
  },

  // Triggered when steward + guardian scores are within 1 of each other
  steward_guardian: {
    id: "p2_fork_steward_guardian",
    pair: ["steward", "guardian"],
    phase: "2-fork",
    setup: "Something you care about is under threat.",
    inputType: "multiple_choice",
    options: [
      { id: "a", text: "Tend what keeps it functioning.", archetype: "steward" },
      { id: "b", text: "Set a firm boundary to protect its core.", archetype: "guardian" }
    ]
  },

  // Triggered when sage + explorer scores are within 1 of each other
  sage_explorer: {
    id: "p2_fork_sage_explorer",
    pair: ["sage", "explorer"],
    phase: "2-fork",
    setup: "No map. No precedent.",
    inputType: "multiple_choice",
    options: [
      { id: "a", text: "Look for the underlying pattern.", archetype: "sage" },
      { id: "b", text: "Move further into the unknown to see what is there.", archetype: "explorer" }
    ]
  },

  // Triggered when connector + steward scores are within 1 of each other
  connector_steward: {
    id: "p2_fork_connector_steward",
    pair: ["connector", "steward"],
    phase: "2-fork",
    setup: "The group is fraying.",
    inputType: "multiple_choice",
    options: [
      { id: "a", text: "Repair the relationships.", archetype: "connector" },
      { id: "b", text: "Stabilise the structure that still works.", archetype: "steward" }
    ]
  }
};

// ─── PHASE 2 UNIVERSAL QUESTIONS ──────────────────────────────────────────────
// Scale and domain. Always asked after forks (if any). Buttons only, no free text.

const PHASE_2_QUESTIONS = {

  scale: {
    id: "p2_scale",
    phase: "2-scale",
    label: "Scale",
    setup: "Think of a problem that genuinely pulls your attention.",
    inputType: "multiple_choice",
    options: [
      { id: "a", text: "People I could name.", scale: "local" },
      { id: "b", text: "A place I could cross in a day.", scale: "bioregional" },
      { id: "c", text: "Systems that cross borders.", scale: "global" },
      { id: "d", text: "Patterns that outlive me.", scale: "civilisational" }
    ]
  },

  domain: {
    id: "p2_domain",
    phase: "2-domain",
    label: "Domain",
    setup: "That same problem. Which territory does it belong to?",
    inputType: "multiple_choice",
    options: [
      { id: "a", text: "How humans become capable.", domain: "human_being" },
      { id: "b", text: "How we organise together.", domain: "society" },
      { id: "c", text: "Living systems.", domain: "nature" },
      { id: "d", text: "Tools and infrastructure.", domain: "technology" },
      { id: "e", text: "Resources and incentives.", domain: "finance" },
      { id: "f", text: "What we preserve.", domain: "legacy" },
      { id: "g", text: "What we imagine.", domain: "vision" }
    ]
  }

};

// Keep MAKER_ARCHITECT_FORK as alias for engine backward compatibility during transition
const MAKER_ARCHITECT_FORK = PHASE_2_FORKS.maker_architect;

// Subdomain menus — shown after domain is confirmed
const SUBDOMAIN_MENUS = {
  human_being: {
    prompt: "Within Human Being, there are different corners. Which feels most like where your energy lives?",
    options: [
      { id: "physical", text: "Physical health and vitality — the body, movement, medicine, nervous system." },
      { id: "mental", text: "Mental and emotional wellbeing — psychology, therapy, inner work, capacity." },
      { id: "spiritual", text: "Spiritual development — consciousness, meaning, practice, the inner life." },
      { id: "capacity", text: "Capacity building — helping people become more capable, resilient, and effective." },
      { id: "shadow", text: "Shadow and integration — the parts of us that limit or undermine, brought into awareness." }
    ]
  },

  society: {
    prompt: "Within Society, there are different corners. Which feels most like where your energy lives?",
    options: [
      { id: "governance", text: "Governance and decision-making — how collective decisions get made, who has power, how it's held accountable." },
      { id: "justice", text: "Justice and equity systems — who's protected, who's vulnerable, law, rights, structural inequity." },
      { id: "education", text: "Education and learning — how knowledge gets transmitted, what gets taught and how." },
      { id: "community", text: "Community and culture — how people form functioning social units, local culture, what we celebrate." },
      { id: "conflict", text: "Conflict and repair — mediation, restorative practice, how we move through breakdown." }
    ]
  },

  nature: {
    prompt: "Within Nature, there are different corners. Which feels most like where your energy lives?",
    options: [
      { id: "soil_food", text: "Soil, food, and agriculture — farming, soil health, food systems, how we grow what we eat." },
      { id: "water", text: "Water and watersheds — rivers, rainfall, water access, watershed health." },
      { id: "biodiversity", text: "Biodiversity and ecosystems — habitats, conservation, rewilding, the web of life." },
      { id: "climate", text: "Climate and atmosphere — planetary systems that regulate temperature and weather." },
      { id: "relationship", text: "The human relationship with nature — how people connect with and position themselves within the living world." }
    ]
  },

  technology: {
    prompt: "Within Technology, there are different corners. Which feels most like where your energy lives?",
    options: [
      { id: "digital", text: "Digital infrastructure and software — platforms, systems that organise information and communication." },
      { id: "ai", text: "Artificial intelligence — how machine intelligence gets built, deployed, and governed." },
      { id: "physical_infra", text: "Physical infrastructure — energy grids, transport, water systems, the built environment." },
      { id: "biotech", text: "Biotechnology and life sciences — medicine, genetics, how we engineer living systems." },
      { id: "ethics", text: "Tool ethics and design — whether and how technology serves human and ecological life." }
    ]
  },

  finance: {
    prompt: "Within Finance & Economy, there are different corners. Which feels most like where your energy lives?",
    options: [
      { id: "capital", text: "Capital and investment — how money moves toward certain futures, impact investing, philanthropic capital." },
      { id: "distribution", text: "Wealth distribution and access — who has resources and why, inequality, economic justice." },
      { id: "alternative", text: "Alternative economic models — cooperatives, commons, local currencies, regenerative economics." },
      { id: "allocation", text: "Resource allocation systems — how systems decide what gets funded, budgets, grants, policy." }
    ]
  },

  legacy: {
    prompt: "Within Legacy, there are different corners. Which feels most like where your energy lives?",
    options: [
      { id: "preservation", text: "Cultural preservation — keeping knowledge, practices, languages alive." },
      { id: "transmission", text: "Knowledge transmission — how what's known gets passed on, teaching, documentation, oral tradition." },
      { id: "future_gen", text: "Future generations thinking — working for people not yet born, seven-generation thinking." },
      { id: "deep_time", text: "Deep time and long horizons — thinking in centuries, what outlives institutions." }
    ]
  },

  vision: {
    prompt: "Within Vision, there are different corners. Which feels most like where your energy lives?",
    options: [
      { id: "collective", text: "Collective visioning — helping groups see a shared future, what it takes to imagine together." },
      { id: "scenarios", text: "Scenario planning and futures thinking — mapping what's possible, strategic foresight." },
      { id: "coordination", text: "Coordination infrastructure — systems that allow diverse actors to align without agreeing on everything." },
      { id: "narrative", text: "Narrative and possibility — stories that make alternative futures feel real." }
    ]
  }
};

module.exports = {
  PHASE_1_QUESTIONS,
  TIEBREAKER_QUESTION,
  MAKER_ARCHITECT_FORK,
  PHASE_2_FORKS,
  PHASE_2_QUESTIONS,
  SUBDOMAIN_MENUS
};
