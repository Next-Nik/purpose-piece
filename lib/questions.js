// PURPOSE PIECE v3 — QUESTION BANK
// Architecture: 3 questions Phase 1, adaptive Phase 2, subdomain menus

const PHASE_1_QUESTIONS = [
  {
    id: "p1_q1",
    phase: 1,
    text: "You're joining a project that's been running for four months. The documentation lives in three different places. Two people on the team disagree about what's actually been delivered. Work is still happening, but there's no clear structure holding it. What's your actual first move?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "Get clear on what's already done — I need an honest picture before I touch anything.",
        archetype: "steward"
      },
      {
        id: "b",
        text: "Pick the most important thing moving and start pushing it forward.",
        archetype: "maker"
      },
      {
        id: "c",
        text: "Talk to the people involved — I want to understand what each of them thinks is happening.",
        archetype: "connector"
      },
      {
        id: "d",
        text: "Identify what's creating the drift and name it, even if that's uncomfortable.",
        archetype: "guardian"
      },
      {
        id: "e",
        text: "Look for how other teams or projects have handled this kind of situation — I want outside angles.",
        archetype: "explorer"
      },
      {
        id: "f",
        text: "Sit with it until I understand the pattern underneath — then name it.",
        archetype: "sage"
      }
    ]
  },

  {
    id: "p1_q2",
    phase: 1,
    text: "Something matters in a community or organization you're part of. It's not urgent. Nobody owns it. You've noticed it for a while. What actually happens?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "I start handling the parts that aren't getting handled — quietly, without making it a production.",
        archetype: "steward"
      },
      {
        id: "b",
        text: "I start thinking about what a proper solution would look like and sketch it out.",
        archetype: "maker"
      },
      {
        id: "c",
        text: "I find out who else has noticed and whether there's energy to do something about it together.",
        archetype: "connector"
      },
      {
        id: "d",
        text: "I figure out what's at risk if this keeps being ignored and say so clearly.",
        archetype: "guardian"
      },
      {
        id: "e",
        text: "I go looking for how others have solved this — in different contexts, different fields.",
        archetype: "explorer"
      },
      {
        id: "f",
        text: "I observe it for longer — most unattended things are telling you something if you watch them.",
        archetype: "sage"
      }
    ]
  },

  {
    id: "p1_q3",
    phase: 1,
    text: "Something you've been part of is winding down. There's no clear plan for what happens to what was built — the relationships, the knowledge, the work itself. What do you pay attention to?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "Making sure the handoffs are clean — nothing important falls through the gap.",
        archetype: "steward"
      },
      {
        id: "b",
        text: "What could be carried forward, repurposed, or built into something new.",
        archetype: "maker"
      },
      {
        id: "c",
        text: "Making sure the right people stay in contact when this ends.",
        archetype: "connector"
      },
      {
        id: "d",
        text: "What needs to be protected — what shouldn't be lost even if the project is gone.",
        archetype: "guardian"
      },
      {
        id: "e",
        text: "What this whole thing learned that should be documented and taken somewhere.",
        archetype: "explorer"
      },
      {
        id: "f",
        text: "What this project revealed about how this kind of work actually functions.",
        archetype: "sage"
      }
    ]
  }
];

const TIEBREAKER_QUESTION = {
  id: "p1_tiebreaker",
  phase: 1,
  text: "Think about the last time something needed doing and wasn't getting done. Not a work scenario necessarily — anything. What did you actually do?",
  inputType: "free_text",
  maxLength: 300,
  note: "Listen for verbs. Map to archetype. Do not present options."
};

const PHASE_2_QUESTIONS = {
  recentBehavior: {
    id: "p2_q4_behavior",
    phase: 2,
    text: "Think about something you were genuinely absorbed in recently — work, personal, anything. Describe what you were actually doing in a sentence or two.",
    inputType: "free_text",
    maxLength: 300
  },

  scale: {
    id: "p2_q6_scale",
    phase: 2,
    text: "When you imagine your contribution at its fullest — the work that feels most you — what's the natural scope?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "People and places I know directly — my neighborhood, my community, face-to-face.",
        scale: "local"
      },
      {
        id: "b",
        text: "My region — the watershed, the city, the bioregion I'm part of.",
        scale: "bioregional"
      },
      {
        id: "c",
        text: "International, cross-border — planetary scale challenges and systems.",
        scale: "global"
      },
      {
        id: "d",
        text: "Intergenerational — working for people not yet born, thinking in decades or centuries.",
        scale: "civilizational"
      }
    ]
  }
};

// Subdomain menus for each domain
const SUBDOMAIN_MENUS = {
  human_being: {
    prompt: "Within Human Being, there are different corners. Which feels most like where your energy lives?",
    options: [
      {
        id: "physical",
        text: "Physical health and the body — how people inhabit themselves physically, somatic work, movement, nervous system."
      },
      {
        id: "mental_emotional",
        text: "Mental and emotional wellbeing — how minds function, therapy, psychology, emotional capacity."
      },
      {
        id: "consciousness",
        text: "Consciousness and inner development — the interior life, awareness, spiritual development, depth."
      },
      {
        id: "capacity",
        text: "Capacity building — what enables people to function at their best, skills, resilience, self-knowledge."
      }
    ]
  },

  society: {
    prompt: "Within Society, there are different corners. Which feels most like where your energy lives?",
    options: [
      {
        id: "governance",
        text: "Governance and decision-making — how collective decisions get made, who has power, how it's held accountable."
      },
      {
        id: "justice",
        text: "Justice and equity systems — who's protected, who's vulnerable, law, rights, structural inequity."
      },
      {
        id: "education",
        text: "Education and learning — how knowledge gets transmitted, what gets taught and how."
      },
      {
        id: "community",
        text: "Community and culture — how people form functioning social units, local culture, what we celebrate."
      },
      {
        id: "conflict",
        text: "Conflict and repair — mediation, restorative practice, how we move through breakdown."
      }
    ]
  },

  nature: {
    prompt: "Within Nature, there are different corners. Which feels most like where your energy lives?",
    options: [
      {
        id: "soil_food",
        text: "Soil, food, and agriculture — farming, soil health, food systems, how we grow what we eat."
      },
      {
        id: "water",
        text: "Water and watersheds — rivers, rainfall, water access, watershed health."
      },
      {
        id: "biodiversity",
        text: "Biodiversity and ecosystems — habitats, conservation, rewilding, the web of life."
      },
      {
        id: "climate",
        text: "Climate and atmosphere — planetary systems that regulate temperature and weather."
      },
      {
        id: "relationship",
        text: "The human relationship with nature — how people connect with and position themselves within the living world."
      }
    ]
  },

  technology: {
    prompt: "Within Technology, there are different corners. Which feels most like where your energy lives?",
    options: [
      {
        id: "digital",
        text: "Digital infrastructure and software — platforms, systems that organize information and communication."
      },
      {
        id: "ai",
        text: "Artificial intelligence — how machine intelligence gets built, deployed, and governed."
      },
      {
        id: "physical_infra",
        text: "Physical infrastructure — energy grids, transport, water systems, the built environment."
      },
      {
        id: "biotech",
        text: "Biotechnology and life sciences — medicine, genetics, how we engineer living systems."
      },
      {
        id: "ethics",
        text: "Tool ethics and design — whether and how technology serves human and ecological life."
      }
    ]
  },

  finance: {
    prompt: "Within Finance & Economy, there are different corners. Which feels most like where your energy lives?",
    options: [
      {
        id: "capital",
        text: "Capital and investment — how money moves toward certain futures, impact investing, philanthropic capital."
      },
      {
        id: "distribution",
        text: "Wealth distribution and access — who has resources and why, inequality, economic justice."
      },
      {
        id: "alternative",
        text: "Alternative economic models — cooperatives, commons, local currencies, regenerative economics."
      },
      {
        id: "allocation",
        text: "Resource allocation systems — how systems decide what gets funded, budgets, grants, policy."
      }
    ]
  },

  legacy: {
    prompt: "Within Legacy, there are different corners. Which feels most like where your energy lives?",
    options: [
      {
        id: "preservation",
        text: "Cultural preservation — keeping knowledge, practices, languages alive."
      },
      {
        id: "transmission",
        text: "Knowledge transmission — how what's known gets passed on, teaching, documentation, oral tradition."
      },
      {
        id: "future_gen",
        text: "Future generations thinking — working for people not yet born, seven-generation thinking."
      },
      {
        id: "deep_time",
        text: "Deep time and long horizons — thinking in centuries, what outlives institutions."
      }
    ]
  },

  vision: {
    prompt: "Within Vision, there are different corners. Which feels most like where your energy lives?",
    options: [
      {
        id: "collective",
        text: "Collective visioning — helping groups see a shared future, what it takes to imagine together."
      },
      {
        id: "scenarios",
        text: "Scenario planning and futures thinking — mapping what's possible, strategic foresight."
      },
      {
        id: "coordination",
        text: "Coordination infrastructure — systems that allow diverse actors to align without agreeing on everything."
      },
      {
        id: "narrative",
        text: "Narrative and possibility — stories that make alternative futures feel real."
      }
    ]
  }
};

module.exports = {
  PHASE_1_QUESTIONS,
  TIEBREAKER_QUESTION,
  PHASE_2_QUESTIONS,
  SUBDOMAIN_MENUS
};
