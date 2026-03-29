// AI Chat Response Engine with Safety Layer
// Mocked local AI — no external API calls

import { APP_CONFIG } from '../constants/config';

interface ParsedInput {
  text: string;
  emotion: string;
  intent: string;
  isDistress: boolean;
}

// Parse user input for emotion and intent
function parseInput(text: string): ParsedInput {
  const lower = text.toLowerCase().trim();

  // Safety check first
  const isDistress = APP_CONFIG.safety.distressKeywords.some(keyword =>
    lower.includes(keyword)
  );

  // Emotion tagging
  let emotion = 'neutral';
  if (/happy|great|good|amazing|awesome|wonderful|excited|glad|proud/.test(lower)) emotion = 'positive';
  else if (/sad|down|depressed|lonely|alone|miss|cry|tear/.test(lower)) emotion = 'sad';
  else if (/anxious|anxiety|nervous|worried|scared|fear|panic|stress/.test(lower)) emotion = 'anxious';
  else if (/angry|mad|frustrated|annoyed|hate|unfair/.test(lower)) emotion = 'angry';
  else if (/tired|exhausted|drain|sleep|fatigue|burnout|overwhelm/.test(lower)) emotion = 'tired';
  else if (/confused|lost|don't know|unsure|stuck|help/.test(lower)) emotion = 'confused';
  else if (/bored|boring|nothing|meh/.test(lower)) emotion = 'bored';

  // Intent classification
  let intent = 'general';
  if (/what should i|suggest|help me|advice|recommend/.test(lower)) intent = 'seeking_advice';
  else if (/thank|thanks|appreciate/.test(lower)) intent = 'gratitude';
  else if (/hi|hello|hey|morning|afternoon|evening/.test(lower)) intent = 'greeting';
  else if (/bye|goodbye|later|night/.test(lower)) intent = 'farewell';
  else if (/can't|unable|impossible|never|won't/.test(lower)) intent = 'negative_self';
  else if (/breathe|calm|relax|ground/.test(lower)) intent = 'calm_tools';
  else if (/school|class|teacher|homework|test|exam|grade/.test(lower)) intent = 'school';

  return { text: lower, emotion, intent, isDistress };
}

// Crisis response
function getCrisisResponse(): string {
  const { crisisResources } = APP_CONFIG.safety;
  return `I hear you, and I want you to know that you matter. What you're feeling is real, and you don't have to go through this alone.\n\n🆘 Please reach out to someone who can help:\n\n📞 ${crisisResources.phoneName}: Call or text ${crisisResources.phone}\n💬 ${crisisResources.name}: ${crisisResources.action}\n\nThese services are free, confidential, and available 24/7. Would you like me to help you contact one of your trusted contacts?`;
}

// Response templates by emotion × intent
const RESPONSES: Record<string, Record<string, string[]>> = {
  positive: {
    general: [
      "That's wonderful to hear! What made today feel good?",
      "I'm glad you're feeling positive! Keep riding that wave. 🌊",
      "Awesome! Would you like to log this mood so you can look back on it later?",
    ],
    greeting: [
      "Hey! You sound like you're in good spirits today! What's the good news?",
      "Hi there! Great to hear from you. Sounds like things are going well!",
    ],
    gratitude: [
      "You're welcome! I'm always here when you need me. 💜",
      "That means a lot! I'm glad I could help.",
    ],
  },
  sad: {
    general: [
      "I'm sorry you're feeling this way. It's okay to feel sad — it doesn't last forever. Want to talk about what's going on?",
      "That sounds tough. Remember, having hard days doesn't make you weak. Would a breathing exercise help right now?",
      "I hear you. Being sad is part of being human. Is there something specific that's weighing on you?",
    ],
    seeking_advice: [
      "When things feel heavy, sometimes the smallest step helps. Could you try one tiny task from your list? Just one — no pressure.",
      "One thing that might help: write down what you're feeling. Getting it out of your head can lighten the weight a bit.",
    ],
    negative_self: [
      "I understand it feels that way right now. But feelings aren't facts — they pass. You've gotten through tough moments before. 💜",
      "It's hard when everything feels impossible. But you reached out to me, and that takes strength. What's one small thing you could do right now?",
    ],
    school: [
      "School stress can feel overwhelming. You don't have to be perfect. What's one thing about school that's bothering you most?",
      "It's okay if school feels hard right now. Everyone learns at their own pace. Would it help to break things into smaller pieces?",
    ],
  },
  anxious: {
    general: [
      "I notice you might be feeling anxious. That's your body trying to protect you, even when there's no real danger. Would you like to try a grounding exercise?",
      "Anxiety can feel really overwhelming. Let's slow things down. Can you take one deep breath with me? Breathe in... and out.",
      "Those anxious feelings are tough. Remember: you've handled hard moments before. What's making you feel worried right now?",
    ],
    calm_tools: [
      "Great idea! The breathing exercise can help calm your nervous system. Would you like to try the 4-4-6 breathing, or the 5-4-3-2-1 grounding technique?",
      "Let's do this together. Try the breathing tool — it only takes a minute and can make a real difference. 🌿",
    ],
    school: [
      "School anxiety is really common — you're not alone in this. What's the specific thing making you anxious? Sometimes naming it helps.",
      "Tests and schoolwork can trigger a lot of anxiety. Remember: a grade doesn't define your worth. Would breaking the task into tiny pieces help?",
    ],
  },
  angry: {
    general: [
      "It sounds like you're frustrated, and that's valid. Your feelings matter. Want to tell me more about what happened?",
      "Anger often tells us something isn't fair or our boundaries were crossed. What's going on?",
      "That sounds really frustrating. Sometimes writing it out helps process the anger. What happened?",
    ],
    school: [
      "That does sound unfair. It's okay to feel angry about it. Have you been able to talk to anyone about this?",
      "School situations can be really frustrating. Your feelings about this are valid. What would help you feel better right now?",
    ],
  },
  tired: {
    general: [
      "Being exhausted makes everything harder. Are you able to rest, even for a few minutes?",
      "It sounds like you need to recharge. That's not being lazy — it's taking care of yourself. What would feel restful right now?",
      "Tiredness can make feelings feel bigger. If you can, try to rest. You deserve a break. 🌙",
    ],
    seeking_advice: [
      "When you're this tired, the best advice is: be gentle with yourself. Can you do one easy task and then rest?",
    ],
  },
  confused: {
    general: [
      "It's okay not to have all the answers. What's on your mind? Sometimes talking it through helps.",
      "Feeling stuck is normal. Let's think about this together. What part feels most confusing?",
    ],
    seeking_advice: [
      "When things feel confusing, try focusing on just the next tiny step. What's one small thing you could figure out right now?",
    ],
  },
  bored: {
    general: [
      "Boredom can actually be a sign you need something meaningful. Have you checked your tasks? There might be something fun there!",
      "Hey, boredom is an opportunity! Would you like to try a task, or would you rather just chat?",
    ],
  },
  neutral: {
    general: [
      "Thanks for sharing. How are you feeling about things today?",
      "I'm here to listen. Tell me more about what's going on.",
      "Got it! Is there anything specific you'd like to talk about or work on?",
    ],
    greeting: [
      "Hey there! How's your day going? I'm here if you need anything. 💜",
      "Hi! Good to see you. How are you feeling today?",
      "Welcome back! Ready for a check-in, or just want to chat?",
    ],
    farewell: [
      "Take care! Remember, I'm here whenever you need me. You're doing great. 💜",
      "Bye for now! I hope the rest of your day goes well. 🌿",
    ],
    calm_tools: [
      "Great choice! Would you like to try the breathing exercise (4-4-6 pattern) or the grounding exercise (5-4-3-2-1)?",
    ],
  },
};

// Get AI response
export function getAIResponse(userMessage: string): { response: string; emotion: string; isDistress: boolean } {
  const parsed = parseInput(userMessage);

  // Crisis response takes absolute priority
  if (parsed.isDistress) {
    return {
      response: getCrisisResponse(),
      emotion: 'distress',
      isDistress: true,
    };
  }

  // Find matching response
  const emotionResponses = RESPONSES[parsed.emotion] || RESPONSES.neutral;
  const intentResponses = emotionResponses[parsed.intent] || emotionResponses.general || RESPONSES.neutral.general;

  const response = intentResponses[Math.floor(Math.random() * intentResponses.length)];

  return {
    response,
    emotion: parsed.emotion,
    isDistress: false,
  };
}

// Quick action suggestions based on mood
export function getQuickActions(emotion: string): Array<{ label: string; action: string }> {
  switch (emotion) {
    case 'anxious':
      return [
        { label: '🌬️ Breathe', action: 'breathing' },
        { label: '🌿 Ground', action: 'grounding' },
        { label: '📝 Journal', action: 'journal' },
      ];
    case 'sad':
      return [
        { label: '💜 Talk more', action: 'talk' },
        { label: '🌬️ Breathe', action: 'breathing' },
        { label: '✅ Easy task', action: 'task' },
      ];
    case 'angry':
      return [
        { label: '🌬️ Breathe', action: 'breathing' },
        { label: '🏃 Move', action: 'movement' },
        { label: '📝 Write it out', action: 'journal' },
      ];
    case 'tired':
      return [
        { label: '🌿 Ground', action: 'grounding' },
        { label: '💧 Water', action: 'hydrate' },
        { label: '😴 Rest', action: 'rest' },
      ];
    default:
      return [
        { label: '🌬️ Breathe', action: 'breathing' },
        { label: '✅ Tasks', action: 'task' },
        { label: '😊 Mood', action: 'mood' },
      ];
  }
}
