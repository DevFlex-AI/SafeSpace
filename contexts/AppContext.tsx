// SafeSpace Global State — Fullstack with Supabase + local cache
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  MoodEntry, Task, ChatMessage, TrustedContact,
  MOOD_OPTIONS, WELCOME_MESSAGES,
} from '../services/mockData';
import { APP_CONFIG } from '../constants/config';
import {
  fetchUserStats, updateUserStats, UserStats,
  fetchUserSettings, updateUserSettings, UserSettings,
  fetchMoods, insertMood,
  fetchTodayTasks, generateAndInsertTasks, completeTaskDB,
  fetchMessages, insertMessage,
  fetchContacts, insertContact, deleteContact,
  calculateStreak,
} from '../services/database';
import { useAuth } from '@/template';

interface ProfileState {
  name: string;
  level: number;
  xp: number;
  totalXp: number;
  streak: number;
  longestStreak: number;
  tasksCompleted: number;
  moodEntries: number;
  settings: {
    darkMode: boolean;
    textSize: number;
    reducedMotion: boolean;
    notifications: boolean;
    moodReminders: boolean;
    taskReminders: boolean;
  };
}

interface AppState {
  profile: ProfileState;
  updateProfile: (updates: Partial<ProfileState>) => void;
  updateSettings: (updates: Partial<ProfileState['settings']>) => void;
  moodHistory: MoodEntry[];
  addMoodEntry: (value: number, note: string) => void;
  todayMood: MoodEntry | null;
  weeklyAverage: number;
  dailyTasks: Task[];
  completeTask: (taskId: string) => void;
  refreshTasks: () => void;
  completedToday: number;
  messages: ChatMessage[];
  addMessage: (content: string, sender: 'user' | 'ai', emotion?: string) => void;
  clearChat: () => void;
  contacts: TrustedContact[];
  addContact: (contact: Omit<TrustedContact, 'id'>) => void;
  removeContact: (id: string) => void;
  addXp: (amount: number) => void;
  isLoaded: boolean;
  newStreak: number | null;
  dismissStreak: () => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

const DEFAULT_PROFILE: ProfileState = {
  name: 'Student',
  level: 1,
  xp: 0,
  totalXp: 0,
  streak: 0,
  longestStreak: 0,
  tasksCompleted: 0,
  moodEntries: 0,
  settings: {
    darkMode: false,
    textSize: 1.0,
    reducedMotion: false,
    notifications: true,
    moodReminders: true,
    taskReminders: true,
  },
};

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileState>(DEFAULT_PROFILE);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [dailyTasks, setDailyTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>(WELCOME_MESSAGES);
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [newStreak, setNewStreak] = useState<number | null>(null);

  // Load all data when user authenticates
  useEffect(() => {
    if (!user) {
      setIsLoaded(false);
      return;
    }
    loadAllData(user.id);
  }, [user?.id]);

  const loadAllData = async (userId: string) => {
    try {
      const [stats, settings, moods, tasks, msgs, userContacts] = await Promise.all([
        fetchUserStats(userId),
        fetchUserSettings(userId),
        fetchMoods(userId),
        fetchTodayTasks(userId),
        fetchMessages(userId),
        fetchContacts(userId),
      ]);

      // Profile from stats + settings
      if (stats) {
        setProfile(prev => ({
          ...prev,
          name: user?.username || user?.email?.split('@')[0] || 'Student',
          level: stats.level,
          xp: stats.xp,
          totalXp: stats.total_xp,
          streak: stats.streak,
          longestStreak: stats.longest_streak,
          tasksCompleted: stats.tasks_completed,
          moodEntries: stats.mood_entries,
        }));
      } else {
        setProfile(prev => ({
          ...prev,
          name: user?.username || user?.email?.split('@')[0] || 'Student',
        }));
      }

      if (settings) {
        setProfile(prev => ({
          ...prev,
          settings: {
            darkMode: settings.dark_mode,
            textSize: settings.text_size,
            reducedMotion: settings.reduced_motion,
            notifications: settings.notifications,
            moodReminders: settings.mood_reminders,
            taskReminders: settings.task_reminders,
          },
        }));
      }

      setMoodHistory(moods);

      // Generate tasks if none today
      if (tasks.length > 0) {
        setDailyTasks(tasks);
      } else {
        const newTasks = await generateAndInsertTasks(userId);
        setDailyTasks(newTasks);
      }

      if (msgs.length > 0) {
        setMessages(msgs);
      } else {
        // Insert welcome message
        await insertMessage(userId, WELCOME_MESSAGES[0].content, 'ai');
        setMessages(WELCOME_MESSAGES);
      }

      setContacts(userContacts);
      setIsLoaded(true);
    } catch (e) {
      console.error('Error loading data:', e);
      setIsLoaded(true);
    }
  };

  const updateProfile = useCallback((updates: Partial<ProfileState>) => {
    setProfile(prev => ({ ...prev, ...updates }));
    if (user && updates.name) {
      // Could update user_profiles username
    }
  }, [user]);

  const updateSettingsHandler = useCallback((updates: Partial<ProfileState['settings']>) => {
    setProfile(prev => ({ ...prev, settings: { ...prev.settings, ...updates } }));
    if (user) {
      const dbUpdates: Record<string, any> = {};
      if ('darkMode' in updates) dbUpdates.dark_mode = updates.darkMode;
      if ('reducedMotion' in updates) dbUpdates.reduced_motion = updates.reducedMotion;
      if ('notifications' in updates) dbUpdates.notifications = updates.notifications;
      if ('moodReminders' in updates) dbUpdates.mood_reminders = updates.moodReminders;
      if ('taskReminders' in updates) dbUpdates.task_reminders = updates.taskReminders;
      if ('textSize' in updates) dbUpdates.text_size = updates.textSize;
      if (Object.keys(dbUpdates).length > 0) {
        updateUserSettings(user.id, dbUpdates);
      }
    }
  }, [user]);

  // Mood
  const addMoodEntry = useCallback((value: number, note: string) => {
    const option = MOOD_OPTIONS.find(m => m.value === value)!;
    const entry: MoodEntry = {
      id: `mood-${Date.now()}`,
      value: option.value,
      label: option.label,
      emoji: option.emoji,
      note,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
    };
    setMoodHistory(prev => [...prev, entry]);
    setProfile(prev => ({ ...prev, moodEntries: prev.moodEntries + 1 }));

    if (user) {
      insertMood(user.id, value, note).then(async () => {
        // Recalculate streak
        const { streak, longest } = await calculateStreak(user.id);
        setProfile(prev => {
          const updated = { ...prev, streak, longestStreak: Math.max(prev.longestStreak, longest) };
          return updated;
        });
        updateUserStats(user.id, {
          streak,
          longest_streak: Math.max(profile.longestStreak, longest),
          mood_entries: profile.moodEntries + 1,
          last_active_date: new Date().toISOString().split('T')[0],
        });

        // Check if we should celebrate
        const milestones = [3, 7, 14, 30, 60, 100];
        if (milestones.includes(streak)) {
          setNewStreak(streak);
        }
      });
    }
  }, [user, profile]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayMood = moodHistory.filter(m => m.date === todayStr).slice(-1)[0] || null;
  const last7 = moodHistory.filter(m => {
    const d = new Date(m.timestamp);
    const now = new Date();
    return now.getTime() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
  });
  const weeklyAverage = last7.length > 0 ? last7.reduce((sum, m) => sum + m.value, 0) / last7.length : 0;

  // Tasks
  const completeTaskHandler = useCallback((taskId: string) => {
    setDailyTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, completed: true } : t
    ));
    setProfile(prev => ({ ...prev, tasksCompleted: prev.tasksCompleted + 1 }));

    if (user) {
      completeTaskDB(taskId);
      updateUserStats(user.id, {
        tasks_completed: profile.tasksCompleted + 1,
      });
    }
  }, [user, profile]);

  const refreshTasks = useCallback(async () => {
    if (user) {
      const newTasks = await generateAndInsertTasks(user.id);
      setDailyTasks(newTasks);
    }
  }, [user]);

  const completedToday = dailyTasks.filter(t => t.completed).length;

  // Chat
  const addMessageHandler = useCallback((content: string, sender: 'user' | 'ai', emotion?: string) => {
    const msg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      content,
      sender,
      timestamp: new Date().toISOString(),
      emotion,
    };
    setMessages(prev => [...prev, msg]);

    if (user) {
      insertMessage(user.id, content, sender, emotion);
    }
  }, [user]);

  const clearChat = useCallback(() => {
    setMessages(WELCOME_MESSAGES);
  }, []);

  // Contacts
  const addContactHandler = useCallback((contact: Omit<TrustedContact, 'id'>) => {
    const tempId = `contact-${Date.now()}`;
    setContacts(prev => [...prev, { ...contact, id: tempId }]);

    if (user) {
      insertContact(user.id, contact).then(({ data }) => {
        if (data) {
          setContacts(prev => prev.map(c =>
            c.id === tempId ? { ...c, id: data.id } : c
          ));
        }
      });
    }
  }, [user]);

  const removeContactHandler = useCallback((id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    deleteContact(id);
  }, []);

  // XP
  const addXp = useCallback((amount: number) => {
    setProfile(prev => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      const xpPerLevel = APP_CONFIG.tasks.xpPerLevel;
      while (newXp >= xpPerLevel) {
        newXp -= xpPerLevel;
        newLevel += 1;
      }
      const updated = {
        ...prev,
        xp: newXp,
        totalXp: prev.totalXp + amount,
        level: newLevel,
      };
      if (user) {
        updateUserStats(user.id, {
          xp: newXp,
          total_xp: prev.totalXp + amount,
          level: newLevel,
        });
      }
      return updated;
    });
  }, [user]);

  const dismissStreak = useCallback(() => {
    setNewStreak(null);
  }, []);

  return (
    <AppContext.Provider value={{
      profile, updateProfile, updateSettings: updateSettingsHandler,
      moodHistory, addMoodEntry, todayMood, weeklyAverage,
      dailyTasks, completeTask: completeTaskHandler, refreshTasks, completedToday,
      messages, addMessage: addMessageHandler, clearChat,
      contacts, addContact: addContactHandler, removeContact: removeContactHandler,
      addXp,
      isLoaded,
      newStreak,
      dismissStreak,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
