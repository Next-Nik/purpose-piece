// Purpose Piece — Profile Content Library
// All 6 archetypes × full profile format
//
// Each profile contains:
//   label, tagline, description,
//   signatureStrengths[], shadowPatterns[],
//   realignmentCues[], whyItMatters,
//   actions { light, medium, deep }
//
// Domain and scale modifiers are appended by engine.js at render time.
// Blended profiles use blendedBridge from scoring.js + both archetype
// signatureStrengths merged and deduplicated by engine.js.

const profiles = {

  // ─────────────────────────────────────────────
  steward: {
    label: "Steward",
    tagline: "The one who keeps things alive",

    description: `You are someone who sustains. Where others build and move on, you stay — tending, maintaining, improving what exists. Your contribution isn't loud. It's consistent. You notice what needs attention before it becomes a problem. You carry things others forget they handed to you. When systems work, when places feel cared for, when communities hold together over time — that's often because someone like you was paying attention.

You don't need recognition for this. But you do need to know it matters. And it does. The world runs on stewardship. Most of what's worth preserving only exists because someone decided it was worth the effort.`,

    signatureStrengths: [
      "You catch what others overlook — the detail, the gap, the thing starting to slip",
      "You follow through without being asked twice",
      "You build trust through consistency, not performance",
      "You hold institutional memory — you know why things are the way they are",
      "You make complex systems legible and manageable for everyone around you"
    ],

    shadowPatterns: [
      "You can carry too much silently — absorbing what others should own",
      "You sometimes maintain what should be let go, out of loyalty to the effort already spent",
      "Resentment builds when your stewardship is taken for granted or made invisible",
      "You may resist change that threatens what you've worked to stabilise — even when the change is necessary",
      "The line between taking care and over-controlling can blur, especially under stress"
    ],

    realignmentCues: [
      "What am I maintaining out of habit or obligation that I no longer believe in?",
      "Where have I been doing the work that others should be accountable for?",
      "What would I do differently if I trusted that things wouldn't fall apart without me?"
    ],

    whyItMatters: `Stewardship is not a lesser form of leadership. It is the backbone of everything that endures. Civilisations aren't built by people who show up once — they're sustained by people who show up repeatedly, through the unglamorous middle of things. At every scale, from a household to a watershed, the Steward is the reason continuity exists. In a world that rewards novelty and disruption, your mode of contribution is quietly radical: you're playing the long game when almost everyone else is optimising for now.`,

    actions: {
      light: "Identify one thing you're maintaining that genuinely needs to be handed off or let go — and take one step toward that today.",
      medium: "Map the full scope of what you're currently stewarding. For each item: is this mine to hold? Does it still deserve my energy? Is anyone else benefiting from my invisibility here?",
      deep: "Design a stewardship handoff for one important system, relationship, or responsibility in your life — not abandonment, but deliberate succession. Who comes after you? What do they need to know?"
    }
  },

  // ─────────────────────────────────────────────
  maker: {
    label: "Maker",
    tagline: "The one who builds the thing",

    description: `You think by making. An idea isn't real until it exists — until you can see it, use it, hand it to someone. You're restless in the gap between concept and creation, and you close that gap faster than most people think possible. This isn't impatience. It's a different relationship with reality: for you, the point is always the thing itself.

You bring things into existence that wouldn't exist otherwise. That's not a small claim. The built world — physical, digital, social, structural — is made by people like you who couldn't leave the problem alone until it was solved.`,

    signatureStrengths: [
      "You move from idea to execution without needing the whole plan first",
      "You solve problems by building your way through them, not theorising around them",
      "You have a felt sense for quality — you know when something is done right",
      "You create tangible value that others can use, build on, or point to",
      "Your productivity is generative — you leave more than you found"
    ],

    shadowPatterns: [
      "You can build the wrong thing at speed — momentum without enough direction",
      "Finishing is harder than starting; you may leave a trail of 80% complete projects",
      "You can undervalue what can't be made — relationships, culture, rest",
      "The need to be building can become compulsive, a way to avoid stillness or uncertainty",
      "You may dismiss others' contributions if they don't produce visible outputs"
    ],

    realignmentCues: [
      "What am I building right now that I actually believe in — and what am I building out of habit or momentum?",
      "What would I make if I weren't trying to prove anything?",
      "Where is my making in service of something larger, and where is it just for its own sake?"
    ],

    whyItMatters: `Making is how humanity externalises its intelligence. Every tool, structure, system, and artefact that improves life was built by someone who refused to accept the current state as final. Makers are the translation layer between human imagination and physical reality. At the civilizational scale, the problems we face — energy, food, shelter, communication, medicine — will be solved by makers who applied their instinct for building to the questions that matter most. Your mode isn't just valuable. It's necessary.`,

    actions: {
      light: "Pick the project you've been circling and take it 10% further today — one concrete step, not a plan for a step.",
      medium: "Audit your current making: what are you building, for whom, toward what end? Identify the one project where your effort and your values are most aligned. Put your best hours there for the next two weeks.",
      deep: "Design and build something you've been avoiding because the stakes feel too high. Start with a prototype you're willing to be wrong about."
    }
  },

  // ─────────────────────────────────────────────
  connector: {
    label: "Connector",
    tagline: "The one who makes the room work",

    description: `You see people. Not roles, not functions — people. You notice who's in the room, what they need, who they should know, and what's left unsaid. You move through the world with a kind of social intelligence that others experience as warmth, but it's actually something more precise: you pay attention in ways most people don't.

The things you create — trust, community, belonging, collaboration — are invisible until they're gone. You don't build things that can be pointed to. You build the conditions in which everything else becomes possible. That's a profound contribution, and a profoundly underestimated one.`,

    signatureStrengths: [
      "You sense what people need before they articulate it",
      "You hold relationships over time — people don't fall through the cracks around you",
      "You create the psychological safety that lets groups do their best work",
      "You make introductions that change trajectories",
      "You translate between people who would otherwise talk past each other"
    ],

    shadowPatterns: [
      "You can give more than is returned, and not notice until the cost is significant",
      "Your attunement to others can come at the expense of your own clarity — whose needs are these?",
      "You may avoid necessary conflict to preserve connection, letting real problems fester",
      "Being needed can feel like being valued — these are not the same thing",
      "You can over-extend your relational network, spreading depth thin trying to hold too many connections"
    ],

    realignmentCues: [
      "In which relationships am I giving in ways that aren't reciprocal — and am I okay with that?",
      "Where am I keeping the peace when I should be naming the problem?",
      "What would I pursue, contribute to, or create if I weren't oriented around other people's needs?"
    ],

    whyItMatters: `Every collective human achievement — every movement, institution, collaboration, and community — required someone who could hold people together long enough for the work to happen. Connectors are the social infrastructure of civilisation. In a world fragmenting along every axis — political, cultural, technological — the ability to create genuine human connection isn't a soft skill. It's one of the most critical capacities on earth. The bridges you build between people are as real as anything made of steel.`,

    actions: {
      light: "Reach out to one person you've been meaning to reconnect with — not for a reason, just because the relationship matters.",
      medium: "Map your current relational commitments. Where are you the connective tissue that others depend on? Where is that sustainable, and where is it costing you more than you've acknowledged?",
      deep: "Identify a community, group, or network that needs to exist but doesn't — and take the first concrete step toward creating the conditions for it."
    }
  },

  // ─────────────────────────────────────────────
  guardian: {
    label: "Guardian",
    tagline: "The one who holds the line",

    description: `You think about what could go wrong — not because you're pessimistic, but because you've thought about it and someone has to. You maintain standards others let slide. You ask the question that makes the room uncomfortable and turns out to be the question that mattered most. When things stay intact, when the work holds up under pressure, when the organisation doesn't make the expensive mistake — you're often why.

Guardianship is not the same as caution. You're not afraid of risk. You're precise about it. You've earned the right to say no because you know what you're protecting.`,

    signatureStrengths: [
      "You identify risk and failure modes before they become problems",
      "You enforce standards — quality, ethics, process — without apology",
      "You create the safety and stability that lets others take creative risks",
      "You're reliable in the way that actually matters: when the pressure is on",
      "You hold the memory of what went wrong before, so it doesn't happen again"
    ],

    shadowPatterns: [
      "Protection can shade into control — preventing things that should be allowed to change",
      "You can become the ceiling of a group's ambition if your risk assessment is miscalibrated toward the negative",
      "The cost of always being the one who says 'but what if...' is being excluded from early creative stages",
      "Vigilance, sustained over time, becomes exhausting — and you may not give yourself permission to rest",
      "You can conflate your standards with universal standards, making it hard to collaborate with people who work differently"
    ],

    realignmentCues: [
      "What am I protecting that might actually be holding something better back?",
      "Where is my caution serving the work — and where is it serving my own anxiety?",
      "What would I allow to happen if I trusted that things could recover from failure?"
    ],

    whyItMatters: `Every system of value — legal, ecological, ethical, financial, democratic — requires guardians. The commons are only shared because someone defends them. The standards that make trust possible are only real because someone holds them. In a world where short-term incentives routinely undermine long-term integrity, Guardians are the immune system: often invisible when working well, urgently missed when absent. What you protect matters. The work of holding the line is quiet, difficult, and essential.`,

    actions: {
      light: "Name one standard you've been letting slide — in your own work or in something you're responsible for. Take one concrete step to restore it.",
      medium: "Review your current commitments through a Guardian lens: where are you protecting what matters, and where has protection become rigidity? For each instance of rigidity, ask what you're actually afraid of.",
      deep: "Identify the thing you're most concerned will be lost or compromised in your domain — professionally, personally, or in your community. Design a concrete mechanism to protect it that doesn't depend entirely on you."
    }
  },

  // ─────────────────────────────────────────────
  explorer: {
    label: "Explorer",
    tagline: "The one who goes first",

    description: `You're pulled toward what doesn't exist yet. New territory isn't threatening — it's where you're most alive. You think in possibilities before you think in plans. You're the person who's already onto the next thing, who saw the opening before the room did, who goes somewhere unfamiliar not despite the uncertainty but because of it.

This isn't restlessness for its own sake. You're mapping terrain that others will later use. You move fast at the frontier so the path exists. You pay the cost of being early — the failed experiments, the blank stares, the loneliness of the edge — so that what comes after you is possible.`,

    signatureStrengths: [
      "You see opportunity and possibility before they're legible to others",
      "You're comfortable with uncertainty in a way that's genuinely rare",
      "You move fast enough to test ideas while others are still planning them",
      "You create the new — the direction, the category, the option that didn't exist before",
      "You recover from failure faster than most, because you never expected a straight line"
    ],

    shadowPatterns: [
      "You can mistake novelty for value — new is not the same as better",
      "Commitment is hard when the next frontier is always visible; depth may suffer for breadth",
      "You can leave people behind — not cruelly, but by moving at a pace they can't follow",
      "The inability to stay through the middle of things means others often finish what you started",
      "Exploration without integration produces experiences without wisdom — motion without meaning"
    ],

    realignmentCues: [
      "What have I started that actually deserves to be finished — and what would it take to stay with it?",
      "Where is my need for novelty a genuine signal that something new is needed, and where is it avoidance?",
      "What's the most important frontier I'm not exploring because it's too close to home?"
    ],

    whyItMatters: `Every map has edges. Every category was once undefined. Every paradigm that now seems obvious was once a frontier that someone walked into without knowing what they'd find. Explorers don't just discover new territory — they expand the collective sense of what's possible. In a period where the limits of current systems are becoming visible, the ability to think and move beyond them isn't optional. It's survival. You don't go first because it's easy. You go first because without you, the path doesn't exist.`,

    actions: {
      light: "Identify one frontier you've been circling — something genuinely new, in your work or your life — and take one step into it today without a plan for what comes next.",
      medium: "Map your current explorations: where are you at the edge of something real, and where are you exploring to avoid committing to something you've already found? Put your energy into the former.",
      deep: "Choose the most important unexplored question in your domain — the one that matters most if the answer turns out to be different from what everyone assumes. Spend 30 days exploring it seriously."
    }
  },

  // ─────────────────────────────────────────────
  sage: {
    label: "Sage",
    tagline: "The one who understands why",

    description: `You need to understand. Not just what — why. You move through the world as a student of it, accumulating pattern and insight with the same care others bring to accumulating resources. You ask the question that reframes the whole conversation. You see what's underneath what's visible. You think slowly enough to be right in ways that fast-thinking misses.

The contribution you make is clarity. In a world of noise, you distil. In a room of reaction, you reflect. People walk away from time with you thinking differently — not because you told them what to think, but because you showed them something they couldn't see before.`,

    signatureStrengths: [
      "You synthesise across domains and disciplines in ways that produce genuine insight",
      "You ask the question that changes the frame — the one others were too close to ask",
      "You hold complexity without collapsing it prematurely into simple answers",
      "You teach in the deepest sense: you help people understand, not just know",
      "You see the pattern in the noise — the structure underneath the surface of things"
    ],

    shadowPatterns: [
      "Understanding can become a substitute for action — analysis that circles without landing",
      "You may withhold contribution until you feel sufficiently certain, missing the moment",
      "The depth of your thinking can make it hard to communicate with people operating at a different pace",
      "You can become attached to your frameworks, defending them past the point where new evidence should update them",
      "Being the one who understands can slide into being the one who judges — wisdom without humility becomes contempt"
    ],

    realignmentCues: [
      "What do I understand well enough to act on — and what am I still studying to avoid deciding?",
      "Where is my insight currently in service of something, and where is it just for its own sake?",
      "What would I say if I stopped waiting until I had it perfectly worked out?"
    ],

    whyItMatters: `Wisdom is not knowledge. It's the capacity to apply understanding to what matters. Every civilisational transition — every paradigm shift, every reformation of values, every expansion of what's considered possible — required people who understood things deeply enough to name what others couldn't yet see. Sages don't just describe the world. They create the conceptual vocabulary through which new worlds become thinkable. Your contribution isn't an output or a relationship or a protection — it's a way of seeing. And right now, the world desperately needs people who can see clearly.`,

    actions: {
      light: "Share one insight you've been sitting on — in conversation, in writing, however feels natural. Don't wait until it's fully formed.",
      medium: "Identify the most important question in your domain that remains genuinely open. Spend two weeks studying it with the intent to form and share a real position, not just a nuanced take.",
      deep: "Write or build something that externalises your deepest current understanding — a framework, an essay, a teaching — something others can use even when you're not in the room."
    }
  }
};

// ─────────────────────────────────────────────
// DOMAIN CONTEXT MODIFIERS
// Appended to description paragraph at render time
// Format: "In the domain of [X], this shows up as..."
// ─────────────────────────────────────────────

const domainModifiers = {
  human_being: {
    label: "Human Being",
    context: "Your work is fundamentally about people as individuals — their growth, their inner life, their development. You operate where the personal is the point."
  },
  society: {
    label: "Society",
    context: "Your work is at the level of groups, institutions, and culture. You're not just thinking about individuals — you're thinking about how people organise together."
  },
  nature: {
    label: "Nature",
    context: "Your work is rooted in the living world — land, water, ecology, the non-human. What happens to natural systems isn't backdrop to you; it's the subject."
  },
  technology: {
    label: "Technology",
    context: "Your work is mediated by and often about tools, systems, and the built environment. You think about what we've made and what we should make differently."
  },
  finance: {
    label: "Finance & Economy",
    context: "Your work engages with how value is created, distributed, and sustained. The flows of money and resources aren't abstract to you — they're where real decisions get made."
  },
  legacy: {
    label: "Legacy",
    context: "Your work is oriented toward time — what lasts, what's handed forward, what the long arc of things requires. You think across generations, not just quarters."
  },
  vision: {
    label: "Vision",
    context: "Your work is at the level of possibility — what could be, what should be, what is not yet legible but needs to become so. You operate at the edge of what exists."
  }
};

// ─────────────────────────────────────────────
// SCALE CONTEXT MODIFIERS
// ─────────────────────────────────────────────

const scaleModifiers = {
  local: {
    label: "Local",
    context: "You operate at the scale of immediate community — the people and places you can actually touch, know by name, and affect directly."
  },
  bioregional: {
    label: "Bioregional",
    context: "You operate at the scale of a watershed, region, or ecosystem — large enough to matter structurally, small enough to still be tangible."
  },
  global: {
    label: "Global",
    context: "You operate at national or international scale — your frame of reference includes systems and consequences that cross borders."
  },
  civilizational: {
    label: "Civilizational",
    context: "You operate at the longest and widest scale — you're thinking about the trajectory of human civilisation, the deep roots of problems, the systemic conditions that everything else depends on."
  }
};

// ─────────────────────────────────────────────
// BLENDED PROFILE CONTENT
// For archetype pairs within 12% of each other
// Key format: sorted alphabetically, e.g. "connector_steward"
// ─────────────────────────────────────────────

const blendedDescriptions = {
  "connector_steward": {
    tagline: "The one who tends the people and the place",
    bridge: "You hold things together over time — not just connecting people in the moment but sustaining the relationships, communities, and systems that make continued connection possible. You're the reason things don't fall apart. The reason people come back.",
    uniqueNote: "The Connector-Steward combination is rare because it requires both genuine care for people and genuine patience with systems. Most people are better at one than the other. You do both."
  },
  "explorer_maker": {
    tagline: "The one who builds into the unknown",
    bridge: "You don't just explore and you don't just build — you build your way into new territory. Ideas only become real to you when you're making them, but you're always making toward something that doesn't exist yet. You're most alive at the intersection of creation and discovery.",
    uniqueNote: "The Explorer-Maker is often mistaken for someone who doesn't finish things. That misses the point: you finish at the frontier. The prototype is the point."
  },
  "connector_sage": {
    tagline: "The one who helps people understand themselves",
    bridge: "You bring insight into relationship. You're not just listening — you're seeing. Not just present — you're thinking. People leave conversations with you having understood something about themselves they couldn't access alone. That's a profound and specific gift.",
    uniqueNote: "The risk in this combination is using understanding as the form of connection — intellectualising intimacy. Real connection sometimes requires showing up without a framework."
  },
  "guardian_steward": {
    tagline: "The one who protects what endures",
    bridge: "You don't just maintain — you defend. The systems, relationships, and values you steward are ones you've decided are worth protecting, and you hold that line with a seriousness others may underestimate. What's entrusted to you stays intact.",
    uniqueNote: "The Guardian-Steward can become a conserving force in contexts that need transformation. The question is always: am I protecting what's genuinely worth protecting, or what's simply familiar?"
  },
  "connector_maker": {
    tagline: "The one who builds for people",
    bridge: "You build things that bring people together, or you build because of specific people you're trying to serve. Your making is never abstract — there's always a human on the other end of it. That orientation toward people gives your work a directness that purely technical Makers often lack.",
    uniqueNote: "The tension in this blend is between the solitary focus making requires and the relational attention connecting requires. They compete for the same energy. Knowing which mode you're in matters."
  },
  "explorer_sage": {
    tagline: "The one who maps the unmapped",
    bridge: "You explore in order to understand — not just to go somewhere new, but to genuinely know what's there. You're patient enough to think deeply and bold enough to go first. That combination is unusual. Most thinkers don't venture, and most venturers don't think this carefully.",
    uniqueNote: "The risk is spending so long understanding the frontier that the window to act in it closes. At some point, the map has to become a move."
  },
  "maker_steward": {
    tagline: "The one who builds things that last",
    bridge: "You build with permanence in mind. Not just functional — durable. Not just working — sustainable. You bring a care for continuity to everything you create, which means what you make tends to outlast what other Makers build. You're thinking about who uses this in ten years.",
    uniqueNote: "The Maker-Steward can become a perfectionist — the desire for durability extending timelines past their value. At some point, done and working is better than perfect and delayed."
  },
  "guardian_sage": {
    tagline: "The one who holds the truth",
    bridge: "You protect understanding. You're not just cautious — you're precise. Not just principled — you're clear about why the principles matter. You're the person who calls out the flawed premise, the shaky logic, the comfortable consensus that doesn't hold up. That's not contrarianism. It's rigour.",
    uniqueNote: "The Guardian-Sage can become the gatekeeper who never lets anything through. The standard for certainty should be high — but not infinite. At some point, acting on incomplete understanding is the only option."
  },
  "explorer_steward": {
    tagline: "The one who explores to tend",
    bridge: "You go into new territory not just for the experience of it, but because you want to understand what's there well enough to care for it. You're drawn to frontiers not to claim them but to learn them. That's a rare and important combination — the explorer who actually comes back with something for the commons.",
    uniqueNote: "The tension is between the speed exploration requires and the patience stewardship requires. These are genuinely different orientations. Being honest about which mode you're in at any given time reduces the confusion you create for others."
  },
  "explorer_connector": {
    tagline: "The one who brings people to new places",
    bridge: "You don't just explore alone and you don't just connect people where they already are — you bring people with you into new territory. You're the person who says 'you need to know about this' and means it. You expand the world for the people in your life.",
    uniqueNote: "The Explorer-Connector can over-expand the circle at the cost of deepening what's already there. New connections and new frontiers are compelling — but some of the most important things happen in the second and third visit, not the first."
  },
  "guardian_connector": {
    tagline: "The one who protects people",
    bridge: "You don't protect abstractions — you protect people. The relationships, communities, and individuals in your care feel genuinely safe around you because your vigilance is in their service. You hold the line so they don't have to.",
    uniqueNote: "The risk in this blend is that protection can become control — especially in close relationships. There's a difference between creating safety and managing someone's exposure to risk. The former builds trust; the latter erodes it."
  },
  "maker_sage": {
    tagline: "The one who builds understanding",
    bridge: "You don't just make things and you don't just understand things — you make things in order to understand them, and you understand things in order to make them better. Your output is always denser with thinking than what other Makers produce. You build frameworks as readily as you build tools.",
    uniqueNote: "The Maker-Sage can get stuck in the thinking-making loop without ever handing the thing to someone who needs it. At some point, the work has to leave the lab."
  },
  "guardian_explorer": {
    tagline: "The one who ventures carefully",
    bridge: "You go into new territory, but not recklessly. You've thought about what could go wrong before you move, which means when you do move, you move with an unusual combination of boldness and preparation. You take calculated risks that others wouldn't take because you've done the work of understanding what you're taking on.",
    uniqueNote: "The Guardian-Explorer tension is real: one voice says 'what could go wrong?' and the other says 'what if we went anyway?' Both are valid. The skill is knowing which question belongs in which moment."
  },
  "sage_steward": {
    tagline: "The one who understands to sustain",
    bridge: "You study what you care for. You don't just maintain systems — you understand them deeply enough to know how they work, why they're fragile, what they need to thrive. Your stewardship is informed by genuine comprehension, which makes it more adaptive and more durable than stewardship based on habit alone.",
    uniqueNote: "The Steward-Sage can over-study before acting, waiting for sufficient understanding before touching what needs tending. Some things need to be tended now, with incomplete information."
  }
};

module.exports = {
  profiles,
  domainModifiers,
  scaleModifiers,
  blendedDescriptions
};
