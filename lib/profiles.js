// PURPOSE PIECE — PROFILE LIBRARY
// Seven archetypes. Pure data. No logic.
// Domain and scale modifiers appended by voice.js at render time.
// Blended key format: sorted alphabetically, underscore-joined e.g. "connector_steward"

const profiles = {

  // ─── STEWARD ──────────────────────────────────────────────────────────────
  steward: {
    label: "Steward",
    tagline: "The one who keeps things alive",
    description: `You sustain. Where others build and move on, you stay — tending, maintaining, improving what exists. You notice what needs attention before it becomes a problem. You carry things others forget they handed to you.

This isn't a lesser form of contribution. It's the backbone of everything that endures. Civilisations aren't built by people who show up once. They're sustained by people who show up repeatedly, through the unglamorous middle of things.`,
    signatureStrengths: [
      "You catch what others overlook — the detail, the gap, the thing starting to slip",
      "You follow through without being asked twice",
      "You build trust through consistency, not performance",
      "You hold institutional memory — you know why things are the way they are",
      "You make complex systems legible and manageable for everyone around you"
    ],
    shadowPatterns: [
      "You carry too much silently — absorbing what others should own",
      "You maintain what should be let go, out of loyalty to effort already spent",
      "Resentment builds when your stewardship is taken for granted or made invisible",
      "You resist change that threatens what you've stabilised — even when the change is necessary",
      "The line between taking care and over-controlling blurs under stress"
    ],
    realignmentCues: [
      "What am I maintaining out of habit or obligation that I no longer believe in?",
      "Where have I been doing the work that others should be accountable for?",
      "What would I do differently if I trusted that things wouldn't fall apart without me?"
    ],
    whyItMatters: `Every system that endures requires someone who tends it. Not once. Repeatedly. Stewards are the reason continuity exists. In a world that rewards novelty and disruption, your mode of contribution is quietly radical: you're playing the long game when almost everyone else is optimising for now.`,
    actions: {
      light: "Identify one thing you're maintaining that genuinely needs to be handed off or let go — and take one step toward that today.",
      medium: "Map the full scope of what you're currently stewarding. For each item: is this mine to hold? Does it still deserve my energy? Is anyone else benefiting from my invisibility here?",
      deep: "Design a stewardship handoff for one important system, relationship, or responsibility — not abandonment, but deliberate succession. Who comes after you? What do they need to know?"
    }
  },

  // ─── MAKER ────────────────────────────────────────────────────────────────
  maker: {
    label: "Maker",
    tagline: "The one who builds the thing",
    description: `You think by making. An idea isn't real until it exists — until you can see it, use it, hand it to someone. You're restless in the gap between concept and creation, and you close that gap faster than most people think possible.

You bring things into existence that wouldn't exist otherwise. The built world — physical, digital, social — is made by people like you who couldn't leave the problem alone until it was solved.`,
    signatureStrengths: [
      "You move from idea to execution without needing the whole plan first",
      "You solve problems by building your way through them, not theorising around them",
      "You have a felt sense for quality — you know when something works",
      "You create tangible value that others can use, build on, or point to",
      "Your productivity is generative — you leave more than you found"
    ],
    shadowPatterns: [
      "You can build the wrong thing at speed — momentum without enough direction",
      "Finishing is harder than starting; you may leave a trail of 80% complete work",
      "You can undervalue what can't be made — relationships, culture, rest",
      "The need to be building can become compulsive, a way to avoid stillness",
      "You may dismiss others' contributions if they don't produce visible outputs"
    ],
    realignmentCues: [
      "What am I building right now that I actually believe in — and what am I building out of momentum?",
      "What would I make if I weren't trying to prove anything?",
      "Where is my making in service of something larger, and where is it just for its own sake?"
    ],
    whyItMatters: `Making is how humanity externalises its intelligence. Every tool, structure, and artefact that improves life was built by someone who refused to accept the current state as final. The problems that matter most will be solved by people who applied their instinct for building to the questions that matter most.`,
    actions: {
      light: "Pick the project you've been circling and take it 10% further today — one concrete step, not a plan for a step.",
      medium: "Audit your current making: what are you building, for whom, toward what end? Put your best hours toward the one project where your effort and your values are most aligned.",
      deep: "Design and build something you've been avoiding because the stakes feel too high. Start with a prototype you're willing to be wrong about."
    }
  },

  // ─── ARCHITECT ────────────────────────────────────────────────────────────
  architect: {
    label: "Architect",
    tagline: "The one who designs the container",
    description: `You don't just build things — you design the structures that determine what can be built at all. When you walk into a chaotic situation, your first move isn't to fix the immediate problem. It's to understand what structural conditions are producing it, then redesign those conditions so the problem can't keep recurring.

Others operate inside systems. You design the systems others operate inside. You think in layers: what are the interfaces, the decision rules, the accountability structures, the coordination mechanisms? You're not satisfied until the architecture is sound.

Architects are common at organisational scale. At civilisational scale, they're rare. Same pattern, different scope.`,
    signatureStrengths: [
      "You see structural incoherence before it produces visible breakdown",
      "You design for coherence across many actors, not just immediate functionality",
      "You think in layers — interfaces, protocols, decision rules, accountability structures",
      "You move between abstraction and implementation without losing either",
      "You build things that are durable because they're designed for conditions that actually exist"
    ],
    shadowPatterns: [
      "You can overbuild before testing — architecture so complete it never ships",
      "Structure can become a form of control — designing systems that constrain rather than enable",
      "Impatience with people who don't think structurally creates friction and isolation",
      "Analysis can replace execution — endless redesign without commitment to a version",
      "You may undervalue the informal, emergent, and relational that can't be architected"
    ],
    realignmentCues: [
      "Is this structure enabling others — or am I designing control I'm not admitting to?",
      "What's the simplest architecture that would actually work, and why am I not starting there?",
      "Where does this need to ship, even incomplete, rather than be designed further?"
    ],
    whyItMatters: `Every enduring human institution was architected — constitutions, legal systems, coordination protocols, governance frameworks, technical standards. A builder makes an instance. An Architect creates the conditions for many instances. At the scale of civilisational challenges, the bottleneck isn't people willing to work — it's coherent structures for that work to happen inside. That's what Architects provide. It's one of the most leveraged contributions available.`,
    actions: {
      light: "Map one broken system you're inside and identify the structural cause — not the symptom, the cause. Write it down clearly enough that someone else could understand it.",
      medium: "Design a governance or coordination structure for something that currently runs on informal agreement. Make the implicit explicit: who decides what, how, with what accountability.",
      deep: "Identify the most important structural incoherence in your domain — the design flaw that produces recurring problems — and build a concrete proposal for redesigning it."
    }
  },

  // ─── CONNECTOR ────────────────────────────────────────────────────────────
  connector: {
    label: "Connector",
    tagline: "The one who makes the room work",
    description: `You see people. Not roles, not functions — people. You notice who's in the room, what they need, who they should know, and what's left unsaid. You move through the world with a kind of social intelligence that others experience as warmth, but it's something more precise: you pay attention in ways most people don't.

The things you create — trust, community, belonging, collaboration — are invisible until they're gone. You don't build things that can be pointed to. You build the conditions in which everything else becomes possible.`,
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
      "You avoid necessary conflict to preserve connection, letting real problems fester",
      "Being needed can feel like being valued — these are not the same thing",
      "You spread depth thin trying to hold too many connections at once"
    ],
    realignmentCues: [
      "In which relationships am I giving in ways that aren't reciprocal — and am I okay with that?",
      "Where am I keeping the peace when I should be naming the problem?",
      "What would I pursue if I weren't oriented around other people's needs?"
    ],
    whyItMatters: `Every collective human achievement required someone who could hold people together long enough for the work to happen. Connectors are the social infrastructure of civilisation. In a world fragmenting along every axis, the ability to create genuine human connection isn't a soft skill. It's one of the most critical capacities on earth.`,
    actions: {
      light: "Reach out to one person you've been meaning to reconnect with — not for a reason, just because the relationship matters.",
      medium: "Map your current relational commitments. Where are you the connective tissue others depend on? Where is that sustainable, and where is it costing you more than you've acknowledged?",
      deep: "Identify a community, group, or network that needs to exist but doesn't — and take the first concrete step toward creating the conditions for it."
    }
  },

  // ─── GUARDIAN ─────────────────────────────────────────────────────────────
  guardian: {
    label: "Guardian",
    tagline: "The one who holds the line",
    description: `You think about what could go wrong — not because you're pessimistic, but because you've thought about it and someone has to. You maintain standards others let slide. You ask the question that makes the room uncomfortable and turns out to be the question that mattered most.

Guardianship is not the same as caution. You're not afraid of risk. You're precise about it. You've earned the right to say no because you know what you're protecting.`,
    signatureStrengths: [
      "You identify risk and failure modes before they become problems",
      "You enforce standards — quality, ethics, process — without apology",
      "You create the stability that lets others take creative risks",
      "You're reliable in the way that actually matters: when the pressure is on",
      "You hold the memory of what went wrong before, so it doesn't happen again"
    ],
    shadowPatterns: [
      "Protection can shade into control — preventing things that should be allowed to change",
      "Your risk assessment can become miscalibrated toward the negative, becoming a ceiling on others' ambition",
      "Always being the one who asks 'but what if...' can exclude you from early creative stages",
      "Vigilance sustained over time becomes exhaustion — and you may not give yourself permission to rest",
      "You can conflate your standards with universal standards, making collaboration difficult"
    ],
    realignmentCues: [
      "What am I protecting that might be holding something better back?",
      "Where is my caution serving the work — and where is it serving my own anxiety?",
      "What would I allow to happen if I trusted that things could recover from failure?"
    ],
    whyItMatters: `Every system of value — legal, ecological, ethical, financial, democratic — requires guardians. The commons are only shared because someone defends them. The standards that make trust possible are only real because someone holds them. In a world where short-term incentives routinely undermine long-term integrity, Guardians are the immune system: often invisible when working, urgently missed when absent.`,
    actions: {
      light: "Name one standard you've been letting slide — in your own work or something you're responsible for. Take one concrete step to restore it.",
      medium: "Review your current commitments through a Guardian lens: where are you protecting what matters, and where has protection become rigidity? For each instance of rigidity, ask what you're actually afraid of.",
      deep: "Identify the thing you're most concerned will be lost or compromised in your domain. Design a concrete mechanism to protect it that doesn't depend entirely on you."
    }
  },

  // ─── EXPLORER ─────────────────────────────────────────────────────────────
  explorer: {
    label: "Explorer",
    tagline: "The one who goes first",
    description: `You're pulled toward what doesn't exist yet. New territory isn't threatening — it's where you're most alive. You think in possibilities before you think in plans. You're the person who's already onto the next thing, who saw the opening before the room did.

You're mapping terrain that others will later use. You move fast at the frontier so the path exists. You pay the cost of being early so that what comes after you is possible.`,
    signatureStrengths: [
      "You see opportunity and possibility before they're legible to others",
      "You're comfortable with uncertainty in a way that's genuinely rare",
      "You move fast enough to test ideas while others are still planning them",
      "You create the new — the direction, the category, the option that didn't exist before",
      "You recover from failure faster than most, because you never expected a straight line"
    ],
    shadowPatterns: [
      "You can mistake novelty for value — new is not the same as better",
      "Commitment is hard when the next frontier is always visible; depth suffers for breadth",
      "You leave people behind — not cruelly, but by moving at a pace they can't follow",
      "The inability to stay through the middle means others often finish what you started",
      "Exploration without integration produces motion without meaning"
    ],
    realignmentCues: [
      "What have I started that actually deserves to be finished — and what would it take to stay with it?",
      "Where is my need for novelty a genuine signal, and where is it avoidance?",
      "What's the most important frontier I'm not exploring because it's too close to home?"
    ],
    whyItMatters: `Every map has edges. Every category was once undefined. Explorers don't just discover new territory — they expand the collective sense of what's possible. In a period where the limits of current systems are becoming visible, the ability to think and move beyond them isn't optional. You don't go first because it's easy. You go first because without you, the path doesn't exist.`,
    actions: {
      light: "Identify one frontier you've been circling and take one step into it today without a plan for what comes next.",
      medium: "Map your current explorations: where are you at the edge of something real, and where are you exploring to avoid committing to something you've already found?",
      deep: "Choose the most important unexplored question in your domain — the one that matters most if the answer turns out to be different from what everyone assumes. Spend 30 days exploring it seriously."
    }
  },

  // ─── SAGE ─────────────────────────────────────────────────────────────────
  sage: {
    label: "Sage",
    tagline: "The one who understands why",
    description: `You need to understand. Not just what — why. You move through the world as a student of it, accumulating pattern and insight with the same care others bring to accumulating resources. You ask the question that reframes the whole conversation. You see what's underneath what's visible.

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
      "You withhold contribution until you feel sufficiently certain, missing the moment",
      "The depth of your thinking makes it hard to communicate with people operating at a different pace",
      "You can become attached to your frameworks, defending them past the point where new evidence should update them",
      "Being the one who understands can slide into being the one who judges"
    ],
    realignmentCues: [
      "What do I understand well enough to act on — and what am I still studying to avoid deciding?",
      "Where is my insight currently in service of something, and where is it just for its own sake?",
      "What would I say if I stopped waiting until I had it perfectly worked out?"
    ],
    whyItMatters: `Wisdom is not knowledge. It's the capacity to apply understanding to what matters. Every civilisational transition required people who understood things deeply enough to name what others couldn't yet see. Sages create the conceptual vocabulary through which new worlds become thinkable. Your contribution isn't an output or a relationship or a protection. It's a way of seeing. And right now, the world desperately needs people who can see clearly.`,
    actions: {
      light: "Share one insight you've been sitting on — in conversation, in writing, however feels natural. Don't wait until it's fully formed.",
      medium: "Identify the most important question in your domain that remains genuinely open. Spend two weeks studying it with the intent to form and share a real position, not just a nuanced take.",
      deep: "Write or build something that externalises your deepest current understanding — a framework, an essay, a teaching — something others can use even when you're not in the room."
    }
  }
};

// ─── DOMAIN MODIFIERS ────────────────────────────────────────────────────────
const domainModifiers = {
  human_being: { label: "Human Being", context: "Your work is fundamentally about people as individuals — their growth, their inner life, their capacity. You operate where the personal is the point." },
  society:     { label: "Society",     context: "Your work is at the level of groups, institutions, and culture. You're thinking about how people organise together, not just individual outcomes." },
  nature:      { label: "Nature",      context: "Your work is rooted in the living world — land, water, ecology, the non-human. What happens to natural systems isn't backdrop to you; it's the subject." },
  technology:  { label: "Technology",  context: "Your work is mediated by and often about tools, systems, and the built environment. You think about what we've made and what we should make differently." },
  finance:     { label: "Finance & Economy", context: "Your work engages with how value is created, distributed, and sustained. The flows of money and resources aren't abstract to you — they're where real decisions get made." },
  legacy:      { label: "Legacy",      context: "Your work is oriented toward time — what lasts, what's handed forward, what the long arc of things requires. You think across generations, not just quarters." },
  vision:      { label: "Vision",      context: "Your work is at the level of possibility — what could be, what should be, what is not yet legible but needs to become so. You operate at the edge of what exists." }
};

// ─── SCALE MODIFIERS ─────────────────────────────────────────────────────────
const scaleModifiers = {
  local:          { label: "Local",          context: "You operate at the scale of immediate community — the people and places you can actually touch, know by name, and affect directly." },
  bioregional:    { label: "Bioregional",    context: "You operate at the scale of a watershed, region, or ecosystem — large enough to matter structurally, small enough to still be tangible." },
  global:         { label: "Global",         context: "You operate at national or international scale — your frame of reference includes systems and consequences that cross borders." },
  civilizational: { label: "Civilizational", context: "You operate at the longest and widest scale — the trajectory of human civilisation, the deep roots of problems, the systemic conditions that everything else depends on." }
};

// ─── BLENDED BRIDGES ─────────────────────────────────────────────────────────
const blendedDescriptions = {
  "architect_maker": {
    tagline: "The one who builds what lasts",
    bridge: "You build — but you build with the whole system in mind. Where most Makers produce instances, you produce infrastructure. The things you make are designed to be built upon, extended, and operated by others.",
    uniqueNote: "The tension: Makers ship. Architects design. This blend can produce architecture so complete it never ships. A working version beats a perfect blueprint."
  },
  "architect_sage": {
    tagline: "The one who designs from understanding",
    bridge: "You understand systems deeply enough to redesign them. Where the Sage sees the pattern, the Architect designs the structural response. Your frameworks aren't just descriptive — they're operational.",
    uniqueNote: "The risk is producing thinking so comprehensive that others can't find an entry point. What's the minimum viable structure that lets the work happen now?"
  },
  "architect_steward": {
    tagline: "The one who redesigns to sustain",
    bridge: "You don't just maintain systems — you redesign them so they're easier to maintain. When something keeps breaking, you change the architecture so it stops breaking.",
    uniqueNote: "Not everything broken is structurally flawed. Some things just need care. Knowing which situation you're in is the core discernment this blend requires."
  },
  "architect_guardian": {
    tagline: "The one who builds structures that protect",
    bridge: "You protect through design — governance frameworks, accountability structures, protocols that prevent failure modes before they occur.",
    uniqueNote: "The risk: over-engineering protection, building systems so defensive they become rigid. Some threats are best handled by adaptive response, not designed-in constraints."
  },
  "architect_explorer": {
    tagline: "The one who maps and designs",
    bridge: "You explore in order to design. You come back from the frontier with a structural proposal, not just a report.",
    uniqueNote: "The question is whether you're designing prematurely — before you have enough information — or appropriately — because you have enough."
  },
  "architect_connector": {
    tagline: "The one who designs for people",
    bridge: "You design coordination structures — the systems that allow people to work together without depending on heroic individual effort.",
    uniqueNote: "Human systems have informal dynamics that resist being architected. You're at your best when you hold both the structural and the relational simultaneously."
  },
  "connector_steward": {
    tagline: "The one who tends the people and the place",
    bridge: "You hold things together over time — not just connecting people in the moment but sustaining the relationships and systems that make continued connection possible.",
    uniqueNote: "This combination is rare because it requires both genuine care for people and genuine patience with systems. Most people are better at one. You do both."
  },
  "explorer_maker": {
    tagline: "The one who builds into the unknown",
    bridge: "You build your way into new territory. Ideas only become real to you when you're making them, but you're always making toward something that doesn't exist yet.",
    uniqueNote: "The Explorer-Maker is often mistaken for someone who doesn't finish things. That misses the point: you finish at the frontier. The prototype is the point."
  },
  "connector_sage": {
    tagline: "The one who helps people understand themselves",
    bridge: "You bring insight into relationship. People leave conversations with you having understood something about themselves they couldn't access alone.",
    uniqueNote: "The risk is using understanding as the form of connection — intellectualising intimacy. Real connection sometimes requires showing up without a framework."
  },
  "guardian_steward": {
    tagline: "The one who protects what endures",
    bridge: "You don't just maintain — you defend. What's entrusted to you stays intact.",
    uniqueNote: "The Guardian-Steward can become a conserving force in contexts that need transformation. Am I protecting what's genuinely worth protecting, or what's simply familiar?"
  },
  "maker_steward": {
    tagline: "The one who builds things that last",
    bridge: "You build with permanence in mind. What you make tends to outlast what other Makers produce — you're thinking about who uses this in ten years.",
    uniqueNote: "Done and working is often better than perfect and delayed."
  },
  "guardian_sage": {
    tagline: "The one who holds the truth",
    bridge: "You protect understanding. You call out the flawed premise, the shaky logic, the comfortable consensus that doesn't hold up. That's not contrarianism. It's rigour.",
    uniqueNote: "The standard for certainty should be high — but not infinite."
  },
  "explorer_sage": {
    tagline: "The one who maps the unmapped",
    bridge: "You explore in order to understand. You're patient enough to think deeply and bold enough to go first.",
    uniqueNote: "At some point, the map has to become a move."
  },
  "connector_maker": {
    tagline: "The one who builds for people",
    bridge: "Your making is never abstract — there's always a human on the other end of it.",
    uniqueNote: "Knowing which mode — solitary building vs relational attention — you're in at any given time matters."
  },
  "explorer_steward": {
    tagline: "The one who explores to tend",
    bridge: "You're drawn to frontiers not to claim them but to learn them — to understand well enough to care for what's there.",
    uniqueNote: "Being honest about which mode you're in — explorer or steward — reduces the confusion you create for others."
  },
  "explorer_connector": {
    tagline: "The one who brings people to new places",
    bridge: "You bring people with you into new territory. You expand the world for the people in your life.",
    uniqueNote: "Some of the most important things happen in the second and third visit, not the first."
  },
  "guardian_connector": {
    tagline: "The one who protects people",
    bridge: "You don't protect abstractions — you protect people. The individuals in your care feel genuinely safe around you.",
    uniqueNote: "There's a difference between creating safety and managing someone's exposure to risk. The former builds trust; the latter erodes it."
  },
  "maker_sage": {
    tagline: "The one who builds understanding",
    bridge: "You make things in order to understand them, and understand things in order to make them better. You build frameworks as readily as you build tools.",
    uniqueNote: "At some point, the work has to leave the lab."
  },
  "guardian_explorer": {
    tagline: "The one who ventures carefully",
    bridge: "You move with an unusual combination of boldness and preparation — you've thought about what could go wrong before you move.",
    uniqueNote: "One voice asks 'what could go wrong?' The other asks 'what if we went anyway?' The skill is knowing which question belongs in which moment."
  },
  "sage_steward": {
    tagline: "The one who understands to sustain",
    bridge: "You study what you care for. Your stewardship is informed by genuine comprehension, which makes it more adaptive and more durable than stewardship based on habit alone.",
    uniqueNote: "Some things need to be tended now, with incomplete information."
  }
};

module.exports = { profiles, domainModifiers, scaleModifiers, blendedDescriptions };
