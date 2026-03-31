// AI Chat Response Engine with Safety Layer
// Professional, clinically-informed responses with comprehensive safety
// Mocked local AI — no external API calls

import { APP_CONFIG } from '../constants/config';

interface ParsedInput {
  text: string;
  emotion: string;
  intent: string;
  isDistress: boolean;
}

// Professional system prompt
export const SYSTEM_PROMPT = `
You are SafeSpace, a Professional Crisis Counselor and mental wellness companion designed to provide 
empathetic, clinically-informed support. Your role:

1. ACTIVE LISTENING: Reflect understanding before problem-solving
2. EMOTIONAL VALIDATION: Acknowledge feelings without judgment
3. PERSONALIZED RESPONSES: Tailor your tone to the user's emotional state
4. SAFETY FIRST: Recognize crisis indicators and provide appropriate resources immediately
5. ENCOURAGE AUTONOMY: Support user agency, never lecture or dictate
6. CULTURAL SENSITIVITY: Be inclusive and respectful of diverse backgrounds
7. CRISIS STABILIZATION: Use professional counseling techniques to de-escalate distress

BOUNDARIES:
- I am a professional AI companion, but not a replacement for a human therapist
- If someone is in crisis, I prioritize connecting them with professional help and stay with them
- I acknowledge emotions without judgment
- I encourage professional help when appropriate
- I respect user autonomy and never lecture

Remember: Your goal is to make the user feel safe, heard, supported, and empowered.
`.trim();

// Crisis response
function getCrisisResponse(): string {
  const { crisisResources, emergency } = APP_CONFIG.safety;
  return `I hear you, and I want you to know that you matter deeply. What you're experiencing feels real and important, and you don't have to face this alone.\n\n🆘 **You deserve immediate support:**\n\n📞 **${crisisResources.phoneName}**: Call or text **${crisisResources.phone}** (24/7, free)\n💬 **${crisisResources.name}**: ${crisisResources.action}\n🚨 **Emergency**: If you're in immediate danger, call **${emergency.primary}**\n\nYou're not alone in this. Would you like me to help you take the next step?`;
}

// Response templates by emotion × intent
const RESPONSES: Record<string, Record<string, string[]>> = {
  positive: {
    general: [
      "That's wonderful to hear! What made today feel good?",
      "I'm glad you're feeling positive! Keep riding that wave. 🌊",
      "That's a great moment to celebrate. Would you like to log this mood?",
      "I'm genuinely happy for you! These positive moments matter. Would you like to share more?",
    ],
    greeting: [
      "Hey! You sound like you're in good spirits today! What's the good news?",
      "Hi there! Great to hear from you. Sounds like things are going well!",
      "Hello! I'm so glad you're here. What's been making you feel good?",
    ],
    gratitude: [
      "You're welcome! I'm always here when you need me. 💜",
      "That means a lot! I'm glad I could help.",
      "It's my honor to be here for you. Thank you for sharing.",
    ],
    seeking_advice: [
      "That's great that you're looking to build on this positive energy! What would help you make the most of it?",
    ],
  },
  sad: {
    general: [
      "I'm here with you. What you're feeling matters, and it's completely valid. Would you like to share more?",
      "I hear the heaviness in your words. Being sad is a human experience, and you don't have to carry it alone. Let's talk.",
      "Thank you for trusting me with this. Would it help to explore what's contributing to these feelings?",
    ],
    seeking_advice: [
      "When things feel heavy, sometimes the smallest step helps. Could you try one tiny task from your list? Just one — no pressure.",
      "One thing that might help: write down what you're feeling. Getting it out of your head can lighten the weight a bit.",
      "I notice you're looking for some support. What has helped you get through difficult times before?",
    ],
    negative_self: [
      "I understand it feels that way right now. But feelings aren't facts — they pass. You've gotten through tough moments before. 💜",
      "It's hard when everything feels impossible. But you reached out to me, and that takes strength. What's one small thing you could do right now?",
      "That negative self-talk isn't telling the whole story. You reached out, which shows real courage. I'm proud of you for that.",
    ],
    school: [
      "School stress can feel overwhelming. You don't have to be perfect. What's one thing about school that's bothering you most?",
      "It's okay if school feels hard right now. Everyone learns at their own pace. Would it help to break things into smaller pieces?",
      "Academic pressure is real and valid. What part feels most challenging right now?",
    ],
    overwhelmed: [
      "It sounds like you're carrying a lot right now. Let's take it one step at a time. What's the most immediate thing on your mind?",
      "When everything feels like too much, it's okay to pause. Would you like to try a grounding exercise together?",
      "I hear that overwhelm. Taking a breath and breaking things down can help. What feels most pressing?",
    ],
  },
  anxious: {
    general: [
      "I notice you might be feeling anxious. That's your body's way of trying to protect you, even when there's no immediate danger. Would you like to try a grounding exercise?",
      "Anxiety can feel really overwhelming. Let's slow things down together. Can you take one deep breath with me?",
      "Thank you for sharing what's worrying you. Anxiety often feels bigger when we keep it inside. I'm here to listen.",
    ],
    calm_tools: [
      "Great idea! The breathing exercise can help calm your nervous system. Would you like to try the 4-4-6 breathing, or the 5-4-3-2-1 grounding technique?",
      "Let's do this together. Try the breathing tool — it only takes a minute and can make a real difference. 🌿",
      "I love that you're taking initiative. Would you like to try box breathing (4-4-4-4) or the 5-4-3-2-1 exercise?",
    ],
    school: [
      "School anxiety is really common — you're not alone in this. What's the specific thing making you anxious? Sometimes naming it helps.",
      "Tests and schoolwork can trigger a lot of anxiety. Remember: a grade doesn't define your worth. Would breaking the task into tiny pieces help?",
      "Academic anxiety is valid. What's the worst-case scenario you're imagining, and how likely is it really?",
    ],
    panic: [
      "I'm here. Let's work through this together. Can you name 5 things you can see right now?",
      "Panic feels terrifying, but it's not dangerous — it's your body being very protective. Let's slow your breathing together.",
      "You're safe right now. Let's try the 5-4-3-2-1 grounding technique together. What's one thing you can touch?",
    ],
  },
  angry: {
    general: [
      "It sounds like you're frustrated, and that's valid. Your feelings matter. Want to tell me more about what happened?",
      "Anger often tells us something isn't fair or our boundaries were crossed. What's going on?",
      "I hear the frustration in your words. It's okay to feel angry. Would you like to talk through it?",
    ],
    school: [
      "That does sound unfair. It's okay to feel angry about it. Have you been able to talk to anyone about this?",
      "School situations can be really frustrating. Your feelings about this are valid. What would help you feel better right now?",
    ],
    relationships: [
      "Relationship conflicts can be really draining. What happened from your perspective?",
      "I'm here to support you without judgment. What would feel most helpful right now — venting or problem-solving?",
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
      "Rest is productive too. Your wellbeing matters more than productivity. Would you like me to help you take a break?",
    ],
    burnout: [
      "It sounds like you might be experiencing burnout. This is your body telling you to slow down. What can you let go of, even temporarily?",
      "Burnout is real and it deserves real rest. I'm concerned about you. Would you like to explore what boundaries might help?",
    ],
  },
  confused: {
    general: [
      "It's okay not to have all the answers. What's on your mind? Sometimes talking it through helps.",
      "Feeling stuck is normal. Let's think about this together. What part feels most confusing?",
      "Confusion is often the first step toward clarity. Would you like to break this down together?",
    ],
    seeking_advice: [
      "When things feel confusing, try focusing on just the next tiny step. What's one small thing you could figure out right now?",
      "Let's simplify. What feels most important to figure out first?",
    ],
  },
  bored: {
    general: [
      "Boredom can actually be a sign you need something meaningful. Have you checked your tasks? There might be something fun there!",
      "Hey, boredom is an opportunity! Would you like to try a task, or would you rather just chat?",
      "Sometimes boredom is our mind asking for something new. Would you like some suggestions for how to shake things up?",
    ],
  },
  neutral: {
    general: [
      "Thanks for sharing. How are you feeling about things today?",
      "I'm here to listen. Tell me more about what's going on.",
      "Got it! Is there anything specific you'd like to talk about or work on?",
      "I'm here for whatever you need — whether that'schat, a task, or just some company.",
    ],
    greeting: [
      "Hey there! How's your day going? I'm here if you need anything. 💜",
      "Hi! Good to see you. How are you feeling today?",
      "Welcome back! Ready for a check-in, or just want to chat?",
      "Hello! It's good to connect with you. What's on your mind?",
    ],
    farewell: [
      "Take care! Remember, I'm here whenever you need me. You're doing great. 💜",
      "Bye for now! I hope the rest of your day goes well. 🌿",
      "Sending you positive vibes until we chat again. You've got this! ✨",
    ],
    calm_tools: [
      "Great choice! Would you like to try the breathing exercise (4-4-6 pattern) or the grounding exercise (5-4-3-2-1)?",
      "Let's find some calm together. Which exercise calls to you — breathing or grounding?",
    ],
  },
};

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
  else if (/overwhelm|too much|can't cope/.test(lower)) emotion = 'overwhelmed';
  else if (/panic|freaking out|losing control/.test(lower)) emotion = 'panic';
  else if (/relationship|friends|family| boyfriend| girlfriend|parents/.test(lower)) emotion = 'relationships';

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
export function getQuickActions(emotion: string): { label: string; action: string }[] {
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
