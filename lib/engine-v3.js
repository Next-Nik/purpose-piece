// PURPOSE PIECE v3 — ENGINE
// 4 phases: Rapid Signal → Clarifying Signal → Recognition Sequence → Delivery

const questions = require('./questions-v3');
const scoring = require('./scoring-v3');
const profiles = require('./profiles');

function start(session) {
  return {
    type: "question",
    question: questions.PHASE_1_QUESTIONS[0],
    acknowledgment: null
  };
}

function answer(session, userAnswer) {
  const currentQuestionIndex = session.answeredQuestions.length;
  
  // PHASE 1: Rapid Signal (3 questions)
  if (session.phase === 1) {
    if (currentQuestionIndex < 3) {
      const question = questions.PHASE_1_QUESTIONS[currentQuestionIndex];
      const selectedOption = question.options.find(opt => opt.id === userAnswer.toLowerCase());
      
      if (!selectedOption) {
        return {
          type: "clarification",
          message: "Just the letter is fine — A, B, C, D, E, or F."
        };
      }
      
      // Tally the archetype
      scoring.tallyArchetype(session, selectedOption.archetype);
      session.answeredQuestions.push(question.id);
      session.answers.push({ questionId: question.id, answer: userAnswer, archetype: selectedOption.archetype });
      
      // If we've completed all 3 Phase 1 questions
      if (session.answeredQuestions.length === 3) {
        const topArchetypes = scoring.getTopArchetypes(session);
        
        // Check if we need tiebreaker
        if (!topArchetypes.isClear && topArchetypes.isTie) {
          session.phase = "1-tiebreaker";
          return {
            type: "question",
            question: questions.TIEBREAKER_QUESTION,
            acknowledgment: "Got it."
          };
        }
        
        // Clear signal - move to Phase 2
        session.primaryArchetype = topArchetypes.primary;
        if (topArchetypes.secondaryCount > 0 && topArchetypes.primaryCount - topArchetypes.secondaryCount === 1) {
          session.secondaryArchetype = topArchetypes.secondary;
        }
        session.phase = 2;
        
        return {
          type: "question",
          question: questions.PHASE_2_QUESTIONS.recentBehavior,
          acknowledgment: "Good. I'm getting a clear sense of your pattern."
        };
      }
      
      // More Phase 1 questions to go
      const nextQuestion = questions.PHASE_1_QUESTIONS[currentQuestionIndex + 1];
      return {
        type: "question",
        question: nextQuestion,
        acknowledgment: currentQuestionIndex === 0 ? "Got it." : null
      };
    }
  }
  
  // PHASE 1 TIEBREAKER
  if (session.phase === "1-tiebreaker") {
    // Store the free-text answer
    session.tiebreakerText = userAnswer;
    
    // Simple keyword matching to break tie
    const topArchetypes = scoring.getTopArchetypes(session);
    const text = userAnswer.toLowerCase();
    
    // Look for action verbs
    const verbMap = {
      steward: ["maintain", "manage", "organize", "keep", "tend", "sustain", "handle", "care"],
      maker: ["build", "create", "make", "design", "construct", "develop", "produce", "fix"],
      connector: ["connect", "bring", "talk", "reach out", "coordinate", "facilitate", "introduce"],
      guardian: ["protect", "defend", "prevent", "guard", "check", "ensure", "stop"],
      explorer: ["explore", "research", "investigate", "discover", "find", "learn", "try"],
      sage: ["understand", "analyze", "observe", "reflect", "consider", "think", "study"]
    };
    
    let bestMatch = topArchetypes.primary;
    let maxMatches = 0;
    
    for (const [archetype, verbs] of Object.entries(verbMap)) {
      const matches = verbs.filter(verb => text.includes(verb)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = archetype;
      }
    }
    
    session.primaryArchetype = bestMatch;
    session.phase = 2;
    
    return {
      type: "question",
      question: questions.PHASE_2_QUESTIONS.recentBehavior,
      acknowledgment: "That's helpful."
    };
  }
  
  // PHASE 2: Clarifying Signal
  if (session.phase === 2) {
    const lastQuestion = session.answeredQuestions[session.answeredQuestions.length - 1];
    
    // Q4: Recent behavior (free text)
    if (!lastQuestion || lastQuestion === questions.TIEBREAKER_QUESTION.id) {
      session.behaviorText = userAnswer;
      session.answeredQuestions.push(questions.PHASE_2_QUESTIONS.recentBehavior.id);
      
      // Infer domain from text
      const inferredDomain = scoring.inferDomainFromText(userAnswer);
      if (inferredDomain) {
        session.domain = inferredDomain;
      }
      
      // Move to scale question
      return {
        type: "question",
        question: questions.PHASE_2_QUESTIONS.scale,
        acknowledgment: "Okay."
      };
    }
    
    // Q6: Scale
    if (lastQuestion === questions.PHASE_2_QUESTIONS.recentBehavior.id) {
      const scaleQuestion = questions.PHASE_2_QUESTIONS.scale;
      const selectedOption = scaleQuestion.options.find(opt => opt.id === userAnswer.toLowerCase());
      
      if (!selectedOption) {
        return {
          type: "clarification",
          message: "Just the letter — A, B, C, or D."
        };
      }
      
      session.scale = selectedOption.scale;
      session.answeredQuestions.push(scaleQuestion.id);
      
      // If we don't have a domain yet, ask about it
      if (!session.domain) {
        session.phase = "2-domain-needed";
        return {
          type: "question_text",
          text: "One more thing — what area of collective work does this belong to? Is it more about people's inner development, social structures, nature and ecology, technology and tools, economics and resources, long-term preservation, or coordinating toward a shared future?",
          acknowledgment: null
        };
      }
      
      // We have everything - move to subdomain confirmation
      session.phase = "2-subdomain";
      return askSubdomainQuestion(session);
    }
    
    // Domain clarification
    if (session.phase === "2-domain-needed") {
      const domainMap = {
        "inner": "human_being",
        "people": "human_being",
        "development": "human_being",
        "social": "society",
        "community": "society",
        "governance": "society",
        "nature": "nature",
        "ecology": "nature",
        "environment": "nature",
        "technology": "technology",
        "tech": "technology",
        "tools": "technology",
        "economic": "finance",
        "money": "finance",
        "resources": "finance",
        "finance": "finance",
        "preservation": "legacy",
        "long-term": "legacy",
        "future": "vision",
        "coordinate": "vision",
        "vision": "vision"
      };
      
      const lowerAnswer = userAnswer.toLowerCase();
      let matchedDomain = null;
      
      for (const [keyword, domain] of Object.entries(domainMap)) {
        if (lowerAnswer.includes(keyword)) {
          matchedDomain = domain;
          break;
        }
      }
      
      session.domain = matchedDomain || "society"; // default
      session.phase = "2-subdomain";
      return askSubdomainQuestion(session);
    }
    
    // Subdomain confirmation
    if (session.phase === "2-subdomain") {
      // User selected a subdomain option (a, b, c, d, e)
      const subdomainMenu = questions.SUBDOMAIN_MENUS[session.domain];
      const selectedOption = subdomainMenu.options.find((opt, idx) => 
        opt.id === userAnswer.toLowerCase() || 
        String.fromCharCode(97 + idx) === userAnswer.toLowerCase()
      );
      
      if (selectedOption) {
        session.subdomain = selectedOption.id;
      }
      
      // Move to Phase 3: Recognition Sequence
      session.phase = 3;
      session.recognitionStep = 1;
      
      return {
        type: "recognition_step_1",
        behavioralDescription: scoring.generateBehavioralDescription(session.primaryArchetype, session.secondaryArchetype),
        acknowledgment: "Alright. Here's what I'm seeing."
      };
    }
  }
  
  // PHASE 3: Recognition Sequence (5 steps)
  if (session.phase === 3) {
    if (session.recognitionStep === 1) {
      // After behavioral description, check resonance
      const lowerAnswer = userAnswer.toLowerCase();
      
      if (lowerAnswer.includes("yes") || lowerAnswer.includes("that fits") || lowerAnswer.includes("accurate") || lowerAnswer.includes("true")) {
        // Move to step 2: world impact
        session.recognitionStep = 2;
        return {
          type: "recognition_step_2",
          worldImpact: scoring.generateWorldImpact(session.primaryArchetype),
          acknowledgment: null
        };
      } else if (lowerAnswer.includes("no") || lowerAnswer.includes("doesn't fit") || lowerAnswer.includes("off")) {
        // Recognition failed - ask what feels off
        return {
          type: "correction_needed",
          text: "What part doesn't feel right?"
        };
      } else {
        // Partly or unclear - re-ask
        return {
          type: "clarification",
          message: "Does that description feel accurate — yes or no?"
        };
      }
    }
    
    if (session.recognitionStep === 2) {
      // After world impact, check resonance again
      const lowerAnswer = userAnswer.toLowerCase();
      
      if (lowerAnswer.includes("yes") || lowerAnswer.includes("that fits") || lowerAnswer.includes("makes sense") || lowerAnswer.includes("true")) {
        // Recognition confirmed - name the archetype
        session.recognitionStep = 3;
        return {
          type: "recognition_step_3",
          archetypeName: capitalize(session.primaryArchetype),
          secondaryName: session.secondaryArchetype ? capitalize(session.secondaryArchetype) : null,
          acknowledgment: null
        };
      } else {
        return {
          type: "clarification",
          message: "Does that feel like what you do in the world — yes or no?"
        };
      }
    }
    
    if (session.recognitionStep === 3) {
      // After archetype naming, deliver full profile
      session.phase = 4;
      return deliverFullProfile(session);
    }
  }
  
  // PHASE 4: Delivery (handled in chat.js via Claude for voice)
  return {
    type: "error",
    message: "Something unexpected happened."
  };
}

function askSubdomainQuestion(session) {
  const subdomainMenu = questions.SUBDOMAIN_MENUS[session.domain];
  
  let text = subdomainMenu.prompt + "\n\n";
  subdomainMenu.options.forEach((opt, idx) => {
    text += `${String.fromCharCode(65 + idx)}) ${opt.text}\n\n`;
  });
  
  return {
    type: "question_text",
    text: text.trim(),
    acknowledgment: null
  };
}

function deliverFullProfile(session) {
  const profile = profiles[session.primaryArchetype];
  const domainLabel = getDomainLabel(session.domain);
  const scaleLabel = capitalize(session.scale);
  
  return {
    type: "full_profile",
    profile: profile,
    archetype: capitalize(session.primaryArchetype),
    secondary: session.secondaryArchetype ? capitalize(session.secondaryArchetype) : null,
    domain: domainLabel,
    subdomain: session.subdomain,
    scale: scaleLabel,
    session: session
  };
}

function getDomainLabel(domain) {
  const labels = {
    human_being: "Human Being",
    society: "Society",
    nature: "Nature",
    technology: "Technology",
    finance: "Finance & Economy",
    legacy: "Legacy",
    vision: "Vision"
  };
  return labels[domain] || domain;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = {
  createSession: scoring.createSession,
  start,
  answer
};
