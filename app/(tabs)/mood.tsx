// Mood Screen — Mood tracking, history, weekly insights
import React, { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInDown, FadeIn, useSharedValue, useAnimatedStyle, withSpring,
} from 'react-native-reanimated';
import theme from '../../constants/theme';
import { useApp } from '../../contexts/AppContext';
import { MOOD_OPTIONS } from '../../services/mockData';

export default function MoodScreen() {
  const insets = useSafeAreaInsets();
  const { moodHistory, addMoodEntry, todayMood, weeklyAverage } = useApp();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [showInput, setShowInput] = useState(false);

  const last7Days = moodHistory.slice(-7);
  const last30 = moodHistory.slice(-30);

  // Mood distribution
  const distribution = MOOD_OPTIONS.map(opt => ({
    ...opt,
    count: last30.filter(m => m.value === opt.value).length,
    percentage: last30.length > 0
      ? Math.round((last30.filter(m => m.value === opt.value).length / last30.length) * 100)
      : 0,
  }));

  const handleSelectMood = (value: number) => {
    Haptics.selectionAsync();
    setSelectedMood(value);
    setShowInput(true);
  };

  const handleSaveMood = () => {
    if (selectedMood === null) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addMoodEntry(selectedMood, note);
    setSelectedMood(null);
    setNote('');
    setShowInput(false);
  };

  // Streak — consecutive days with mood entries
  const uniqueDates = [...new Set(moodHistory.map(m => m.date))].sort().reverse();
  let moodStreak = 0;
  const today = new Date();
  for (let i = 0; i < uniqueDates.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    const expectedStr = expected.toISOString().split('T')[0];
    if (uniqueDates.includes(expectedStr)) {
      moodStreak++;
    } else break;
  }

  // Today's entries
  const todayStr = new Date().toISOString().split('T')[0];
  const todayEntries = moodHistory.filter(m => m.date === todayStr);

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <Text style={styles.pageTitle}>Mood</Text>
          <View style={styles.streakBadge}>
            <MaterialIcons name="emoji-events" size={18} color={theme.warm} />
            <Text style={styles.streakText}>{moodStreak} day streak</Text>
          </View>
        </Animated.View>

        {/* Mood Input */}
        <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.section}>
          <View style={styles.moodInputCard}>
            <Text style={styles.moodInputTitle}>How are you feeling?</Text>
            <Text style={styles.moodInputSub}>Tap to log your mood</Text>

            <View style={styles.moodGrid}>
              {MOOD_OPTIONS.map((option) => {
                const isSelected = selectedMood === option.value;
                return (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.moodBtn,
                      isSelected && { backgroundColor: option.color + '25', borderColor: option.color, borderWidth: 2 },
                    ]}
                    onPress={() => handleSelectMood(option.value)}
                  >
                    <Text style={styles.moodBtnEmoji}>{option.emoji}</Text>
                    <Text style={[
                      styles.moodBtnLabel,
                      isSelected && { color: option.color, fontWeight: '700' },
                    ]}>{option.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            {showInput && (
              <Animated.View entering={FadeIn.duration(300)} style={styles.noteSection}>
                <TextInput
                  style={styles.noteInput}
                  value={note}
                  onChangeText={setNote}
                  placeholder="Add a note (optional)..."
                  placeholderTextColor={theme.textMuted}
                  multiline
                  maxLength={200}
                />
                <Pressable style={styles.saveBtn} onPress={handleSaveMood}>
                  <Text style={styles.saveBtnText}>Save Mood</Text>
                  <MaterialIcons name="check" size={20} color="#FFF" />
                </Pressable>
              </Animated.View>
            )}
          </View>
        </Animated.View>

        {/* Weekly Chart */}
        <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.weekCard}>
            <View style={styles.weekBarRow}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                const entry = last7Days[i];
                const height = entry ? (entry.value / 5) * 64 : 6;
                const color = entry
                  ? MOOD_OPTIONS.find(m => m.value === entry.value)?.color || theme.border
                  : theme.border;
                return (
                  <View key={`${day}-${i}`} style={styles.weekBarCol}>
                    {entry && (
                      <Text style={styles.weekBarEmoji}>
                        {MOOD_OPTIONS.find(m => m.value === entry.value)?.emoji}
                      </Text>
                    )}
                    <View style={[styles.weekBar, { height, backgroundColor: color }]} />
                    <Text style={styles.weekBarLabel}>{day}</Text>
                  </View>
                );
              })}
            </View>
            {weeklyAverage > 0 && (
              <View style={styles.avgRow}>
                <Text style={styles.avgLabel}>Average mood</Text>
                <View style={styles.avgValue}>
                  <Text style={{ fontSize: 18 }}>
                    {MOOD_OPTIONS.find(m => m.value === Math.round(weeklyAverage))?.emoji}
                  </Text>
                  <Text style={styles.avgText}>
                    {MOOD_OPTIONS.find(m => m.value === Math.round(weeklyAverage))?.label}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Mood Distribution */}
        <Animated.View entering={FadeInDown.duration(500).delay(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>Mood Patterns</Text>
          <View style={styles.distCard}>
            {distribution.map((item) => (
              <View key={item.value} style={styles.distRow}>
                <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
                <View style={styles.distBarWrap}>
                  <View style={styles.distBarBg}>
                    <View
                      style={[styles.distBarFill, { width: `${Math.max(item.percentage, 2)}%`, backgroundColor: item.color }]}
                    />
                  </View>
                  <Text style={styles.distLabel}>{item.label}</Text>
                </View>
                <Text style={styles.distPercent}>{item.percentage}%</Text>
              </View>
            ))}
            {last30.length === 0 && (
              <View style={styles.emptyDist}>
                <Image
                  source={require('../../assets/images/mood-empty.png')}
                  style={{ width: 160, height: 120 }}
                  contentFit="contain"
                />
                <Text style={styles.emptyDistText}>Log moods to see patterns</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Today's Log */}
        <Animated.View entering={FadeInDown.duration(500).delay(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Entries</Text>
          {todayEntries.length > 0 ? (
            todayEntries.map((entry) => (
              <View key={entry.id} style={styles.entryCard}>
                <View style={[styles.entryEmojiBg, { backgroundColor: MOOD_OPTIONS.find(m => m.value === entry.value)?.color + '20' }]}>
                  <Text style={{ fontSize: 24 }}>{entry.emoji}</Text>
                </View>
                <View style={styles.entryInfo}>
                  <Text style={styles.entryLabel}>{entry.label}</Text>
                  {entry.note ? <Text style={styles.entryNote}>{entry.note}</Text> : null}
                  <Text style={styles.entryTime}>
                    {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noEntries}>
              <MaterialIcons name="schedule" size={24} color={theme.textMuted} />
              <Text style={styles.noEntriesText}>No entries today yet</Text>
            </View>
          )}
        </Animated.View>

        {/* Insight */}
        {weeklyAverage > 0 && (
          <Animated.View entering={FadeInDown.duration(500).delay(500)} style={styles.section}>
            <LinearGradient
              colors={['#EDE9FE', '#F3E8FF']}
              style={styles.insightCard}
            >
              <MaterialIcons name="lightbulb-outline" size={24} color={theme.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.insightTitle}>Weekly Insight</Text>
                <Text style={styles.insightText}>
                  {weeklyAverage >= 4
                    ? "You've been feeling great this week! Keep up the positive habits that are working for you."
                    : weeklyAverage >= 3
                    ? "Your week has been mixed. That's completely normal. Try focusing on what made the good days feel good."
                    : "This week has been tough. Remember, it's okay to ask for help. Consider talking to someone you trust."}
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.warmSoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    gap: 4,
  },
  streakText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.warmDark,
  },

  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 12,
  },

  // Mood Input
  moodInputCard: {
    backgroundColor: theme.surface,
    borderRadius: theme.radius.xl,
    padding: 24,
    shadowColor: theme.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  moodInputTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.textPrimary,
    textAlign: 'center',
  },
  moodInputSub: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  moodGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodBtn: {
    alignItems: 'center',
    padding: 10,
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 58,
    gap: 6,
  },
  moodBtnEmoji: {
    fontSize: 32,
  },
  moodBtnLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.textSecondary,
  },

  // Note
  noteSection: {
    marginTop: 16,
    gap: 12,
  },
  noteInput: {
    backgroundColor: theme.backgroundSecondary,
    borderRadius: theme.radius.md,
    padding: 14,
    fontSize: 15,
    color: theme.textPrimary,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primary,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    gap: 8,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },

  // Week Chart
  weekCard: {
    backgroundColor: theme.surface,
    borderRadius: theme.radius.lg,
    padding: 20,
    shadowColor: theme.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  weekBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 110,
  },
  weekBarCol: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    gap: 4,
  },
  weekBarEmoji: {
    fontSize: 14,
  },
  weekBar: {
    width: 20,
    borderRadius: 10,
    minHeight: 6,
  },
  weekBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textMuted,
    marginTop: 4,
  },
  avgRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.borderLight,
    paddingTop: 14,
    marginTop: 14,
  },
  avgLabel: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  avgValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avgText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.textPrimary,
  },

  // Distribution
  distCard: {
    backgroundColor: theme.surface,
    borderRadius: theme.radius.lg,
    padding: 20,
    shadowColor: theme.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    gap: 14,
  },
  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  distBarWrap: {
    flex: 1,
    gap: 4,
  },
  distBarBg: {
    height: 10,
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 5,
    overflow: 'hidden',
  },
  distBarFill: {
    height: 10,
    borderRadius: 5,
  },
  distLabel: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  distPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.textPrimary,
    width: 36,
    textAlign: 'right',
  },
  emptyDist: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  emptyDistText: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 8,
  },

  // Entries
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: theme.radius.md,
    padding: 14,
    marginBottom: 8,
    gap: 12,
    shadowColor: theme.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  entryEmojiBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryInfo: {
    flex: 1,
  },
  entryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  entryNote: {
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: 2,
  },
  entryTime: {
    fontSize: 12,
    color: theme.textMuted,
    marginTop: 4,
  },
  noEntries: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.backgroundSecondary,
    borderRadius: theme.radius.md,
    padding: 20,
    gap: 8,
  },
  noEntriesText: {
    fontSize: 14,
    color: theme.textMuted,
  },

  // Insight
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: theme.radius.lg,
    padding: 18,
    gap: 12,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.primaryDark,
    marginBottom: 4,
  },
  insightText: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
  },
});
