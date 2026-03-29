// SafeSpace Mock Data & Service Layer

export interface MoodEntry {
  id: string;
  value: number; // 1-5
  label: string;
  emoji: string;
  note: string;
  timestamp: string;
  date: string; // YYYY-MM-DD
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: 'self-care' | 'social' | 'movement' | 'mindfulness' | 'learning' | 'kindness';
  xp: number;
  completed: boolean;
  difficulty: 'easy' | 'medium';
  icon: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
  emotion?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  level: number;
  xp: number;
  totalXp: number;
  streak: number;
  longestStreak: number;
  tasksCompleted: number;
  moodEntries: number;
  joinedDate: string;
  settings: {
    darkMode: boolean;
    textSize: number;
    reducedMotion: boolean;
    notifications: boolean;
    moodReminders: boolean;
    taskReminders: boolean;
  };
}

export interface TrustedContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isEmergency: boolean;
}

// Mood options
export const MOOD_OPTIONS = [
  { value: 5, label: 'Great', emoji: '😊', color: '#6BC5A0' },
  { value: 4, label: 'Good', emoji: '🙂', color: '#87CEEB' },
  { value: 3, label: 'Okay', emoji: '😐', color: '#F2D06B' },
  { value: 2, label: 'Low', emoji: '😔', color: '#F2A977' },
  { value: 1, label: 'Bad', emoji: '😢', color: '#E88B8B' },
];

// Task pools by category
export const TASK_POOL: Omit<Task, 'id' | 'completed'>[] = [
  // Self-care
  { title: 'Drink a glass of water', description: 'Hydrate your body and mind', category: 'self-care', xp: 10, difficulty: 'easy', icon: 'local-drink' },
  { title: 'Take 3 deep breaths', description: 'Pause and breathe slowly', category: 'self-care', xp: 10, difficulty: 'easy', icon: 'air' },
  { title: 'Wash your face', description: 'A small refresh can feel big', category: 'self-care', xp: 10, difficulty: 'easy', icon: 'face' },
  { title: 'Eat a healthy snack', description: 'Fuel your body with something good', category: 'self-care', xp: 15, difficulty: 'easy', icon: 'restaurant' },
  { title: 'Stretch for 2 minutes', description: 'Release tension in your muscles', category: 'self-care', xp: 15, difficulty: 'easy', icon: 'accessibility-new' },

  // Social
  { title: 'Text someone you care about', description: 'A simple hello goes a long way', category: 'social', xp: 15, difficulty: 'easy', icon: 'chat' },
  { title: 'Give someone a compliment', description: 'Spread a little kindness', category: 'social', xp: 15, difficulty: 'medium', icon: 'favorite' },
  { title: 'Say good morning to someone', description: 'Start the day with connection', category: 'social', xp: 10, difficulty: 'easy', icon: 'wb-sunny' },
  { title: 'Share how you feel with someone', description: 'Being open takes courage', category: 'social', xp: 20, difficulty: 'medium', icon: 'people' },

  // Movement
  { title: 'Walk for 5 minutes', description: 'Move your body, clear your mind', category: 'movement', xp: 15, difficulty: 'easy', icon: 'directions-walk' },
  { title: 'Do 5 jumping jacks', description: 'Quick burst of energy', category: 'movement', xp: 10, difficulty: 'easy', icon: 'fitness-center' },
  { title: 'Dance to one song', description: 'Let loose and have fun', category: 'movement', xp: 15, difficulty: 'easy', icon: 'music-note' },
  { title: 'Stand up and stretch', description: 'Your body will thank you', category: 'movement', xp: 10, difficulty: 'easy', icon: 'self-improvement' },

  // Mindfulness
  { title: 'Try the breathing exercise', description: 'Calm your nervous system', category: 'mindfulness', xp: 20, difficulty: 'easy', icon: 'spa' },
  { title: 'Do the grounding exercise', description: 'Come back to the present', category: 'mindfulness', xp: 20, difficulty: 'medium', icon: 'grass' },
  { title: 'Close your eyes for 1 minute', description: 'Give your mind a tiny break', category: 'mindfulness', xp: 10, difficulty: 'easy', icon: 'visibility-off' },
  { title: 'Listen to calming sounds', description: 'Let the sounds wash over you', category: 'mindfulness', xp: 15, difficulty: 'easy', icon: 'headphones' },
  { title: 'Notice 3 things around you', description: 'Be present in this moment', category: 'mindfulness', xp: 10, difficulty: 'easy', icon: 'remove-red-eye' },

  // Learning
  { title: 'Read for 5 minutes', description: 'Feed your curiosity', category: 'learning', xp: 15, difficulty: 'easy', icon: 'menu-book' },
  { title: 'Write down 1 thing you learned', description: 'Reflect on your growth', category: 'learning', xp: 15, difficulty: 'medium', icon: 'edit' },
  { title: 'Watch something educational', description: 'Learn something new today', category: 'learning', xp: 15, difficulty: 'easy', icon: 'play-circle-outline' },

  // Kindness
  { title: 'Say something kind to yourself', description: 'You deserve kindness too', category: 'kindness', xp: 15, difficulty: 'medium', icon: 'favorite-border' },
  { title: 'Tidy one small space', description: 'A clean space helps a calm mind', category: 'kindness', xp: 15, difficulty: 'easy', icon: 'cleaning-services' },
  { title: 'Help someone with something', description: 'Helping others helps us too', category: 'kindness', xp: 20, difficulty: 'medium', icon: 'volunteer-activism' },
];

// Generate daily tasks
export function generateDailyTasks(count: number = 5): Task[] {
  const shuffled = [...TASK_POOL].sort(() => Math.random() - 0.5);
  const categories = new Set<string>();
  const selected: Task[] = [];

  for (const task of shuffled) {
    if (selected.length >= count) break;
    if (categories.size < 4 && categories.has(task.category) && shuffled.length > count) continue;
    categories.add(task.category);
    selected.push({
      ...task,
      id: `task-${Date.now()}-${selected.length}`,
      completed: false,
    });
  }

  return selected;
}

// Past week mood data (mock)
export function generateMockMoodHistory(): MoodEntry[] {
  const entries: MoodEntry[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const value = Math.floor(Math.random() * 5) + 1;
    const option = MOOD_OPTIONS.find(m => m.value === value)!;

    entries.push({
      id: `mood-${i}`,
      value: option.value,
      label: option.label,
      emoji: option.emoji,
      note: i === 0 ? '' : ['Felt productive', 'Had a tough morning', 'Good day at school', 'Felt tired', 'Relaxed today', 'A bit anxious', 'Went for a walk'][i],
      timestamp: date.toISOString(),
      date: date.toISOString().split('T')[0],
    });
  }

  return entries;
}

// Default user profile
export const DEFAULT_PROFILE: UserProfile = {
  id: 'user-1',
  name: 'Student',
  level: 3,
  xp: 45,
  totalXp: 345,
  streak: 4,
  longestStreak: 7,
  tasksCompleted: 23,
  moodEntries: 12,
  joinedDate: '2024-12-01',
  settings: {
    darkMode: false,
    textSize: 1.0,
    reducedMotion: false,
    notifications: true,
    moodReminders: true,
    taskReminders: true,
  },
};

// Default contacts
export const DEFAULT_CONTACTS: TrustedContact[] = [
  { id: 'c1', name: 'School Counselor', relationship: 'Counselor', phone: '555-0100', isEmergency: true },
  { id: 'c2', name: 'Mom', relationship: 'Parent', phone: '555-0101', isEmergency: true },
];

// Chat welcome messages
export const WELCOME_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-1',
    content: "Hi there! I'm here whenever you need to talk. How are you feeling today?",
    sender: 'ai',
    timestamp: new Date().toISOString(),
  },
];

// Category metadata
export const TASK_CATEGORIES = {
  'self-care': { label: 'Self Care', color: '#8B7EC8', icon: 'spa' },
  'social': { label: 'Social', color: '#87CEEB', icon: 'people' },
  'movement': { label: 'Movement', color: '#6BC5A0', icon: 'directions-walk' },
  'mindfulness': { label: 'Mindfulness', color: '#B8ADE8', icon: 'self-improvement' },
  'learning': { label: 'Learning', color: '#F2D06B', icon: 'menu-book' },
  'kindness': { label: 'Kindness', color: '#F2A977', icon: 'favorite' },
};
