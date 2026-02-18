// PURPOSE PIECE - COMPLETE REBUILD
// Balanced archetype detection, proper tallying, confidence thresholds

const QUESTIONS = [
  {
    id: 'q1',
    text: 'When something needs attention, you find yourself:',
    options: [
      { id: 'A', text: 'Stepping in to keep it running or repair it', signals: { archetype: 'STEWARD' } },
      { id: 'B', text: 'Seeing what could be built to make it better', signals: { archetype: 'MAKER' } }
    ]
  },
  {
    id: 'q2',
    text: 'You feel most alive when:',
    options: [
      { id: 'A', text: 'Things are running smoothly because of your care', signals: { archetype: 'STEWARD' } },
      { id: 'B', text: "You're exploring what isn't known yet", signals: { archetype: 'EXPLORER' } }
    ]
  },
  {
    id: 'q3',
    text: 'When you see a pattern others miss, you:',
    options: [
      { id: 'A', text: 'Point it out to help them see clearly', signals: { archetype: 'SAGE' } },
      { id: 'B', text: 'Use it to build something new', signals: { archetype: 'MAKER' } }
    ]
  },
  {
    id: 'q4',
    text: 'You naturally notice first:',
    options: [
      { id: 'A', text: 'How people are doing, what they need', signals: { archetype: 'CONNECTOR', domain: 'HUMAN_BEING' } },
      { id: 'B', text: 'How systems are functioning, where they break', signals: { archetype: 'STEWARD', domain: 'TECHNOLOGY' } },
      { id: 'C', text: "What's at risk, what needs protecting", signals: { archetype: 'GUARDIAN', domain: 'NATURE' } }
    ]
  },
  {
    id: 'q5',
    text: "When you're working, you're usually:",
    options: [
      { id: 'A', text: 'Alone or with one or two trusted people', signals: { scale: 'LOCAL' } },
      { id: 'B', text: 'With groups, making connections happen', signals: { archetype: 'CONNECTOR', scale: 'GLOBAL' } }
    ]
  },
  {
    id: 'q6',
    text: 'You get more energy from:',
    options: [
      { id: 'A', text: "Completing and perfecting what's already in motion", signals: { archetype: 'STEWARD' } },
      { id: 'B', text: "Starting something that wasn't there before", signals: { archetype: 'MAKER' } },
      { id: 'C', text: 'Understanding the deeper pattern beneath it all', signals: { archetype: 'SAGE' } }
    ]
  },
  {
    id: 'q7',
    text: 'The work that matters to you tends to be:',
    options: [
      { id: 'A', text: 'Close to home—people and places you know directly', signals: { scale: 'LOCAL', domain: 'SOCIETY' } },
      { id: 'B', text: 'Broader in scope—systems, patterns, long-term impact', signals: { scale: 'GLOBAL', domain: 'VISION' } },
      { id: 'C', text: 'Intergenerational—what we pass to future generations', signals: { scale: 'CIVILIZATIONAL', domain: 'LEGACY' } }
    ]
  },
  {
    id: 'q8',
    text: 'When something breaks down, you first notice:',
    options: [
      { id: 'A', text: 'How it affects the people involved', signals: { archetype: 'CONNECTOR', domain: 'HUMAN_BEING' } },
      { id: 'B', text: 'The structural or systemic failure', signals: { archetype: 'STEWARD', domain: 'TECHNOLOGY' } },
      { id: 'C', text: 'The opportunity to build something better', signals: { archetype: 'MAKER', domain: 'VISION' } },
      { id: 'D', text: "What's at risk if it isn't protected", signals: { archetype: 'GUARDIAN', domain: 'NATURE' } }
    ],
    weight: 2 // This question gets double weight - it's a 4-way diagnostic
  },
  {
    id: 'q9',
    text: 'You feel most yourself when:',
    options: [
      { id: 'A', text: 'Holding boundaries so something vulnerable can grow', signals: { archetype: 'GUARDIAN' } },
      { id: 'B', text: 'Weaving connections between people or ideas', signals: { archetype: 'CONNECTOR' } },
      { id: 'C', text: 'Venturing into territory no one has mapped yet', signals: { archetype: 'EXPLORER' } }
    ]
  },
  {
    id: 'q10',
    text: 'Your natural contribution tends to be:',
    options: [
      { id: 'A', text: 'Helping people see what they couldn't see before', signals: { archetype: 'SAGE', domain: 'HUMAN_BEING' } },
      { id: 'B', text: 'Making sure what matters stays protected', signals: { archetype: 'GUARDIAN', domain: 'LEGACY' } },
      { id: 'C', text: 'Discovering what's possible at the edges', signals: { archetype: 'EXPLORER', domain: 'VISION' } },
      { id: 'D', text: 'Building the infrastructure others need', signals: { archetype: 'MAKER', domain: 'TECHNOLOGY' } }
    ],
    weight: 1.5 // Multi-way question with clear archetype + domain signals
  }

// In-memory aggregates (note: serverless deployments may reset these between invocations)
const STATS = { total: 0, archetype: {}, domain: {}, scale: {} };
const POD_WAITLIST = [];

function tallyStats(formattedPattern) {
  STATS.total += 1;
  STATS.archetype[formattedPattern.archetype] = (STATS.archetype[formattedPattern.archetype] || 0) + 1;
  STATS.domain[formattedPattern.domain] = (STATS.domain[formattedPattern.domain] || 0) + 1;
  STATS.scale[formattedPattern.scale] = (STATS.scale[formattedPattern.scale] || 0) + 1;
}

function podKey(formattedPattern) {
  return `${formattedPattern.archetype}__${formattedPattern.domain}__${formattedPattern.scale}`.replace(/\s+/g,'_');
}

function suggestCrossArchetypePairing(archetype) {
  const pairings = {
    Maker: 'Pair with a Steward to operationalise and finish what you start.',
    Steward: 'Pair with a Maker to prevent stagnation and unlock new paths.',
    Connector: 'Pair with a Sage for depth and clarity in the field you’re weaving.',
    Guardian: 'Pair with an Explorer to avoid rigidity and keep protection life-serving.',
    Explorer: 'Pair with a Guardian to stabilise discoveries into something usable.',
    Sage: 'Pair with a Connector so wisdom travels and becomes shared seeing.'
  };
  return pairings[archetype] || 'Pair strategically across archetypes.';
}

function calculatePattern(responses) {
  const counts = {
    archetype: {},
    domain: {},
    scale: {}
  };
  
  let totalWeight = 0;
  
  // Tally all signals with weighting
  QUESTIONS.forEach(question => {
    const answer = responses[question.id];
    if (!answer) return;
    
    const selectedOption = question.options.find(opt => opt.id === answer);
    if (!selectedOption) return;
    
    const weight = question.weight || 1;
    totalWeight += weight;
    
    const signals = selectedOption.signals;
    
    // Count archetype signals
    if (signals.archetype) {
      counts.archetype[signals.archetype] = (counts.archetype[signals.archetype] || 0) + weight;
    }
    
    // Count domain signals
    if (signals.domain) {
      counts.domain[signals.domain] = (counts.domain[signals.domain] || 0) + weight;
    }
    
    // Count scale signals
    if (signals.scale) {
      counts.scale[signals.scale] = (counts.scale[signals.scale] || 0) + weight;
    }
  });
  
  // Sort and extract top results
  const sortedArchetypes = Object.entries(counts.archetype)
    .sort((a, b) => b[1] - a[1]);
  
  const sortedDomains = Object.entries(counts.domain)
    .sort((a, b) => b[1] - a[1]);
  
  const sortedScales = Object.entries(counts.scale)
    .sort((a, b) => b[1] - a[1]);
  
  // Primary results
  const primaryArchetype = sortedArchetypes[0]?.[0] || 'STEWARD';
  const primaryDomain = sortedDomains[0]?.[0] || 'HUMAN_BEING';
  const primaryScale = sortedScales[0]?.[0] || 'LOCAL';
  
  // Calculate confidence
  const archetypeConfidence = sortedArchetypes[0]?.[1] / totalWeight || 0;
  const domainConfidence = sortedDomains[0]?.[1] / totalWeight || 0;
  
  // Check for blended patterns (close second place)
  const secondArchetype = sortedArchetypes[1];
  const isBlended = secondArchetype && 
    (sortedArchetypes[0][1] - secondArchetype[1]) <= 1; // Within 1 point
  
  return {
    archetype: primaryArchetype,
    domain: primaryDomain,
    scale: primaryScale,
    confidence: Math.round(archetypeConfidence * 100) / 100,
    domainConfidence: Math.round(domainConfidence * 100) / 100,
    isBlended: isBlended,
    secondaryArchetype: isBlended ? secondArchetype[0] : null,
    allScores: {
      archetypes: counts.archetype,
      domains: counts.domain,
      scales: counts.scale
    }
  };
}

function formatPattern(pattern) {
  const archetypes = {
    STEWARD: 'Steward',
    MAKER: 'Maker',
    CONNECTOR: 'Connector',
    GUARDIAN: 'Guardian',
    EXPLORER: 'Explorer',
    SAGE: 'Sage'
  };
  
  const domains = {
    HUMAN_BEING: 'Human Being',
    SOCIETY: 'Society',
    NATURE: 'Nature',
    TECHNOLOGY: 'Technology',
    FINANCE: 'Finance & Economy',
    LEGACY: 'Legacy',
    VISION: 'Vision'
  };
  
  const scales = {
    LOCAL: 'Local',
    BIOREGIONAL: 'Bioregional',
    GLOBAL: 'Global',
    CIVILIZATIONAL: 'Civilizational'
  };
  
  return {
    archetype: archetypes[pattern.archetype],
    domain: domains[pattern.domain],
    scale: scales[pattern.scale],
    secondaryArchetype: pattern.secondaryArchetype ? archetypes[pattern.secondaryArchetype] : null
  };
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  const { action, questionId, responses, email, pattern } = req.body;
  
  try {
    // Phase 2: telemetry for dashboards
    if (action === 'telemetry' && pattern) {
      tallyStats(pattern);
      return res.status(200).json({ ok: true });
    }

    // Phase 2: fetch current aggregate stats (best-effort in-memory)
    if (action === 'stats') {
      return res.status(200).json({ ok: true, stats: STATS });
    }

    // Phase 3: pod connection (MVP waitlist)
    if (action === 'pod') {
      if (!email || !pattern) {
        return res.status(400).json({ error: 'Missing email or pattern' });
      }
      const entry = {
        email,
        pattern,
        pod: podKey(pattern),
        createdAt: new Date().toISOString()
      };
      POD_WAITLIST.push(entry);
      return res.status(200).json({
        ok: true,
        pod: entry.pod,
        message: `You're connected to the ${pattern.archetype} / ${pattern.domain} / ${pattern.scale} pod waitlist. We'll notify you when it's active.`
      });
    }

    // Get next question
    if (action === 'next') {
      const currentIndex = QUESTIONS.findIndex(q => q.id === questionId);
      const nextQuestion = QUESTIONS[currentIndex + 1];
      
      if (nextQuestion) {
        return res.status(200).json({
          question: {
            id: nextQuestion.id,
            text: nextQuestion.text,
            options: nextQuestion.options.map(opt => ({
              id: opt.id,
              text: opt.text
            }))
          },
          progress: {
            current: currentIndex + 2,
            total: QUESTIONS.length
          }
        });
      } else {
        // Quiz complete - calculate pattern
        const pattern = calculatePattern(responses);
        const formatted = formatPattern(pattern);
        tallyStats(formatted);
        
        // Check confidence threshold
        if (pattern.confidence < 0.35) {
          return res.status(200).json({
            status: 'NEEDS_REFINEMENT',
            pattern: formatted,
            confidence: pattern.confidence,
            message: 'Your pattern is blended. We need to refine.',
            topCandidates: [
              formatted.archetype,
              formatted.secondaryArchetype
            ].filter(Boolean),
            pod: podKey(formatted),
            pairingSuggestion: suggestCrossArchetypePairing(formatted.archetype)
          });
        }
        
        return res.status(200).json({
          status: 'COMPLETE',
          pattern: formatted,
          confidence: pattern.confidence,
          isBlended: pattern.isBlended,
          secondaryArchetype: formatted.secondaryArchetype,
          pod: podKey(formatted),
          pairingSuggestion: suggestCrossArchetypePairing(formatted.archetype)
        });
      }
    }
    
    // Get first question
    if (action === 'start' || !action) {
      return res.status(200).json({
        question: {
          id: QUESTIONS[0].id,
          text: QUESTIONS[0].text,
          options: QUESTIONS[0].options.map(opt => ({
            id: opt.id,
            text: opt.text
          }))
        },
        progress: {
          current: 1,
          total: QUESTIONS.length
        }
      });
    }
    
    res.status(400).json({ error: 'Invalid action' });
    
  } catch (error) {
    console.error('Quiz error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
