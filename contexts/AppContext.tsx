// SafeSpace Global State — Context + AsyncStorage
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  MoodEntry, Task, ChatMessage, UserProfile, TrustedContact,
  generateDailyTasks, generateMockMoodHistory, DEFAULT_PROFILE,
  DEFAULT_CONTACTS, WELCOME_MESSAGES, MOOD_OPTIONS,
} from '../services/mockData';
import { APP_CONFIG } from '../constants/config';

interface AppState {
  // Profile
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateSettings: (updates: Partial<UserProfile['settings']>) => void;

  // Mood
  moodHistory: MoodEntry[];
  addMoodEntry: (value: number, note: string) => void;
  todayMood: MoodEntry | null;
  weeklyAverage: number;

  // Tasks
  dailyTasks: Task[];
  completeTask: (taskId: string) => void;
  refreshTasks: () => void;
  completedToday: number;

  // Chat
  messages: ChatMessage[];
  addMessage: (content: string, sender: 'user' | 'ai', emotion?: string) => void;
  clearChat: () => void;

  // Contacts
  contacts: TrustedContact[];
  addContact: (contact: Omit<TrustedContact, 'id'>) => void;
  removeContact: (id: string) => void;

  // XP & Streaks
  addXp: (amount: number) => void;

  // State
  isLoaded: boolean;
}

const AppContext = createContext<AppState | undefined>(undefined);

const STORAGE_KEYS = {
  profile: 'safespace_profile',
  moods: 'safespace_moods',
  tasks: 'safespace_tasks',
  taskDate: 'safespace_task_date',
  messages: 'safespace_messages',
  contacts: 'safespace_contacts',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [dailyTasks, setDailyTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>(WELCOME_MESSAGES);
  const [contacts, setContacts] = useState<TrustedContact[]>(DEFAULT_CONTACTS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from AsyncStorage
  useEffect(() => {
    async function load() {
      try {
        const [profileData, moodData, taskData, taskDateData, msgData, contactData] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.profile),
          AsyncStorage.getItem(STORAGE_KEYS.moods),
          AsyncStorage.getItem(STORAGE_KEYS.tasks),
          AsyncStorage.getItem(STORAGE_KEYS.taskDate),
          AsyncStorage.getItem(STORAGE_KEYS.messages),
          AsyncStorage.getItem(STORAGE_KEYS.contacts),
        ]);

        if (profileData) setProfile(JSON.parse(profileData));
        if (contactData) setContacts(JSON.parse(contactData));

        // Mood — load or generate mock
        if (moodData) {
          setMoodHistory(JSON.parse(moodData));
        } else {
          const mockMoods = generateMockMoodHistory();
          setMoodHistory(mockMoods);
        }

        // Messages
        if (msgData) {
          setMessages(JSON.parse(msgData));
        }

        // Tasks — check if today's tasks exist
        const today = new Date().toISOString().split('T')[0];
        if (taskDateData === today && taskData) {
          setDailyTasks(JSON.parse(taskData));
        } else {
          const newTasks = generateDailyTasks(5);
          setDailyTasks(newTasks);
          await AsyncStorage.setItem(STORAGE_KEYS.taskDate, today);
        }
      } catch (e) {
        // Fallback to defaults
        setMoodHistory(generateMockMoodHistory());
        setDailyTasks(generateDailyTasks(5));
      }
      setIsLoaded(true);
    }
    load();
  }, []);

  // Persist on changes
  useEffect(() => {
    if (isLoaded) AsyncStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
  }, [profile, isLoaded]);

  useEffect(() => {
    if (isLoaded) AsyncStorage.setItem(STORAGE_KEYS.moods, JSON.stringify(moodHistory));
  }, [moodHistory, isLoaded]);

  useEffect(() => {
    if (isLoaded) AsyncStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(dailyTasks));
  }, [dailyTasks, isLoaded]);

  useEffect(() => {
    if (isLoaded) AsyncStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages));
  }, [messages, isLoaded]);

  useEffect(() => {
    if (isLoaded) AsyncStorage.setItem(STORAGE_KEYS.contacts, JSON.stringify(contacts));
  }, [contacts, isLoaded]);

  // Profile
  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  }, []);

  const updateSettings = useCallback((updates: Partial<UserProfile['settings']>) => {
    setProfile(prev => ({ ...prev, settings: { ...prev.settings, ...updates } }));
  }, []);

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
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayMood = moodHistory.filter(m => m.date === todayStr).slice(-1)[0] || null;

  const last7 = moodHistory.filter(m => {
    const d = new Date(m.timestamp);
    const now = new Date();
    return now.getTime() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
  });
  const weeklyAverage = last7.length > 0 ? last7.reduce((sum, m) => sum + m.value, 0) / last7.length : 0;

  // Tasks
  const completeTask = useCallback((taskId: string) => {
    setDailyTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, completed: true } : t
    ));
    setProfile(prev => ({ ...prev, tasksCompleted: prev.tasksCompleted + 1 }));
  }, []);

  const refreshTasks = useCallback(() => {
    const newTasks = generateDailyTasks(5);
    setDailyTasks(newTasks);
    AsyncStorage.setItem(STORAGE_KEYS.taskDate, new Date().toISOString().split('T')[0]);
  }, []);

  const completedToday = dailyTasks.filter(t => t.completed).length;

  // Chat
  const addMessage = useCallback((content: string, sender: 'user' | 'ai', emotion?: string) => {
    const msg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      content,
      sender,
      timestamp: new Date().toISOString(),
      emotion,
    };
    setMessages(prev => [...prev, msg]);
  }, []);

  const clearChat = useCallback(() => {
    setMessages(WELCOME_MESSAGES);
  }, []);

  // Contacts
  const addContact = useCallback((contact: Omit<TrustedContact, 'id'>) => {
    const newContact: TrustedContact = {
      ...contact,
      id: `contact-${Date.now()}`,
    };
    setContacts(prev => [...prev, newContact]);
  }, []);

  const removeContact = useCallback((id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
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

      return {
        ...prev,
        xp: newXp,
        totalXp: prev.totalXp + amount,
        level: newLevel,
      };
    });
  }, []);

  return (
    <AppContext.Provider value={{
      profile, updateProfile, updateSettings,
      moodHistory, addMoodEntry, todayMood, weeklyAverage,
      dailyTasks, completeTask, refreshTasks, completedToday,
      messages, addMessage, clearChat,
      contacts, addContact, removeContact,
      addXp,
      isLoaded,
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
