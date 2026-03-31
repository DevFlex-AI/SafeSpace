// SafeSpace App Configuration

export const APP_CONFIG = {
  name: 'SafeSpace',
  version: '1.1.0',
  description: 'Your calm companion for daily emotional support',

  // Chat
  chat: {
    maxMessagesPerDay: 50,
    typingDelay: 800,
    maxMessageLength: 500,
  },

  // Tasks
  tasks: {
    dailyTaskCount: 5,
    xpPerTask: 15,
    xpPerStreak: 25,
    xpPerLevel: 100,
    streakBonusThreshold: 3,
  },

  // Mood
  mood: {
    maxDailyEntries: 10,
    weeklyGoal: 5,
  },

  // Breathing
  breathing: {
    inhaleSeconds: 4,
    holdSeconds: 4,
    exhaleSeconds: 6,
    defaultCycles: 4,
  },

  // Grounding (5-4-3-2-1 technique)
  grounding: {
    steps: [
      { count: 5, sense: 'SEE', instruction: 'Name 5 things you can see', icon: 'visibility' },
      { count: 4, sense: 'TOUCH', instruction: 'Name 4 things you can touch', icon: 'touch-app' },
      { count: 3, sense: 'HEAR', instruction: 'Name 3 things you can hear', icon: 'hearing' },
      { count: 2, sense: 'SMELL', instruction: 'Name 2 things you can smell', icon: 'air' },
      { count: 1, sense: 'TASTE', instruction: 'Name 1 thing you can taste', icon: 'restaurant' },
    ],
  },

  // Safety keywords for escalation (expanded for comprehensive coverage)
  safety: {
    distressKeywords: [
      'hurt myself', 'kill myself', 'suicide', 'self harm', 'don\'t want to live',
      'end it all', 'no point', 'want to die', 'cutting', 'overdose',
      'better off dead', 'can\'t go on', 'not worth living', 'hurt me', 'kill me',
      'end it', 'make it stop', 'permanent solution', 'say goodbye', 'final',
    ],
    crisisResources: {
      name: 'Crisis Text Line',
      action: 'Text HOME to 741741',
      phone: '988',
      phoneName: 'Suicide & Crisis Lifeline',
    },
    // Emergency services
    emergency: {
      primary: '911',
      description: 'Emergency Services',
      requiresConfirmation: true,
    },
  },

  // Sensory monitoring for autism/habit interruption
  sensory: {
    enabled: true,
    defaultSensitivity: 'medium',
    interventionDelayMs: 2000,
    cooldownMs: 30000,
  },

  // Accessibility
  accessibility: {
    defaultTextScale: 1.0,
    largeTextScale: 1.3,
    reducedMotion: false,
    highContrast: false,
  },

  // Professional system prompt for AI
  systemPrompt: {
    role: 'Professional Mental Wellness Companion',
    tone: 'Empathetic, clinically-informed, supportive',
    boundaries: [
      'I am not a licensed therapist, but I can provide support and resources',
      'If someone is in crisis, I will prioritize connecting them with professional help',
      'I acknowledge emotions without judgment',
      'I encourage professional help when appropriate',
      'I respect user autonomy and never lecture',
    ],
  },
};

export default APP_CONFIG;
