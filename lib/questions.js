// Purpose Piece — Question Bank v3.0
// Nik-Core Standard
//
// One filter applied to every question, every option, every prompt:
//   Stakes make sense on their own terms.
//
// What that means in practice:
//   - No arbitrary constraints
//   - No vague context
//   - No right-sounding answers
//   - "Why?" always has an answer inside the scenario itself
//   - The moment is real. The choice is real.
//   - Pressure, where it exists, is earned by the situation.
//
// What each phase actually reveals:
//   Phase 1 -> Archetype signal (reliable). Domain/scale tags are weak here — scenario-imposed.
//   Phase 2 -> Domain (reliable) + Scale (reliable) + Archetype refinement where needed.
//   Phase 3 -> Validation only. No new scoring.
//
// Archetype keys: steward | maker | connector | guardian | explorer | sage
// Domain keys:    human_being | society | nature | technology | finance | legacy | vision
// Scale keys:     local | bioregional | global | civilizational
// Scoring:        1 = weak, 2 = moderate, 3 = strong

const questions = [

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 1: RAPID BEHAVIOURAL SNAPSHOT
  // 5 core questions. Up to 2 supplemental if confidence < 55% after Q5.
  // Goal: archetype signal only.
  // Every scenario is a real moment a real person has actually lived.
  // No option sounds better than any other.
  // ──────────────────────────────────────────────────────────────────────────

  {
    id: "p1_q1",
    phase: 1,
    // Stakes: a full drive actually stops you from working. No timer needed.
    // "First" does all the compression — asks for reflex, not plan.
    text: "Your hard drive is almost full. What do you do first?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "Sort everything into folders — I want to understand what's actually there",
        scoring: { sage: 3, steward: 1 },
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
        text: "Back everything up before touching anything",
        scoring: { guardian: 3, steward: 1 },
        domain: "technology",
        scale: "local"
      },
      {
        id: "e",
        text: "Move everything to the cloud — fix the constraint, not the contents",
        scoring: { maker: 3, steward: 1 },
        domain: "technology",
        scale: "local"
      }
    ]
  },

  {
    id: "p1_q2",
    phase: 1,
    // Stakes: real damage, neighbour at the door, relationship in play.
    // The situation contains all the pressure it needs.
    text: "Your neighbour knocks on your door. Their dog has been digging up your garden. What do you do?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "Tell them directly what's been damaged and what I need from them",
        scoring: { guardian: 3, steward: 1 },
        domain: "society",
        scale: "local"
      },
      {
        id: "b",
        text: "Fix the garden first — then figure out how to stop it happening again",
        scoring: { maker: 3, steward: 1 },
        domain: "nature",
        scale: "local"
      },
      {
        id: "c",
        text: "Have the conversation carefully — I want us both to walk away fine",
        scoring: { connector: 3, sage: 1 },
        domain: "society",
        scale: "local"
      },
      {
        id: "d",
        text: "Suggest a practical fix — a shared fence, a different area for the dog",
        scoring: { steward: 2, maker: 2, guardian: 1 },
        domain: "nature",
        scale: "local"
      },
      {
        id: "e",
        text: "Use it as a chance to actually get to know them — we've barely spoken",
        scoring: { connector: 2, explorer: 2 },
        domain: "human_being",
        scale: "local"
      }
    ]
  },

  {
    id: "p1_q3",
    phase: 1,
    // Stakes: zero pressure, pure preference. No consequence either way.
    // Complete freedom is what reveals the underlying drive most clearly.
    text: "You find $200 you forgot you had. It's yours. What happens to it?",
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
        text: "I split it — part toward something practical I've been putting off, part toward something that matters",
        scoring: { steward: 1, guardian: 1 },
        domain: "legacy",
        scale: "local"
      },
      {
        id: "e",
        text: "I put it toward learning something new or a bet on something I believe in",
        scoring: { explorer: 3, sage: 2 },
        domain: "vision",
        scale: "global"
      }
    ]
  },

  {
    id: "p1_q4",
    phase: 1,
    // Stakes: someone stepped away unexpectedly — real situation.
    // Their team is waiting — real consequence. The absence is the constraint.
    // It makes complete sense. No brief needed because the person left suddenly.
    text: "You're covering for someone who had to step away unexpectedly. Their team needs direction for the week. What do you do on day one?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "Find out what each person is working on and what they actually need",
        scoring: { connector: 3, steward: 1 },
        domain: "human_being",
        scale: "local"
      },
      {
        id: "b",
        text: "Map what's already in motion before I change anything",
        scoring: { steward: 3, guardian: 2 },
        domain: "society",
        scale: "local"
      },
      {
        id: "c",
        text: "Identify one thing that would make a visible difference and get it done",
        scoring: { maker: 3, explorer: 1 },
        domain: "society",
        scale: "local"
      },
      {
        id: "d",
        text: "Set clear expectations so everyone knows what the week is for",
        scoring: { guardian: 3, steward: 1 },
        domain: "society",
        scale: "local"
      },
      {
        id: "e",
        text: "Ask the team what they think this week should actually be for",
        scoring: { sage: 3, connector: 1 },
        domain: "vision",
        scale: "local"
      }
    ]
  },

  {
    id: "p1_q5",
    phase: 1,
    // Stakes: real social unfamiliarity. "Think about the last time" anchors
    // it in lived experience, not performance. Asks what they actually did.
    text: "You're at a gathering where you know almost no one. Think about what you actually did the last time you were in that situation. What's most accurate?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "I found one person and had a real conversation — the rest of the room didn't matter",
        scoring: { connector: 3, sage: 1 },
        domain: "human_being",
        scale: "local"
      },
      {
        id: "b",
        text: "I helped with something — the food, the setup, whatever needed doing",
        scoring: { steward: 3, maker: 1 },
        domain: "society",
        scale: "local"
      },
      {
        id: "c",
        text: "I moved around — I wanted a read on who was there and what was happening",
        scoring: { explorer: 3, connector: 1 },
        domain: "society",
        scale: "local"
      },
      {
        id: "d",
        text: "I mostly observed — taking it all in before deciding how to engage",
        scoring: { sage: 3, guardian: 1 },
        domain: "human_being",
        scale: "local"
      },
      {
        id: "e",
        text: "I stayed close to who I came with and let conversations come to me",
        scoring: { guardian: 2, steward: 1 },
        domain: "human_being",
        scale: "local"
      }
    ]
  },

  // ── SUPPLEMENTAL PHASE 1 ──────────────────────────────────────────────────

  {
    id: "p1_q6",
    phase: 1,
    supplemental: true,
    triggerCondition: "confidence < 55 after Q5",
    // Stakes: project completion is a real transition. The open day after
    // is real. What someone reaches for in that space is honest signal.
    text: "A project you've been part of finishes. What do you do the next day?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "Write down what worked and what didn't while it's still fresh",
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
        text: "Reach out to the people I worked with — check in, mark the moment",
        scoring: { connector: 3 },
        domain: "human_being",
        scale: "local"
      },
      {
        id: "d",
        text: "Rest — I gave a lot and I need to recover before thinking about what's next",
        scoring: { guardian: 2, steward: 1 },
        domain: "human_being",
        scale: "local"
      },
      {
        id: "e",
        text: "Sit with it — I want to understand what doing it actually meant",
        scoring: { sage: 3, guardian: 1 },
        domain: "legacy",
        scale: "local"
      }
    ]
  },

  {
    id: "p1_q7",
    phase: 1,
    supplemental: true,
    triggerCondition: "confidence < 55 after Q6",
    // Stakes: not your meeting, something real is about to happen in that room,
    // window to act before people arrive. "Not running it" is the real stake —
    // acting requires a deliberate choice about what's yours to do.
    text: "You arrive early to a meeting and the room is set up wrong — chairs facing away from the screen, nowhere to write. You're not running it. What do you do?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "Rearrange it — it needs doing and I'm here",
        scoring: { maker: 3, steward: 1 },
        domain: "society",
        scale: "local"
      },
      {
        id: "b",
        text: "Flag it to whoever is running it and let them decide",
        scoring: { guardian: 2, connector: 1 },
        domain: "society",
        scale: "local"
      },
      {
        id: "c",
        text: "Ask a couple of people arriving what they think — maybe it's intentional",
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
        text: "Rearrange it and be ready to explain why if anyone asks",
        scoring: { maker: 2, guardian: 2 },
        domain: "society",
        scale: "local"
      }
    ]
  },


  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 2: ADAPTIVE REFINEMENT
  // Goal: confirm archetype, surface domain, confirm scale.
  // Dynamically selected. Same standard throughout.
  // ──────────────────────────────────────────────────────────────────────────

  // ── ARCHETYPE DIFFERENTIATORS ─────────────────────────────────────────────

  {
    id: "p2_diff_steward_guardian",
    phase: 2,
    type: "differentiator",
    targetArchetypes: ["steward", "guardian"],
    triggerCondition: "steward and guardian within 15% of each other",
    // Stakes: real accountability, real proposal to change something working.
    // Steward asks what problem it solves. Guardian asks what it risks losing.
    // Both are valid — the question is which instinct fires first.
    text: "Something you've been responsible for has been running well for years. Someone on the team proposes changing it. What's your instinct?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "Understand what problem they're trying to solve — the change might be right",
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
        text: "Map the full picture — what changes, what stays, what's the risk either way",
        scoring: { steward: 2, guardian: 1 },
        domain: "society"
      },
      {
        id: "d",
        text: "Support it if the person proposing it has a track record I trust",
        scoring: { connector: 2, steward: 1 },
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
    // Stakes: real free time, real unfamiliar tool, no obligation.
    // Maker goes toward a specific output. Explorer goes into the territory first.
    text: "You have a free afternoon and a tool you've never used sitting in front of you. What happens?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "I pick something specific I've been wanting to make and use it for that",
        scoring: { maker: 3 },
        domain: "technology"
      },
      {
        id: "b",
        text: "I just start playing — I want to know what it can do before I decide",
        scoring: { explorer: 3 },
        domain: "technology"
      },
      {
        id: "c",
        text: "I find a good tutorial and learn it properly before building anything",
        scoring: { sage: 2, steward: 1 },
        domain: "technology"
      },
      {
        id: "d",
        text: "I think about who else might want this and what they'd need from it",
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
    // Stakes: someone you care about, real difficulty, a real hour.
    // Connector: presence and listening. Sage: perspective and truth.
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
        text: "Tell them what I actually think, even if it's uncomfortable — I'd want that from them",
        scoring: { sage: 3, guardian: 1 },
        domain: "human_being"
      },
      {
        id: "c",
        text: "Help them see it differently — reframe the situation, not just sit in it",
        scoring: { sage: 2, connector: 1 },
        domain: "human_being"
      },
      {
        id: "d",
        text: "Do something with them — being together matters more than talking about it",
        scoring: { connector: 2, steward: 1 },
        domain: "human_being"
      }
    ]
  },

  {
    id: "p2_diff_connector_explorer",
    phase: 2,
    type: "differentiator",
    targetArchetypes: ["connector", "explorer"],
    triggerCondition: "connector and explorer within 15% of each other",
    // Stakes: a week has passed. Real time elapsed, real inaction or action.
    // "Most likely true" asks for honest pattern, not aspiration.
    // Connector: oriented toward the person. Explorer: oriented toward the idea.
    text: "You meet someone genuinely interesting at an event. A week later — what's most likely true?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "I've followed up — I wanted to keep the connection going",
        scoring: { connector: 3 },
        domain: "human_being"
      },
      {
        id: "b",
        text: "I've been thinking about what they said — the idea was the interesting part",
        scoring: { explorer: 3, sage: 1 },
        domain: "vision"
      },
      {
        id: "c",
        text: "I introduced them to someone else who needed to know them",
        scoring: { connector: 3, steward: 1 },
        domain: "society"
      },
      {
        id: "d",
        text: "I went and looked into the thing they mentioned — it opened a rabbit hole",
        scoring: { explorer: 3 },
        domain: "vision"
      }
    ]
  },

  {
    id: "p2_diff_steward_maker",
    phase: 2,
    type: "differentiator",
    targetArchetypes: ["steward", "maker"],
    triggerCondition: "steward and maker within 15% of each other",
    // Stakes: real neglected thing, real desire to help. No artificial urgency.
    // Steward: finds structure first. Maker: shows up and works.
    text: "A community garden near you has been neglected for months. You want to help. What do you actually do?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "Show up and start working — the garden needs hands, not a meeting",
        scoring: { maker: 3 },
        domain: "nature",
        scale: "local"
      },
      {
        id: "b",
        text: "Find out who's responsible and what's already been planned before doing anything",
        scoring: { steward: 3 },
        domain: "nature",
        scale: "local"
      },
      {
        id: "c",
        text: "Organise a group — it'll stick better if more people care about it",
        scoring: { connector: 2, steward: 1 },
        domain: "society",
        scale: "local"
      },
      {
        id: "d",
        text: "Research what would actually work for this soil, climate, and community first",
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
    // Stakes: months of attention, something real just shifted, window to act.
    // Explorer: moves. Sage: understands first.
    text: "You've been following a situation in your field for months. Something unexpected just happened — it changes things. What do you do?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "Go deeper into what happened — I want to understand it before I move",
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
        text: "Talk to people with different takes — I want to triangulate before deciding",
        scoring: { sage: 2, connector: 1 },
        domain: "society"
      },
      {
        id: "d",
        text: "Write it out or map it — I process by articulating",
        scoring: { sage: 2, maker: 1 },
        domain: "legacy"
      }
    ]
  },

  {
    id: "p2_diff_guardian_sage",
    phase: 2,
    type: "differentiator",
    targetArchetypes: ["guardian", "sage"],
    triggerCondition: "guardian and sage within 15% of each other",
    // Stakes: real decision, real incomplete information — how most decisions actually happen.
    // Guardian: protects against downside. Sage: understands before committing.
    text: "You're asked to make a significant decision and you don't have all the information you'd want. What do you do?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "Delay until I have enough to decide responsibly — a bad decision now costs more than waiting",
        scoring: { guardian: 3 },
        domain: "society"
      },
      {
        id: "b",
        text: "Identify the most important unknown and go get that answer first",
        scoring: { sage: 3 },
        domain: "vision"
      },
      {
        id: "c",
        text: "Decide with what I have and build in a review point — I can adjust",
        scoring: { maker: 2, explorer: 1 },
        domain: "society"
      },
      {
        id: "d",
        text: "Ask who has made this kind of decision before and what they learned",
        scoring: { connector: 2, sage: 1 },
        domain: "human_being"
      }
    ]
  },


  // ── DOMAIN CLARIFIERS ─────────────────────────────────────────────────────

  {
    id: "p2_domain_human_being",
    phase: 2,
    type: "domain_clarifier",
    targetDomain: "human_being",
    triggerCondition: "human_being signal present but not dominant",
    // Stakes: someone close, real turning point, real invitation.
    // How you show up reveals whether you're oriented toward inner life or outcome.
    text: "Someone close to you is at a turning point — considering a significant change. They ask what you think. What do you actually say?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "I ask questions until they can hear what they actually want",
        scoring: { connector: 3, sage: 1 },
        domain: "human_being",
        domainConfirm: "human_being"
      },
      {
        id: "b",
        text: "I tell them what I genuinely see — not what they want to hear",
        scoring: { sage: 3, guardian: 1 },
        domain: "human_being",
        domainConfirm: "human_being"
      },
      {
        id: "c",
        text: "I help them think through what would actually change — practical implications first",
        scoring: { steward: 2, guardian: 1 },
        domain: "human_being",
        domainConfirm: "human_being"
      },
      {
        id: "d",
        text: "I support whatever they decide — it's their life to direct, not mine",
        scoring: { connector: 2 },
        domain: "human_being",
        domainConfirm: "human_being"
      }
    ]
  },

  {
    id: "p2_domain_society",
    phase: 2,
    type: "domain_clarifier",
    targetDomain: "society",
    triggerCondition: "society signal present but not dominant",
    // Stakes: real conflict, real people affected. "Not directly affected"
    // removes self-interest so the response reveals genuine orientation.
    text: "Two groups in your community are in conflict — over a development project, a shared resource, a policy. You're not directly affected. What do you do?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "Try to understand both sides properly before forming a view",
        scoring: { sage: 2, connector: 1 },
        domain: "society",
        domainConfirm: "society"
      },
      {
        id: "b",
        text: "See if I can bring the right people together — this gets resolved through conversation",
        scoring: { connector: 3 },
        domain: "society",
        domainConfirm: "society"
      },
      {
        id: "c",
        text: "Get involved if one side is clearly being treated unfairly",
        scoring: { guardian: 3 },
        domain: "society",
        domainConfirm: "society"
      },
      {
        id: "d",
        text: "Watch and learn — community conflicts reveal how a place actually works",
        scoring: { sage: 2, explorer: 1 },
        domain: "society",
        domainConfirm: "society"
      }
    ]
  },

  {
    id: "p2_domain_nature",
    phase: 2,
    type: "domain_clarifier",
    targetDomain: "nature",
    triggerCondition: "nature signal present but not dominant",
    // Stakes: a real choice between two genuinely different options.
    // The pull reveals orientation — no deliberation needed or wanted.
    text: "You have a week off with no obligations. A cabin with no internet or a city you've never been to. What pulls you?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "The cabin — I need the quiet and the space to think",
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
        text: "Neither on its own — I'd want somewhere that gives me both",
        scoring: { sage: 1 },
        domain: null
      },
      {
        id: "d",
        text: "The cabin, but I'd bring work — solitude and focus, not just rest",
        scoring: { maker: 1 },
        domain: "nature",
        scale: "local",
        domainConfirm: "nature"
      }
    ]
  },

  {
    id: "p2_domain_technology",
    phase: 2,
    type: "domain_clarifier",
    targetDomain: "technology",
    triggerCondition: "technology signal present but not dominant",
    // Stakes: real system, real people depending on it, real access to fix it.
    // Where you start reveals whether you're oriented toward the system or the humans.
    text: "A system a lot of people depend on is slow and frustrating. You have the access and time to improve it. Where do you start?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "Understand how it actually works before touching anything",
        scoring: { sage: 2, steward: 1 },
        domain: "technology",
        domainConfirm: "technology"
      },
      {
        id: "b",
        text: "Talk to the people using it — find out what's actually painful for them",
        scoring: { connector: 2, steward: 1 },
        domain: "human_being",
        domainConfirm: "human_being"
      },
      {
        id: "c",
        text: "Find the bottleneck and fix it — the problem is usually one thing",
        scoring: { maker: 3 },
        domain: "technology",
        domainConfirm: "technology"
      },
      {
        id: "d",
        text: "Look at what better systems do and adapt that here",
        scoring: { explorer: 2, maker: 1 },
        domain: "technology",
        domainConfirm: "technology"
      }
    ]
  },

  {
    id: "p2_domain_finance",
    phase: 2,
    type: "domain_clarifier",
    targetDomain: "finance",
    triggerCondition: "finance signal present but not dominant",
    // Stakes: someone asked, you have to respond. What you focus on
    // reveals domain orientation. All options are genuinely useful.
    text: "A friend asks for your help thinking through a financial decision. What do you actually focus on?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "The numbers and the risk — show me the actual math",
        scoring: { guardian: 2, sage: 1 },
        domain: "finance",
        domainConfirm: "finance"
      },
      {
        id: "b",
        text: "Their values — what does this money actually need to do for their life?",
        scoring: { steward: 2, connector: 1 },
        domain: "human_being",
        domainConfirm: "human_being"
      },
      {
        id: "c",
        text: "The long game — what does this decision look like in ten years?",
        scoring: { sage: 2, explorer: 1 },
        domain: "legacy",
        domainConfirm: "legacy"
      },
      {
        id: "d",
        text: "The whole picture — how does this fit into everything else going on?",
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
    // Stakes: real effort, real completion, real emotional moment.
    // What matters most when it's done is what someone actually values.
    text: "Something you put real effort into is finished. It went well. What matters most to you now that it's done?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "That it lasts — that it contributes to something beyond this moment",
        scoring: { steward: 2, guardian: 1 },
        domain: "legacy",
        domainConfirm: "legacy"
      },
      {
        id: "b",
        text: "That the people involved felt it — the experience mattered to them",
        scoring: { connector: 2 },
        domain: "human_being",
        domainConfirm: "human_being"
      },
      {
        id: "c",
        text: "That it was done well — the quality is what I'll carry forward",
        scoring: { maker: 2, guardian: 1 },
        domain: "legacy",
        domainConfirm: "legacy"
      },
      {
        id: "d",
        text: "What it taught me — what I'll understand differently because of doing it",
        scoring: { sage: 2, explorer: 1 },
        domain: "vision",
        domainConfirm: "vision"
      }
    ]
  },

  {
    id: "p2_domain_vision",
    phase: 2,
    type: "domain_clarifier",
    targetDomain: "vision",
    triggerCondition: "vision signal present but not dominant",
    // Stakes: no obligation, no one asking anything — pure preference.
    // What someone reaches for when nothing is required is as honest as it gets.
    text: "You have an unstructured day and no one needs anything from you. What do you find yourself doing by mid-afternoon?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "Reading or going deep on something I've been curious about",
        scoring: { sage: 3, explorer: 1 },
        domain: "vision",
        domainConfirm: "vision"
      },
      {
        id: "b",
        text: "Working on something I've been wanting to build or make",
        scoring: { maker: 3 },
        domain: "vision",
        domainConfirm: "vision"
      },
      {
        id: "c",
        text: "Reaching out to people — I end up in conversations",
        scoring: { connector: 3 },
        domain: "human_being",
        domainConfirm: "human_being"
      },
      {
        id: "d",
        text: "Catching up on things that have been sitting — I feel better when things are in order",
        scoring: { steward: 3, guardian: 1 },
        domain: "legacy",
        domainConfirm: "legacy"
      }
    ]
  },


  // ── SCALE CLARIFIER ───────────────────────────────────────────────────────

  {
    id: "p2_scale_clarifier",
    phase: 2,
    type: "scale_clarifier",
    triggerCondition: "scale signal ambiguous after Phase 1",
    // Stakes: a problem the person genuinely cares about.
    // The level at which they want to address it is the clearest scale signal available.
    text: "There's a problem in the world that genuinely bothers you. At what level do you instinctively want to address it?",
    inputType: "multiple_choice",
    options: [
      {
        id: "a",
        text: "My immediate community — the people and places I can actually reach",
        scoring: {},
        scale: "local",
        scaleConfirm: "local"
      },
      {
        id: "b",
        text: "My city, region, or ecosystem — large enough to matter, small enough to move",
        scoring: {},
        scale: "bioregional",
        scaleConfirm: "bioregional"
      },
      {
        id: "c",
        text: "National or international systems — the solution has to work at that level",
        scoring: {},
        scale: "global",
        scaleConfirm: "global"
      },
      {
        id: "d",
        text: "The root cause — if the underlying system doesn't change, nothing else holds",
        scoring: { sage: 1, explorer: 1 },
        scale: "civilizational",
        scaleConfirm: "civilizational"
      }
    ]
  },

  // ── PHASE 2 FREE TEXT ─────────────────────────────────────────────────────

  {
    id: "p2_freetext_behaviour",
    phase: 2,
    type: "free_text_behaviour",
    triggerCondition: "archetype confidence < 70% after differentiator questions",
    // Stakes: real recent moment, not hypothetical. "Genuinely absorbed" filters
    // out obligation and routine. What someone naturally reaches for
    // when nothing is required reveals pattern better than any constructed scenario.
    text: "Think of something you've done in the last few months that you were genuinely absorbed in — not because you had to, but because you wanted to. What were you actually doing?",
    inputType: "free_text",
    maxLength: 200,
    scoringMethod: "semantic_keyword",
    scoringNotes: "Abstract answers -> Sage. Relational content -> Connector. Physical/made things -> Maker. Systemic/procedural -> Steward/Guardian. Novel/frontier -> Explorer.",
    followups: [
      {
        triggerCondition: "response is abstract or conceptual",
        // Brings philosophical answers back to behaviour. "Physically or practically" is the anchor.
        text: "Can you make it more concrete? What were you actually doing — physically, or with your hands, or in a specific place?"
      }
    ]
  },


  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 3: VALIDATION
  // No new scoring. Goal: confirm the result resonates, or correct it.
  // ──────────────────────────────────────────────────────────────────────────

  {
    id: "p3_summary_prompt",
    phase: 3,
    type: "validation_summary",
    // "What part feels most accurate — and what part doesn't quite fit?"
    // primes calibration better than yes/no. It assumes partial fit is possible,
    // which produces better signal when something is genuinely off.
    template: "Based on what you've shared, here's what I'm seeing:\n\n{summary}\n\nWhat part feels most accurate — and what part doesn't quite fit?",
    inputType: "single_select",
    options: [
      "It all fits",
      "Most of it fits — one part is off",
      "It's partly right",
      "This doesn't feel like me"
    ]
  },

  {
    id: "p3_correction_partly",
    phase: 3,
    type: "correction",
    triggerCondition: "user selects Most of it fits or It's partly right",
    // Plain language. Three real dimensions. No jargon.
    text: "What part feels off — the way you show up and operate, the area of life it's pointing to, or the scale it's describing?",
    inputType: "single_select",
    options: [
      "How I show up — the role itself doesn't fit",
      "The area of life — it's pointing to the wrong thing",
      "The scale — too local, too global, or just not right",
      "All of it feels a bit off"
    ],
    followupAction: "re_score_targeted"
  },

  {
    id: "p3_correction_no",
    phase: 3,
    type: "correction",
    triggerCondition: "user selects This doesn't feel like me",
    // When the whole result misses — go back to lived experience.
    // "Don't overthink it" is load-bearing. We want instinct, not performance.
    text: "Okay. In your own words — when do you feel most like yourself and most useful? One or two sentences is enough.",
    inputType: "free_text",
    maxLength: 250,
    followupAction: "re_target_phase2"
  }

];


// ─────────────────────────────────────────────────────────────────────────────
// PHASE 2 SELECTION RULES — reference only, implemented in scoring.js
// ─────────────────────────────────────────────────────────────────────────────

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
    condition: "scale signal missing or split across 3+ values",
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
