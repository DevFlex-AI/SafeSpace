// AI Chat Service — Real OpenAI GPT-4o-mini
// Falls back gracefully if no API key configured

import { APP_CONFIG } from '../constants/config';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  response: string;
  emotion: string;
  isDistress: boolean;
}

// ─── System Prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are SafeSpace — a warm, genuinely caring mental wellness companion for teens and young adults. You're like a trusted older sibling who happens to know a lot about mental health.

Your personality:
- Real and warm, not clinical or robotic
- Short replies (2-4 sentences usually) unless more is needed
- Never use fake enthusiasm or hollow phrases like "That's so great!" 
- Be honest, gentle, curious about the person
- Use light humor when appropriate but never minimize real pain
- Match the user's energy — chill when they're chill, present when they're hurting

What you do:
- Listen and reflect back what you heard
- Ask ONE follow-up question at a time, never a list of questions
- Suggest tools gently (breathing, grounding, urge surfing) — don't push them
- Validate before advising
- Normalize what they're feeling

What you DON'T do:
- Lecture, moralize, or add unsolicited advice  
- Say "I'm just an AI" — you're SafeSpace, their companion
- Use bullet points or formal formatting in casual chat
- Write walls of text

For trichotillomania / hair pulling / picking / urges:
- Be extra gentle, zero judgment
- Normalize it as a sensory/anxiety response
- Suggest the in-app Urge Surfing tool

SAFETY: If the user mentions suicide, self-harm, wanting to die, or is in immediate danger — respond with warm care AND include these resources:
📞 988 Suicide & Crisis Lifeline (call or text 988)
💬 Crisis Text Line: text HOME to 741741
🚨 If immediate danger: call 911

You are NOT a replacement for therapy. Gently encourage professional support when it seems right — once, not repeatedly.`;

// ─── Crisis Keywords ──────────────────────────────────────────────────────────
const CRISIS_KEYWORDS = APP_CONFIG.safety.distressKeywords;

function checkDistress(text: string): boolean {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some(k => lower.includes(k));
}

// ─── Emotion detection (for quick actions + UI tint) ─────────────────────────
function detectEmotion(text: string): string {
  const lower = text.toLowerCase();
  if (/happy|great|good|excited|amazing|love|wonderful|joy|glad|yay/.test(lower)) return 'positive';
  if (/anxious|nervous|worry|scared|fear|panic|stress|overwhelm/.test(lower)) return 'anxious';
  if (/sad|depress|cry|tears|hopeless|empty|numb|grief|miss/.test(lower)) return 'sad';
  if (/angry|mad|furious|pissed|frustrated|rage|hate/.test(lower)) return 'angry';
  if (/tired|exhaust|drain|sleep|no energy|fatigue/.test(lower)) return 'tired';
  if (/urge|pull|pulling|trich|hair pull|pick|picking|fidget/.test(lower)) return 'urge';
  if (/panic|freaking out|losing control/.test(lower)) return 'panic';
  if (/confused|lost|don't know|unsure|stuck/.test(lower)) return 'confused';
  return 'neutral';
}

// ─── Quick actions ────────────────────────────────────────────────────────────
export function getQuickActions(emotion: string): { label: string; action: string }[] {
  switch (emotion) {
    case 'anxious':
    case 'panic':
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
    case 'urge':
      return [
        { label: '🌊 Urge Surfing', action: 'urge' },
        { label: '🌬️ Breathe', action: 'breathing' },
        { label: '🌿 Ground', action: 'grounding' },
      ];
    default:
      return [
        { label: '🌬️ Breathe', action: 'breathing' },
        { label: '✅ Tasks', action: 'task' },
        { label: '😊 Mood', action: 'mood' },
      ];
  }
}

// ─── Fallback responses (when no API key) ─────────────────────────────────────
const FALLBACK_RESPONSES: Record<string, string[]> = {
  positive: [
    "That's genuinely good to hear 💜 What's been going well?",
    "Nice, I'm glad things are looking up. What made today feel good?",
  ],
  anxious: [
    "That sounds really overwhelming. Want to try a quick breathing exercise together?",
    "Anxiety is exhausting. Take a breath — you don't have to figure it all out right now.",
  ],
  sad: [
    "I hear you. That sounds really hard, and your feelings make sense.",
    "It's okay to feel this way. You don't have to explain or fix it right now — I'm just here.",
  ],
  angry: [
    "Yeah, that sounds genuinely frustrating. What happened?",
    "That would make anyone angry. Want to just vent for a bit?",
  ],
  urge: [
    "I'm really glad you said something instead of just sitting with that alone. Want to try the Urge Surfing tool? It usually only takes 90 seconds.",
    "The urge is real but it will peak and pass — it always does. Can I walk you through some hand redirections?",
  ],
  neutral: [
    "I'm here. What's on your mind?",
    "Hey, glad you came. What's going on?",
    "I'm listening. Tell me more.",
  ],
};

function getFallbackResponse(emotion: string): string {
  const pool = FALLBACK_RESPONSES[emotion] || FALLBACK_RESPONSES.neutral;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─── Main API call ─────────────────────────────────────────────────────────────
export async function getAIResponse(
  userMessage: string,
  history: AIMessage[] = []
): Promise<AIResponse> {
  const isDistress = checkDistress(userMessage);
  const emotion = detectEmotion(userMessage);

  const apiKey = process.env.EXPO_PUBLIC_OPENCODE_API_KEY;

  // No API key — use fallback
  if (!apiKey) {
    console.warn('[SafeSpace] No EXPO_PUBLIC_OPENCODE_API_KEY set — using fallback responses');
    if (isDistress) {
      return {
        response: `I hear you, and I'm really glad you told me. Please reach out for immediate support:\n\n📞 **988** — Suicide & Crisis Lifeline (call or text, 24/7)\n💬 **Crisis Text Line** — text HOME to 741741\n🚨 If you're in immediate danger, call **911**\n\nYou matter, and you don't have to go through this alone.`,
        emotion: 'distress',
        isDistress: true,
      };
    }
    return {
      response: getFallbackResponse(emotion),
      emotion,
      isDistress: false,
    };
  }

  // Build messages array
  const messages: AIMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-12), // last 6 turns (12 messages) for context
    { role: 'user', content: userMessage },
  ];

  try {
    const res = await fetch('https://opencode.ai/zen/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'big-pickle',
        messages,
        max_tokens: 300,
        temperature: 0.85,
        presence_penalty: 0.3,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[SafeSpace] OpenAI error:', res.status, errText);
      throw new Error(`OpenAI ${res.status}`);
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim() ?? getFallbackResponse(emotion);

    return {
      response: reply,
      emotion: isDistress ? 'distress' : emotion,
      isDistress,
    };
  } catch (err) {
    console.error('[SafeSpace] AI call failed, using fallback:', err);
    return {
      response: getFallbackResponse(emotion),
      emotion,
      isDistress: false,
    };
  }
}
