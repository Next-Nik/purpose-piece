// PURPOSE PIECE — ENGINE
// Phases: 1 → 1-tiebreaker → 2-behavior → 2-scale → 2-domain-needed → 2-subdomain → 3 → 4
//
// FILE NAMING: requires use plain names (questions.js, scoring.js, profiles.js)
// Do not add version suffixes — that's what broke deployment previously.

const questions = require('./questions');
const scoring = require('./scoring');
const profiles = require('./profiles');

function start(session) {
  return {
    type: "question",
    question: questions.PHASE_1_QUESTIONS[0],
    acknowledgment: null
  };
}

function answer(session, userAnswer) {
  const trimmed = userAnswer.trim();
  const lower = trimmed.toLowerCase();
  const currentQuestionIndex = session.answeredQuestions.length;

  // ─── PHASE 1: Rapid Signal ────────────────────────────────────────────────
  if (session.phase === 1) {
    const question = questions.PHASE_1_QUESTIONS[currentQuestionIndex];
    const selectedOption = question && question.options.find(opt => opt.id === lower);

    if (!selectedOption) {
      return { type: "clarification", message: "Just the letter is fine — A, B, C, D, E, or F." };
    }

    scoring.tallyArchetype(session, selectedOption.archetype);
    session.answeredQuestions.push(question.id);
    session.answers.push({ questionId: question.id, answer: trimmed, archetype: selectedOption.archetype });

    if (session.answeredQuestions.length === 3) {
      const top = scoring.getTopArchetypes(session);

      if (!top.isClear && top.isTie) {
        session.phase = "1-tiebreaker";
        return { type: "question", question: questions.TIEBREAKER_QUESTION, acknowledgment: null };
      }

      session.primaryArchetype = top.primary;
      if (top.secondaryCount > 0 && top.primaryCount - top.secondaryCount === 1) {
        session.secondaryArchetype = top.secondary;
      }
      session.phase = "2-behavior";
      return {
        type: "question",
        question: questions.PHASE_2_QUESTIONS.recentBehavior,
        acknowledgment: "I'm getting a clearer picture. Let's go a bit deeper to make sure it fits."
      };
    }

    const nextQuestion = questions.PHASE_1_QUESTIONS[currentQuestionIndex + 1];
    return {
      type: "question",
      question: nextQuestion,
      acknowledgment: null
    };
  }

  // ─── PHASE 1-TIEBREAKER ───────────────────────────────────────────────────
  if (session.phase === "1-tiebreaker") {
    session.tiebreakerText = trimmed;
    const top = scoring.getTopArchetypes(session);
    const verbMap = {
      steward:   ["maintain","manage","organize","keep","tend","sustain","handle","care"],
      maker:     ["build","create","make","design","construct","develop","produce","fix"],
      connector: ["connect","bring","talk","reach out","coordinate","facilitate","introduce"],
      guardian:  ["protect","defend","prevent","guard","check","ensure","stop"],
      explorer:  ["explore","research","investigate","discover","find","learn","try"],
      sage:      ["understand","analyze","observe","reflect","consider","think","study"]
    };

    let bestMatch = top.primary;
    let maxMatches = 0;
    for (const [archetype, verbs] of Object.entries(verbMap)) {
      const count = verbs.filter(v => lower.includes(v)).length;
      if (count > maxMatches) { maxMatches = count; bestMatch = archetype; }
    }

    session.primaryArchetype = bestMatch;
    session.phase = "2-behavior";
    return {
      type: "question",
      question: questions.PHASE_2_QUESTIONS.recentBehavior,
      acknowledgment: null
    };
  }

  // ─── PHASE 2-BEHAVIOR: Free-text recent activity ──────────────────────────
  if (session.phase === "2-behavior") {
    session.behaviorText = trimmed;
    session.answeredQuestions.push(questions.PHASE_2_QUESTIONS.recentBehavior.id);

    const inferredDomain = scoring.inferDomainFromText(trimmed);
    if (inferredDomain) session.domain = inferredDomain;

    session.phase = "2-scale";
    return {
      type: "question",
      question: questions.PHASE_2_QUESTIONS.scale,
      acknowledgment: null
    };
  }

  // ─── PHASE 2-SCALE: Scale selection ───────────────────────────────────────
  if (session.phase === "2-scale") {
    const scaleQuestion = questions.PHASE_2_QUESTIONS.scale;
    const selectedOption = scaleQuestion.options.find(opt => opt.id === lower);

    if (!selectedOption) {
      return { type: "clarification", message: "Just the letter — A, B, C, or D." };
    }

    session.scale = selectedOption.scale;
    session.answeredQuestions.push(scaleQuestion.id);

    if (!session.domain) {
      session.phase = "2-domain-needed";
      return {
        type: "question_text",
        text: "One more thing — what area of collective work does this belong to? Is it more about people's inner development, social structures, nature and ecology, technology and tools, economics and resources, long-term preservation, or coordinating toward a shared future?",
        acknowledgment: null
      };
    }

    session.phase = "2-subdomain";
    return askSubdomainQuestion(session);
  }

  // ─── PHASE 2-DOMAIN-NEEDED: Domain clarification ──────────────────────────
  if (session.phase === "2-domain-needed") {
    const domainMap = {
      "inner": "human_being", "people": "human_being", "development": "human_being",
      "social": "society", "community": "society", "governance": "society",
      "nature": "nature", "ecology": "nature", "environment": "nature",
      "technology": "technology", "tech": "technology", "tools": "technology",
      "economic": "finance", "money": "finance", "resources": "finance", "finance": "finance",
      "preservation": "legacy", "long-term": "legacy",
      "future": "vision", "coordinate": "vision", "vision": "vision"
    };

    let matchedDomain = null;
    for (const [keyword, domain] of Object.entries(domainMap)) {
      if (lower.includes(keyword)) { matchedDomain = domain; break; }
    }

    session.domain = matchedDomain || "society";
    session.phase = "2-subdomain";
    return askSubdomainQuestion(session);
  }

  // ─── PHASE 2-SUBDOMAIN: Subdomain selection ───────────────────────────────
  if (session.phase === "2-subdomain") {
    const subdomainMenu = questions.SUBDOMAIN_MENUS[session.domain];
    const selectedOption = subdomainMenu.options.find((opt, idx) =>
      opt.id === lower || String.fromCharCode(97 + idx) === lower
    );

    if (selectedOption) session.subdomain = selectedOption.id;

    session.phase = 3;
    session.recognitionStep = 1;

    return {
      type: "recognition_step_1",
      behavioralDescription: scoring.generateBehavioralDescription(session.primaryArchetype, session.secondaryArchetype),
      acknowledgment: "Alright. Here's what I'm seeing."
    };
  }

  // ─── PHASE 3: Recognition Sequence ────────────────────────────────────────
  if (session.phase === 3) {
    if (session.recognitionStep === 1) {
      if (lower.includes("yes") || lower.includes("that fits") || lower.includes("accurate") || lower.includes("true")) {
        session.recognitionStep = 2;
        return {
          type: "recognition_step_2",
          worldImpact: scoring.generateWorldImpact(session.primaryArchetype)
        };
      } else if (lower.includes("no") || lower.includes("doesn't fit") || lower.includes("off")) {
        return { type: "correction_needed", text: "What part doesn't feel right?" };
      } else {
        return { type: "clarification", message: "Does that description feel accurate — yes or no?" };
      }
    }

    if (session.recognitionStep === 2) {
      if (lower.includes("yes") || lower.includes("that fits") || lower.includes("makes sense") || lower.includes("true")) {
        session.recognitionStep = 3;
        return {
          type: "recognition_step_3",
          archetypeName: cap(session.primaryArchetype),
          secondaryName: session.secondaryArchetype ? cap(session.secondaryArchetype) : null
        };
      } else {
        return { type: "clarification", message: "Does that feel like what you do in the world — yes or no?" };
      }
    }

    if (session.recognitionStep === 3) {
      session.phase = 4;
      return deliverFullProfile(session);
    }
  }

  // ─── FALLTHROUGH ──────────────────────────────────────────────────────────
  return { type: "error", message: "Something unexpected happened." };
}

function askSubdomainQuestion(session) {
  const menu = questions.SUBDOMAIN_MENUS[session.domain];
  let text = menu.prompt + "\n\n";
  menu.options.forEach((opt, idx) => {
    text += `${String.fromCharCode(65 + idx)}) ${opt.text}\n\n`;
  });
  return { type: "question_text", text: text.trim(), acknowledgment: null };
}

function deliverFullProfile(session) {
  const profile = profiles[session.primaryArchetype];
  return {
    type: "full_profile",
    profile,
    archetype: cap(session.primaryArchetype),
    secondary: session.secondaryArchetype ? cap(session.secondaryArchetype) : null,
    domain: domainLabel(session.domain),
    subdomain: session.subdomain,
    scale: cap(session.scale),
    session
  };
}

function domainLabel(domain) {
  const labels = {
    human_being: "Human Being", society: "Society", nature: "Nature",
    technology: "Technology", finance: "Finance & Economy", legacy: "Legacy", vision: "Vision"
  };
  return labels[domain] || domain;
}

function cap(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = { createSession: scoring.createSession, start, answer };
