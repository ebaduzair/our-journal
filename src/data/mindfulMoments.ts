// Calm Together - Breathing exercises
export const breathingExercises = [
  {
    id: 'box-breathing',
    name: 'Box Breathing',
    description: 'Breathe together in a calming square pattern',
    instructions: ['Breathe in for 4 seconds', 'Hold for 4 seconds', 'Breathe out for 4 seconds', 'Hold for 4 seconds'],
    duration: 60, // seconds
    emoji: '🫧',
  },
  {
    id: '478-breathing',
    name: '4-7-8 Relaxation',
    description: 'A powerful technique to calm anxiety quickly',
    instructions: ['Breathe in for 4 seconds', 'Hold for 7 seconds', 'Breathe out for 8 seconds'],
    duration: 57,
    emoji: '🌬️',
  },
  {
    id: 'sync-breathing',
    name: 'Sync Breathing',
    description: 'Match your breathing with your partner',
    instructions: ['Hold hands', 'One partner leads', 'Breathe in slowly together', 'Breathe out slowly together'],
    duration: 120,
    emoji: '💞',
  },
];

// Grounding exercises for couples
export const groundingExercises = [
  {
    id: '5-4-3-2-1',
    name: '5-4-3-2-1 Together',
    description: 'Ground yourselves by exploring your senses together',
    steps: [
      { sense: 'See', count: 5, prompt: 'Name 5 things you can see right now' },
      { sense: 'Touch', count: 4, prompt: 'Name 4 things you can touch' },
      { sense: 'Hear', count: 3, prompt: 'Name 3 things you can hear' },
      { sense: 'Smell', count: 2, prompt: 'Name 2 things you can smell' },
      { sense: 'Taste', count: 1, prompt: 'Name 1 thing you can taste' },
    ],
    emoji: '🌍',
  },
  {
    id: 'hold-me',
    name: 'Hold & Ground',
    description: 'Physical connection to bring you back to the present',
    steps: [
      { sense: 'Connect', count: 1, prompt: 'Hold each other close' },
      { sense: 'Feel', count: 1, prompt: 'Focus on their heartbeat' },
      { sense: 'Breathe', count: 1, prompt: 'Match your breathing' },
      { sense: 'Stay', count: 1, prompt: 'Stay present for 2 minutes' },
    ],
    emoji: '🤗',
  },
];

// Couple affirmations for overthinking
export const coupleAffirmations = [
  "We are a team, and we face challenges together.",
  "Our love is stronger than any worry or doubt.",
  "I trust my partner, and I trust our relationship.",
  "This moment of anxiety will pass. Our love remains.",
  "We communicate openly and honestly with each other.",
  "I choose to focus on the love we share, not my fears.",
  "My partner loves me for who I am.",
  "Together, we can overcome anything.",
  "I release my need to control and trust the process.",
  "Our relationship is safe, and I am supported.",
  "I am worthy of this love, exactly as I am.",
  "We grow stronger through challenges, not weaker.",
];

// Reality check questions
export const realityCheckQuestions = [
  {
    id: 'evidence',
    question: 'What evidence do I have for this worry?',
    placeholder: 'List any facts that support this thought...',
  },
  {
    id: 'likelihood',
    question: 'How likely is this to actually happen?',
    type: 'scale',
  },
  {
    id: 'worstCase',
    question: 'What\'s the worst that could realistically happen?',
    placeholder: 'Be honest but realistic...',
  },
  {
    id: 'copingPlan',
    question: 'If it did happen, how would we handle it together?',
    placeholder: 'Think about your strengths as a couple...',
  },
];

// Reframe prompts for worry journal
export const reframePrompts = [
  "What would your partner say about this worry?",
  "Is there another way to look at this situation?",
  "What advice would you give a friend with this worry?",
  "What's something positive that could come from this?",
  "Will this matter in 5 years?",
];

// Default reassurance messages
export const defaultReassurances = [
  "I love you more than words can say.",
  "You are my safe place, always.",
  "Nothing could ever change how I feel about you.",
  "We're in this together, no matter what.",
  "You are enough, exactly as you are.",
  "I choose you, today and every day.",
  "Your worries are valid, but so is our love.",
  "I'm here for you, always.",
];
