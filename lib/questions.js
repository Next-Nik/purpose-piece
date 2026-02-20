// Purpose Piece — Question Bank v2.0
// Architecture: concrete, moment-based, behaviour-revealing
// Each question passes the 3-second test: answerable without "it depends"
//
// Archetype keys: steward | maker | connector | guardian | explorer | sage
// Domain keys: human_being | society | nature | technology | finance | legacy | vision
// Scale keys: local | bioregional | global | civilizational
//
// Scoring weights: 1 = weak signal, 2 = moderate signal, 3 = strong signal

const questions = [

  // ─────────────────────────────────────────────
  // PHASE 1: RAPID BEHAVIOURAL SNAPSHOT
  // Goal: concrete scenes, multiple choice A–E
  // All options equally valid — no "right" answer
  // ─────────────────────────────────────────────

  {
    id: "p1_q1",
    phase: 1,
    text: "Your hard drive is almost full. You have 20 minutes. What do you do first?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "Sort everything into folders — I want to understand what's actually there",
        scoring: { steward: 3, guardian: 1 },
        domain: "technology",
        scale: "local"
      },
      {
        id: "b",
        text: "Delete fast — clear the junk, keep what I'm actively using",
        scoring: { maker: 3, explorer: 1 },
        domain: "technology",
        scale: "local"
      },
      {
        id: "c",
        text: "Ask someone else what they do — there's probably a smarter way I don't know",
        scoring: { connector: 3, sage: 1 },
        domain: "technology",
        scale: "local"
      },
      {
        id: "d",
        text: "Back everything up first before touching anything",
        scoring: { guardian: 3, steward: 1 },
        domain: "technology",
        scale: "local"
      },
      {
        id: "e",
        // REVISED: "fix the constraint, not the contents" is a Maker move (solve the
        // root problem) with a secondary Steward signal (future-proofing). Explorer
        // scoring removed — explorers explore options, they don't immediately execute.
        text: "Move everything to the cloud and deal with the folder structure later — fix the constraint, not the contents",
        scoring: { maker: 3, steward: 1 },
        domain: "technology",
        scale: "local"
      }
    ]
  },

  {
    id: "p1_q2",
    phase: 1,
    text: "A neighbour knocks on your door. Their dog has been digging up your garden. What do you do?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "Talk to them directly — explain what's been damaged and what I need from them",
        scoring: { guardian: 3, steward: 1 },
        domain: "society",
        scale: "local"
      },
      {
        id: "b",
        text: "Fix the garden first, then figure out how to prevent it happening again",
        scoring: { maker: 3, steward: 1 },
        domain: "nature",
        scale: "local"
      },
      {
        id: "c",
        text: "Have the conversation but make sure we both walk away fine — I want a good relationship with them",
        scoring: { connector: 3, sage: 1 },
        domain: "society",
        scale: "local"
      },
      {
        id: "d",
        text: "Suggest a practical solution — shared fence, a different area for the dog",
        scoring: { steward: 2, maker: 2, guardian: 1 },
        domain: "nature",
        scale: "local"
      },
      {
        id: "e",
        text: "Use it as a chance to actually get to know them — we've never spoken",
        scoring: { connector: 2, explorer: 2 },
        domain: "human_being",
        scale: "local"
      }
    ]
  },

  {
    id: "p1_q3",
    phase: 1,
    text: "You find $200 you forgot you had. It's yours to spend however you want. What happens to it?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "It goes into savings or pays down something I owe",
        scoring: { steward: 3, guardian: 2 },
        domain: "finance",
        scale: "local"
      },
      {
        id: "b",
        text: "I buy something I've been needing for a project",
        scoring: { maker: 3 },
        domain: "technology",
        scale: "local"
      },
      {
        id: "c",
        text: "I use it for an experience — a meal, a trip, something with people I care about",
        scoring: { connector: 3, explorer: 1 },
        domain: "human_being",
        scale: "local"
      },
      {
        id: "d",
        // REVISED: removed virtue-signalling "donate" framing — high-performers picked it
        // because it sounded noble, not because it was true. Replaced with mundane split
        // that surfaces the same steward/guardian signal through actual behaviour.
        text: "I split it — part goes toward something practical I've been putting off, part toward something that matters to me",
        scoring: { steward: 1, guardian: 1 },
        domain: "legacy",
        scale: "local"
      },
      {
        id: "e",
        text: "I invest it in learning something new or a bet on something I believe in",
        scoring: { explorer: 3, sage: 2 },
        domain: "vision",
        scale: "global"
      }
    ]
  },

  {
    id: "p1_q4",
    phase: 1,
    text: "You're put in charge of a team for one week with no brief. What do you do on day one?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "Find out what each person is good at and what they actually care about",
        scoring: { connector: 3, steward: 1 },
        domain: "human_being",
        scale: "local"
      },
      {
        id: "b",
        text: "Map what's already in motion before touching anything",
        scoring: { steward: 3, guardian: 2 },
        domain: "society",
        scale: "local"
      },
      {
        id: "c",
        text: "Pick one thing that would make a visible difference and get it done",
        scoring: { maker: 3, explorer: 1 },
        domain: "society",
        scale: "local"
      },
      {
        id: "d",
        text: "Set clear expectations and make sure everyone knows what success looks like",
        scoring: { guardian: 3, steward: 1 },
        domain: "society",
        scale: "local"
      },
      {
        id: "e",
        text: "Ask what the team thinks the week *should* be for — let the purpose emerge",
        scoring: { sage: 3, connector: 1 },
        domain: "vision",
        scale: "bioregional"
      }
    ]
  },

  {
    id: "p1_q5",
    phase: 1,
    // REVISED: original question asked "where are you?" which surfaced introversion,
    // not archetype. An introverted Connector still connects — they just leave early.
    // New question asks what they actually did while there, not where they ended up.
    text: "You're at a party where you know almost no one. Think about what you actually did the last time you were in that situation. What's most accurate?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "I found one person and had a real conversation — the rest of the room didn't really matter",
        scoring: { connector: 3, sage: 1 },
        domain: "human_being",
        scale: "local"
      },
      {
        id: "b",
        text: "I helped with something — the food, the music, whatever needed doing",
        scoring: { steward: 3, maker: 1 },
        domain: "society",
        scale: "local"
      },
      {
        id: "c",
        text: "I moved around — I wanted a read on who was there and what was happening",
        scoring: { explorer: 3, connector: 1 },
        domain: "society",
        scale: "bioregional"
      },
      {
        id: "d",
        text: "I mostly observed — I was taking it all in before deciding how to engage",
        scoring: { sage: 3, guardian: 1 },
        domain: "human_being",
        scale: "local"
      },
      {
        id: "e",
        text: "I stayed close to the person I came with and let conversations find me",
        scoring: { guardian: 2, steward: 1 },
        domain: "human_being",
        scale: "local"
      }
    ]
  },

  // Additional Phase 1 questions (triggered if confidence < 55% after Q5)

  {
    id: "p1_q6",
    phase: 1,
    supplemental: true,
    triggerCondition: "confidence < 55 after Q5",
    text: "A project you've been part of finishes. What do you do the next day?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "Document what worked and what didn't while it's fresh",
        scoring: { steward: 3, sage: 1 },
        domain: "legacy",
        scale: "local"
      },
      {
        id: "b",
        text: "Start thinking about the next one — I'm already restless",
        scoring: { maker: 3, explorer: 2 },
        domain: "vision",
        scale: "local"
      },
      {
        id: "c",
        text: "Reach out to the people I worked with — check in, celebrate a bit",
        scoring: { connector: 3 },
        domain: "human_being",
        scale: "local"
      },
      {
        id: "d",
        text: "Rest and decompress — I gave a lot and I need to recover",
        scoring: { guardian: 2, steward: 1 },
        domain: "human_being",
        scale: "local"
      },
      {
        id: "e",
        text: "Reflect on what it meant — what actually mattered about doing it",
        scoring: { sage: 3, guardian: 1 },
        domain: "legacy",
        scale: "bioregional"
      }
    ]
  },

  {
    id: "p1_q7",
    phase: 1,
    supplemental: true,
    triggerCondition: "confidence < 55 after Q6",
    text: "You walk into a room and notice it's set up badly for what needs to happen. What do you do?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "Rearrange it before anyone arrives",
        scoring: { maker: 3, steward: 1 },
        domain: "technology",
        scale: "local"
      },
      {
        id: "b",
        text: "Point it out to whoever's in charge and let them decide",
        scoring: { guardian: 2, connector: 1 },
        domain: "society",
        scale: "local"
      },
      {
        id: "c",
        text: "Ask a few people what they think would work better",
        scoring: { connector: 3, sage: 1 },
        domain: "society",
        scale: "local"
      },
      {
        id: "d",
        text: "Notice it, decide it's not my place, and adapt to what's there",
        scoring: { guardian: 2, steward: 1 },
        domain: "human_being",
        scale: "local"
      },
      {
        id: "e",
        text: "Rearrange it and explain why if anyone asks",
        scoring: { maker: 2, guardian: 2, explorer: 1 },
        domain: "society",
        scale: "local"
      }
    ]
  },

  // ─────────────────────────────────────────────
  // PHASE 2: ADAPTIVE REFINEMENT
  // Dynamically selected based on Phase 1 output
  // Differentiators, domain clarifiers, scale clarifiers
  // ─────────────────────────────────────────────

  // --- ARCHETYPE DIFFERENTIATORS ---

  {
    id: "p2_diff_steward_guardian",
    phase: 2,
    type: "differentiator",
    targetArchetypes: ["steward", "guardian"],
    triggerCondition: "steward and guardian within 15% of each other",
    text: "You're responsible for something that's been running smoothly for years. Someone suggests changing it. What's your instinct?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "Understand what they're trying to solve first — maybe the change is right",
        scoring: { steward: 3 },
        domain: "society"
      },
      {
        id: "b",
        text: "Be cautious — if it's working, the burden of proof is on the change",
        scoring: { guardian: 3 },
        domain: "legacy"
      },
      {
        id: "c",
        text: "Map the full picture — what would change, what stays, what's the risk",
        scoring: { steward: 2, guardian: 1 },
        domain: "society"
      },
      {
        id: "d",
        text: "Support the change if the person proposing it has earned my trust",
        scoring: { connector: 2, guardian: 1 },
        domain: "human_being"
      }
    ]
  },

  {
    id: "p2_diff_maker_explorer",
    phase: 2,
    type: "differentiator",
    targetArchetypes: ["maker", "explorer"],
    triggerCondition: "maker and explorer within 15% of each other",
    text: "You have a free afternoon and no obligations. A new tool you've never used is sitting in front of you. What happens?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "I pick a specific thing I've been wanting to make and use it to make that",
        scoring: { maker: 3 },
        domain: "technology"
      },
      {
        id: "b",
        text: "I just start playing — I want to know what it can do before I decide what to do with it",
        scoring: { explorer: 3 },
        domain: "technology"
      },
      {
        id: "c",
        text: "I look up a tutorial — I want to learn it properly",
        scoring: { sage: 2, maker: 1 },
        domain: "technology"
      },
      {
        id: "d",
        text: "I think about who else might want to use this and what they'd need",
        scoring: { connector: 2, maker: 1 },
        domain: "human_being"
      }
    ]
  },

  {
    id: "p2_diff_connector_sage",
    phase: 2,
    type: "differentiator",
    targetArchetypes: ["connector", "sage"],
    triggerCondition: "connector and sage within 15% of each other",
    text: "Someone you care about is going through something hard. You have an hour with them. What do you actually do?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "Mostly listen — I ask questions and let them work through it",
        scoring: { connector: 3 },
        domain: "human_being"
      },
      {
        id: "b",
        text: "Share what I actually think, even if it's hard to hear — I'd want that from them",
        scoring: { sage: 3, guardian: 1 },
        domain: "human_being"
      },
      {
        id: "c",
        text: "Help them see the situation differently — reframe, not just comfort",
        scoring: { sage: 2, connector: 1 },
        domain: "human_being"
      },
      {
        id: "d",
        text: "Do something with them — the being together matters more than the talking",
        scoring: { connector: 2, steward: 1 },
        domain: "human_being"
      }
    ]
  },

  {
    id: "p2_diff_steward_maker",
    phase: 2,
    type: "differentiator",
    targetArchetypes: ["steward", "maker"],
    triggerCondition: "steward and maker within 15% of each other",
    text: "A community garden near you is neglected. You want to help. What do you actually do?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "Show up and start working — the garden doesn't need a meeting, it needs hands",
        scoring: { maker: 3 },
        domain: "nature",
        scale: "local"
      },
      {
        id: "b",
        text: "Find out who's responsible and what the plan is before doing anything",
        scoring: { steward: 3 },
        domain: "nature",
        scale: "local"
      },
      {
        id: "c",
        text: "Organise a group — it'll go faster and it'll stick better if more people care about it",
        scoring: { connector: 2, steward: 1 },
        domain: "society",
        scale: "local"
      },
      {
        id: "d",
        text: "Research what would actually work best for this soil, climate, community",
        scoring: { sage: 2, steward: 1 },
        domain: "nature",
        scale: "bioregional"
      }
    ]
  },

  {
    id: "p2_diff_explorer_sage",
    phase: 2,
    type: "differentiator",
    targetArchetypes: ["explorer", "sage"],
    triggerCondition: "explorer and sage within 15% of each other",
    text: "You've been following a developing situation in your field for months. Something unexpected just happened. What do you do?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "Go deeper into the data — I want to understand what actually happened",
        scoring: { sage: 3 },
        domain: "vision"
      },
      {
        id: "b",
        text: "Start moving — this is an opening and I want to be early",
        scoring: { explorer: 3 },
        domain: "vision"
      },
      {
        id: "c",
        text: "Talk to people who have different takes — I want to triangulate",
        scoring: { sage: 2, connector: 1 },
        domain: "society"
      },
      {
        id: "d",
        text: "Write or map it out — I process by articulating",
        scoring: { sage: 2, maker: 1 },
        domain: "legacy"
      }
    ]
  },

  // --- DOMAIN CLARIFIERS ---

  {
    id: "p2_domain_nature",
    phase: 2,
    type: "domain_clarifier",
    targetDomain: "nature",
    triggerCondition: "nature signal present but not dominant",
    text: "You're planning a holiday. There's a week at a cabin with no internet or a week in a city you've never been to. What pulls you?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "The cabin — I need the quiet and the disconnection",
        scoring: {},
        domain: "nature",
        scale: "local",
        domainConfirm: "nature"
      },
      {
        id: "b",
        text: "The city — I want the stimulation and the people",
        scoring: {},
        domain: "society",
        scale: "local",
        domainConfirm: "society"
      },
      {
        id: "c",
        text: "Neither appeals that much — I'd want a mix",
        scoring: { sage: 1 },
        domain: null
      },
      {
        id: "d",
        text: "The cabin, but I'd bring work — solitude and productivity, not just rest",
        scoring: { maker: 1 },
        domain: "nature",
        scale: "local",
        domainConfirm: "nature"
      }
    ]
  },

  {
    id: "p2_domain_finance",
    phase: 2,
    type: "domain_clarifier",
    targetDomain: "finance",
    triggerCondition: "finance signal present but not dominant",
    text: "Someone asks you to help them think through a financial decision. What do you actually focus on?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "The numbers and risk — I want to see the actual math",
        scoring: { guardian: 2, sage: 1 },
        domain: "finance",
        domainConfirm: "finance"
      },
      {
        id: "b",
        text: "Their values — what does the money actually need to do for their life?",
        scoring: { steward: 2, connector: 1 },
        domain: "human_being",
        domainConfirm: "human_being"
      },
      {
        id: "c",
        text: "The long game — what does this decision look like in 10 years?",
        scoring: { sage: 2, explorer: 1 },
        domain: "legacy",
        domainConfirm: "legacy"
      },
      {
        id: "d",
        text: "The system — how does this fit into their whole financial picture?",
        scoring: { steward: 2, guardian: 1 },
        domain: "finance",
        domainConfirm: "finance"
      }
    ]
  },

  {
    id: "p2_domain_legacy",
    phase: 2,
    type: "domain_clarifier",
    targetDomain: "legacy",
    triggerCondition: "legacy signal present but not dominant",
    text: "You've done something you're proud of. It's finished. What matters most to you now?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "That it lasts — it contributes to something beyond this moment",
        scoring: { steward: 2, guardian: 1 },
        domain: "legacy",
        domainConfirm: "legacy"
      },
      {
        id: "b",
        text: "That the people involved felt it — the experience mattered",
        scoring: { connector: 2 },
        domain: "human_being",
        domainConfirm: "human_being"
      },
      {
        id: "c",
        text: "That it was done well — the quality is what I'll remember",
        scoring: { maker: 2, guardian: 1 },
        domain: "legacy",
        domainConfirm: "legacy"
      },
      {
        id: "d",
        text: "What it taught me — what I'll carry forward from it",
        scoring: { sage: 2, explorer: 1 },
        domain: "vision",
        domainConfirm: "vision"
      }
    ]
  },

  // --- SCALE CLARIFIERS ---

  {
    id: "p2_scale_clarifier",
    phase: 2,
    type: "scale_clarifier",
    triggerCondition: "scale signal ambiguous after Phase 1",
    text: "A problem you care about is getting worse. What's the level at which you instinctively want to address it?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "My household, block, or immediate community — I can actually affect that",
        scoring: {},
        scale: "local",
        scaleConfirm: "local"
      },
      {
        id: "b",
        text: "My city, region, or watershed — big enough to matter, small enough to move",
        scoring: {},
        scale: "bioregional",
        scaleConfirm: "bioregional"
      },
      {
        id: "c",
        text: "National or international — the solution has to work at that level",
        scoring: {},
        scale: "global",
        scaleConfirm: "global"
      },
      {
        id: "d",
        text: "The whole system — if the root cause isn't addressed, nothing else holds",
        scoring: { sage: 1, explorer: 1 },
        scale: "civilizational",
        scaleConfirm: "civilizational"
      }
    ]
  },

  // --- PHASE 2 FREE TEXT ---
  // Used when differentiator questions don't fully resolve ambiguity

  {
    id: "p2_freetext_behaviour",
    phase: 2,
    type: "free_text_behaviour",
    triggerCondition: "archetype confidence < 70% after differentiator questions",
    text: "Think of a time in the last few months when you were genuinely absorbed in something — work, personal, anything. Describe what you were doing in one or two sentences.",
    inputType: "free_text",
    maxLength: 200,
    scoringMethod: "semantic_keyword",
    scoringNotes: "See scoring.js semanticKeywords map. Flag abstract answers for Sage signal. Flag relational content for Connector. Flag physical/made things for Maker. Flag systemic/procedural for Steward/Guardian. Flag novel/frontier for Explorer.",
    followups: [
      {
        triggerCondition: "response is abstract or conceptual",
        text: "Can you make it more concrete? What were you actually doing — physically or practically?"
      }
    ]
  },

  // ─────────────────────────────────────────────
  // PHASE 3: VALIDATION
  // Not question objects — these are prompt templates
  // ─────────────────────────────────────────────

  {
    id: "p3_summary_prompt",
    phase: 3,
    type: "validation_summary",
    // REVISED: "Does this feel accurate — yes/no?" invites binary and biases toward yes.
    // New framing primes calibration: user naturally looks for what fits AND what doesn't,
    // giving the correction loop better signal to work with.
    template: "Based on what you've shared, here's what I'm seeing:\n\n{summary}\n\nWhat part feels most accurate — and what part doesn't quite fit?",
    inputType: "single_select",
    options: ["It all fits", "Most of it fits — one part is off", "It's partly right", "This doesn't feel like me"]
  },

  {
    id: "p3_correction_partly",
    phase: 3,
    type: "correction",
    triggerCondition: "user selects 'Partly'",
    text: "What part doesn't feel right — the type of role you play, the area of life it's about, or the scale it's pointing toward?",
    inputType: "single_select",
    options: [
      "The role / how I show up",
      "The area of life (nature, technology, people, etc.)",
      "The scale (local vs. global etc.)",
      "All of it feels a bit off"
    ],
    followupAction: "re_score_targeted"
  },

  {
    id: "p3_correction_no",
    phase: 3,
    type: "correction",
    triggerCondition: "user selects 'No'",
    text: "That's helpful. In your own words: when do you feel most like yourself and most useful? Don't overthink it — a sentence or two.",
    inputType: "free_text",
    maxLength: 250,
    followupAction: "re_target_phase2"
  }

];

// ─────────────────────────────────────────────
// QUESTION SELECTION LOGIC (helper reference)
// Full implementation in scoring.js
// ─────────────────────────────────────────────

const phase2SelectionRules = [
  {
    condition: "top two archetypes within 15%",
    action: "select differentiator for that archetype pair",
    priority: 1
  },
  {
    condition: "domain signal ambiguous (no domain > 40% of signals)",
    action: "select domain_clarifier for most-signalled domain",
    priority: 2
  },
  {
    condition: "scale signal missing entirely",
    action: "select scale_clarifier",
    priority: 3
  },
  {
    condition: "archetype confidence < 70% after differentiator",
    action: "add free_text_behaviour question",
    priority: 4
  }
];

module.exports = { questions, phase2SelectionRules };
