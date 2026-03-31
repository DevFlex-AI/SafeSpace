// SafeSpace Database Service — All Supabase CRUD operations
import { getSupabaseClient } from '@/template';
import { MoodEntry, Task, ChatMessage, TrustedContact } from './mockData';
import { TASK_POOL, MOOD_OPTIONS, generateDailyTasks } from './mockData';

const supabase = getSupabaseClient();

// ---- USER STATS ----
export interface UserStats {
  user_id: string;
  level: number;
  xp: number;
  total_xp: number;
  streak: number;
  longest_streak: number;
  tasks_completed: number;
  mood_entries: number;
  last_active_date: string;
}

export async function fetchUserStats(userId: string): Promise<UserStats | null> {
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) {
    // If not found, create it
    if (error.code === 'PGRST116') {
      const { data: created } = await supabase
        .from('user_stats')
        .insert({ user_id: userId })
        .select()
        .single();
      return created;
    }
    return null;
  }
  return data;
}

export async function updateUserStats(userId: string, updates: Partial<UserStats>) {
  const { error } = await supabase
    .from('user_stats')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
  return { error };
}

// ---- USER SETTINGS ----
export interface UserSettings {
  user_id: string;
  dark_mode: boolean;
  text_size: number;
  reduced_motion: boolean;
  notifications: boolean;
  mood_reminders: boolean;
  task_reminders: boolean;
}

export async function fetchUserSettings(userId: string): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error && error.code === 'PGRST116') {
    const { data: created } = await supabase
      .from('user_settings')
      .insert({ user_id: userId })
      .select()
      .single();
    return created;
  }
  return data;
}

export async function updateUserSettings(userId: string, updates: Partial<UserSettings>) {
  const { error } = await supabase
    .from('user_settings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
  return { error };
}

// ---- MOODS ----
export async function fetchMoods(userId: string, limit = 60): Promise<MoodEntry[]> {
  const { data, error } = await supabase
    .from('moods')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) return [];
  return (data || []).map(m => ({
    id: m.id,
    value: m.value,
    label: m.label,
    emoji: m.emoji,
    note: m.note || '',
    timestamp: m.created_at,
    date: m.date,
  }));
}

export async function insertMood(userId: string, value: number, note: string) {
  const option = MOOD_OPTIONS.find(m => m.value === value);
  if (!option) return { error: 'Invalid mood value' };
  const { data, error } = await supabase
    .from('moods')
    .insert({
      user_id: userId,
      value: option.value,
      label: option.label,
      emoji: option.emoji,
      note,
      date: new Date().toISOString().split('T')[0],
    })
    .select()
    .single();
  return { data, error };
}

// ---- TASKS ----
export async function fetchTodayTasks(userId: string): Promise<Task[]> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .order('created_at', { ascending: true });
  if (error || !data || data.length === 0) return [];
  return data.map(t => ({
    id: t.id,
    title: t.title,
    description: t.description || '',
    category: t.category as Task['category'],
    xp: t.xp,
    completed: t.completed,
    difficulty: (t.difficulty || 'easy') as Task['difficulty'],
    icon: t.icon || '',
  }));
}

export async function generateAndInsertTasks(userId: string, count = 5): Promise<Task[]> {
  const today = new Date().toISOString().split('T')[0];
  const localTasks = generateDailyTasks(count);
  const inserts = localTasks.map(t => ({
    user_id: userId,
    title: t.title,
    description: t.description,
    category: t.category,
    xp: t.xp,
    completed: false,
    difficulty: t.difficulty,
    icon: t.icon,
    date: today,
  }));
  const { data, error } = await supabase
    .from('tasks')
    .insert(inserts)
    .select();
  if (error || !data) return localTasks;
  return data.map(t => ({
    id: t.id,
    title: t.title,
    description: t.description || '',
    category: t.category as Task['category'],
    xp: t.xp,
    completed: t.completed,
    difficulty: (t.difficulty || 'easy') as Task['difficulty'],
    icon: t.icon || '',
  }));
}

export async function completeTaskDB(taskId: string) {
  const { error } = await supabase
    .from('tasks')
    .update({ completed: true })
    .eq('id', taskId);
  return { error };
}

// ---- CHAT MESSAGES ----
export async function fetchMessages(userId: string, limit = 100): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) return [];
  return (data || []).map(m => ({
    id: m.id,
    content: m.content,
    sender: m.sender as 'user' | 'ai',
    timestamp: m.created_at,
    emotion: m.emotion || undefined,
  }));
}

export async function insertMessage(userId: string, content: string, sender: 'user' | 'ai', emotion?: string) {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      user_id: userId,
      content,
      sender,
      emotion: emotion || 'neutral',
    })
    .select()
    .single();
  return { data, error };
}

// ---- CONTACTS ----
export async function fetchContacts(userId: string): Promise<TrustedContact[]> {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) return [];
  return (data || []).map(c => ({
    id: c.id,
    name: c.name,
    relationship: c.relationship || '',
    phone: c.phone || '',
    isEmergency: c.is_emergency || false,
  }));
}

export async function insertContact(userId: string, contact: Omit<TrustedContact, 'id'>) {
  const { data, error } = await supabase
    .from('contacts')
    .insert({
      user_id: userId,
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      is_emergency: contact.isEmergency,
    })
    .select()
    .single();
  return { data, error };
}

export async function deleteContact(contactId: string) {
  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', contactId);
  return { error };
}

// ---- STREAK LOGIC ----
export async function calculateStreak(userId: string): Promise<{ streak: number; longest: number }> {
  const { data } = await supabase
    .from('moods')
    .select('date')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (!data || data.length === 0) return { streak: 0, longest: 0 };

  const uniqueDates = [...new Set(data.map(d => d.date))].sort().reverse();
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < uniqueDates.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    const expectedStr = expected.toISOString().split('T')[0];
    if (uniqueDates.includes(expectedStr)) {
      streak++;
    } else break;
  }

  // Calculate longest
  let longest = 1;
  let current = 1;
  const sorted = [...uniqueDates].sort();
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (Math.round(diff) === 1) {
      current++;
      if (current > longest) longest = current;
    } else {
      current = 1;
    }
  }
  if (uniqueDates.length === 0) longest = 0;

  return { streak, longest: Math.max(longest, streak) };
}
