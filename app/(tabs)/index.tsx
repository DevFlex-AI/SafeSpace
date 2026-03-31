// Home Screen — Daily hub with mood check, calm tools, task preview, streak celebration
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing,
  FadeInDown,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import theme from '../../constants/theme';
import { useApp } from '../../contexts/AppContext';
import { MOOD_OPTIONS } from '../../services/mockData';
import StreakCelebration from '../../components/StreakCelebration';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function ProgressRing({ progress, size = 80, strokeWidth = 6, color = theme.primary, trackColor = theme.border }: {
  progress: number; size?: number; strokeWidth?: number; color?: string; trackColor?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - Math.min(progress, 1) * circumference;
  return (
    <Svg width={size} height={size}>
      <Circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
      <Circle
        cx={size / 2} cy={size / 2} r={radius}
        stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={`${circumference}`} strokeDashoffset={strokeDashoffset}
        strokeLinecap="round" fill="none" rotation="-90" origin={`${size / 2},${size / 2}`}
      />
    </Svg>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    profile, todayMood, dailyTasks, completedToday, addMoodEntry,
    weeklyAverage, moodHistory, newStreak, dismissStreak,
  } = useApp();
  const [showMoodPicker, setShowMoodPicker] = useState(false);

  const floatAnim = useSharedValue(0);
  useEffect(() => {
    floatAnim.value = withRepeat(
      withTiming(8, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1, true
    );
  }, []);
  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatAnim.value }],
  }));

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const taskProgress = dailyTasks.length > 0 ? completedToday / dailyTasks.length : 0;
  const recentMoods = moodHistory.slice(-7);

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {/* Streak Celebration Modal */}
      <StreakCelebration
        visible={newStreak !== null}
        streak={newStreak || 0}
        onDismiss={dismissStreak}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.name}>{profile.name}</Text>
          </View>
          <Pressable style={styles.streakBadge} onPress={() => Haptics.selectionAsync()}>
            <MaterialIcons name="local-fire-department" size={20} color={theme.warm} />
            <Text style={styles.streakText}>{profile.streak}</Text>
          </Pressable>
        </Animated.View>

        {/* Hero — Mood Check-in */}
        <Animated.View entering={FadeInDown.duration(600).delay(100)}>
          {!todayMood && !showMoodPicker ? (
            <Pressable onPress={() => { Haptics.selectionAsync(); setShowMoodPicker(true); }}>
              <LinearGradient
                colors={['#E8E4F0', '#F0EDF8']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.moodCheckCard}
              >
                <Animated.View style={floatStyle}>
                  <Image source={require('../../assets/images/home-hero.png')} style={styles.heroImage} contentFit="cover" />
                </Animated.View>
                <Text style={styles.moodCheckTitle}>How are you feeling?</Text>
                <Text style={styles.moodCheckSub}>Tap to check in</Text>
              </LinearGradient>
            </Pressable>
          ) : showMoodPicker && !todayMood ? (
            <View style={styles.moodPickerCard}>
              <Text style={styles.moodPickerTitle}>How are you feeling right now?</Text>
              <View style={styles.moodGrid}>
                {MOOD_OPTIONS.map((option) => (
                  <Pressable
                    key={option.value}
                    style={styles.moodOption}
                    onPress={() => {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      addMoodEntry(option.value, '');
                      setShowMoodPicker(false);
                    }}
                  >
                    <View style={[styles.moodEmojiCircle, { backgroundColor: option.color + '20' }]}>
                      <Text style={styles.moodEmoji}>{option.emoji}</Text>
                    </View>
                    <Text style={styles.moodLabel}>{option.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            <LinearGradient
              colors={[todayMood ? MOOD_OPTIONS.find(m => m.value === todayMood.value)!.color + '30' : '#E8E4F0', '#F8F6FF']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.moodDoneCard}
            >
              <View style={styles.moodDoneLeft}>
                <Text style={{ fontSize: 42 }}>{todayMood?.emoji}</Text>
              </View>
              <View style={styles.moodDoneRight}>
                <Text style={styles.moodDoneLabel}>Today you feel</Text>
                <Text style={styles.moodDoneValue}>{todayMood?.label}</Text>
                <Text style={styles.moodDoneSub}>
                  Logged at {new Date(todayMood?.timestamp || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </LinearGradient>
          )}
        </Animated.View>

        {/* Quick Calm Tools */}
        <Animated.View entering={FadeInDown.duration(600).delay(200)} style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Calm</Text>
          <View style={styles.calmRow}>
            <Pressable style={[styles.calmCard, { backgroundColor: '#EDE9FE' }]} onPress={() => { Haptics.selectionAsync(); router.push('/breathing'); }}>
              <MaterialIcons name="air" size={32} color={theme.primary} />
              <Text style={styles.calmLabel}>Breathe</Text>
              <Text style={styles.calmSub}>4-4-6 pattern</Text>
            </Pressable>
            <Pressable style={[styles.calmCard, { backgroundColor: '#D1FAE5' }]} onPress={() => { Haptics.selectionAsync(); router.push('/grounding'); }}>
              <MaterialIcons name="grass" size={32} color={theme.accent} />
              <Text style={styles.calmLabel}>Ground</Text>
              <Text style={styles.calmSub}>5-4-3-2-1</Text>
            </Pressable>
            <Pressable style={[styles.calmCard, { backgroundColor: '#FEF3C7' }]} onPress={() => { Haptics.selectionAsync(); router.push('/(tabs)/chat'); }}>
              <MaterialIcons name="chat-bubble-outline" size={32} color={theme.warm} />
              <Text style={styles.calmLabel}>Talk</Text>
              <Text style={styles.calmSub}>Chat now</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* Tasks Preview */}
        <Animated.View entering={FadeInDown.duration(600).delay(300)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Tasks</Text>
            <Pressable onPress={() => router.push('/(tabs)/tasks')}><Text style={styles.seeAll}>See all</Text></Pressable>
          </View>
          <View style={styles.taskProgressRow}>
            <ProgressRing progress={taskProgress} size={60} strokeWidth={5} color={theme.accent} />
            <View style={styles.taskProgressInfo}>
              <Text style={styles.taskProgressValue}>{completedToday}/{dailyTasks.length}</Text>
              <Text style={styles.taskProgressLabel}>tasks completed</Text>
            </View>
            <View style={styles.xpBadge}>
              <MaterialIcons name="star" size={16} color={theme.accent} />
              <Text style={styles.xpText}>+{completedToday * 15} XP</Text>
            </View>
          </View>
          {dailyTasks.slice(0, 3).map((task) => (
            <Pressable key={task.id} style={[styles.taskItem, task.completed && styles.taskItemDone]} onPress={() => router.push('/(tabs)/tasks')}>
              <View style={[styles.taskCheck, task.completed && styles.taskCheckDone]}>
                {task.completed ? <MaterialIcons name="check" size={14} color="#FFF" /> : null}
              </View>
              <Text style={[styles.taskTitle, task.completed && styles.taskTitleDone]}>{task.title}</Text>
              <Text style={styles.taskXp}>+{task.xp}</Text>
            </Pressable>
          ))}
        </Animated.View>

        {/* Weekly Mood Trend */}
        <Animated.View entering={FadeInDown.duration(600).delay(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>This Week's Mood</Text>
          <View style={styles.moodTrendCard}>
            <View style={styles.moodBarRow}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                const entry = recentMoods[i];
                const height = entry ? (entry.value / 5) * 60 : 8;
                const color = entry ? MOOD_OPTIONS.find(m => m.value === entry.value)?.color || theme.border : theme.border;
                return (
                  <View key={day} style={styles.moodBarCol}>
                    <View style={[styles.moodBar, { height, backgroundColor: color }]} />
                    <Text style={styles.moodBarLabel}>{day}</Text>
                  </View>
                );
              })}
            </View>
            <View style={styles.weeklyAvgRow}>
              <Text style={styles.weeklyAvgLabel}>Weekly average</Text>
              <Text style={styles.weeklyAvgValue}>
                {weeklyAverage > 0 ? MOOD_OPTIONS.find(m => m.value === Math.round(weeklyAverage))?.emoji : '—'}{' '}
                {weeklyAverage > 0 ? MOOD_OPTIONS.find(m => m.value === Math.round(weeklyAverage))?.label : 'No data'}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Level Card */}
        <Animated.View entering={FadeInDown.duration(600).delay(500)} style={styles.section}>
          <LinearGradient colors={['#B8ADE8', '#8B7EC8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.levelCard}>
            <View style={styles.levelLeft}>
              <Text style={styles.levelLabel}>LEVEL</Text>
              <Text style={styles.levelValue}>{profile.level}</Text>
            </View>
            <View style={styles.levelRight}>
              <View style={styles.xpBarBg}>
                <View style={[styles.xpBarFill, { width: `${(profile.xp / 100) * 100}%` }]} />
              </View>
              <Text style={styles.xpBarText}>{profile.xp}/100 XP to next level</Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  greeting: { fontSize: 14, fontWeight: '500', color: theme.textSecondary },
  name: { fontSize: 24, fontWeight: '700', color: theme.textPrimary, marginTop: 2 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.warmSoft, paddingHorizontal: 14, paddingVertical: 8, borderRadius: theme.radius.full, gap: 4 },
  streakText: { fontSize: 16, fontWeight: '700', color: theme.warmDark },
  moodCheckCard: { marginHorizontal: 20, marginTop: 8, borderRadius: theme.radius.xl, padding: 24, alignItems: 'center', overflow: 'hidden' },
  heroImage: { width: SCREEN_WIDTH - 80, height: 120, borderRadius: theme.radius.lg, marginBottom: 16 },
  moodCheckTitle: { fontSize: 20, fontWeight: '700', color: theme.textPrimary },
  moodCheckSub: { fontSize: 14, color: theme.textSecondary, marginTop: 4 },
  moodPickerCard: { marginHorizontal: 20, marginTop: 8, backgroundColor: theme.surface, borderRadius: theme.radius.xl, padding: 24, shadowColor: theme.shadowColor, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  moodPickerTitle: { fontSize: 18, fontWeight: '600', color: theme.textPrimary, textAlign: 'center', marginBottom: 20 },
  moodGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  moodOption: { alignItems: 'center', gap: 8 },
  moodEmojiCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  moodEmoji: { fontSize: 28 },
  moodLabel: { fontSize: 12, fontWeight: '600', color: theme.textSecondary },
  moodDoneCard: { marginHorizontal: 20, marginTop: 8, borderRadius: theme.radius.xl, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16 },
  moodDoneLeft: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' },
  moodDoneRight: { flex: 1 },
  moodDoneLabel: { fontSize: 13, color: theme.textSecondary, fontWeight: '500' },
  moodDoneValue: { fontSize: 24, fontWeight: '700', color: theme.textPrimary, marginTop: 2 },
  moodDoneSub: { fontSize: 12, color: theme.textMuted, marginTop: 2 },
  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: theme.textPrimary, marginBottom: 12 },
  seeAll: { fontSize: 14, fontWeight: '600', color: theme.primary, marginBottom: 12 },
  calmRow: { flexDirection: 'row', gap: 12 },
  calmCard: { flex: 1, borderRadius: theme.radius.lg, padding: 16, alignItems: 'center', gap: 8 },
  calmLabel: { fontSize: 14, fontWeight: '600', color: theme.textPrimary },
  calmSub: { fontSize: 11, color: theme.textSecondary },
  taskProgressRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderRadius: theme.radius.lg, padding: 16, marginBottom: 12, gap: 14, shadowColor: theme.shadowColor, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  taskProgressInfo: { flex: 1 },
  taskProgressValue: { fontSize: 24, fontWeight: '700', color: theme.textPrimary },
  taskProgressLabel: { fontSize: 13, color: theme.textSecondary },
  xpBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.accentSoft, paddingHorizontal: 10, paddingVertical: 6, borderRadius: theme.radius.full, gap: 4 },
  xpText: { fontSize: 13, fontWeight: '600', color: theme.accentDark },
  taskItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderRadius: theme.radius.md, padding: 14, marginBottom: 8, gap: 12 },
  taskItemDone: { opacity: 0.6 },
  taskCheck: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: theme.border, alignItems: 'center', justifyContent: 'center' },
  taskCheckDone: { backgroundColor: theme.accent, borderColor: theme.accent },
  taskTitle: { flex: 1, fontSize: 15, fontWeight: '500', color: theme.textPrimary },
  taskTitleDone: { textDecorationLine: 'line-through', color: theme.textMuted },
  taskXp: { fontSize: 13, fontWeight: '600', color: theme.accent },
  moodTrendCard: { backgroundColor: theme.surface, borderRadius: theme.radius.lg, padding: 20, shadowColor: theme.shadowColor, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  moodBarRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 80, marginBottom: 12 },
  moodBarCol: { alignItems: 'center', justifyContent: 'flex-end', flex: 1, gap: 6 },
  moodBar: { width: 24, borderRadius: 12, minHeight: 8 },
  moodBarLabel: { fontSize: 11, fontWeight: '500', color: theme.textMuted },
  weeklyAvgRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.borderLight, paddingTop: 12 },
  weeklyAvgLabel: { fontSize: 13, color: theme.textSecondary },
  weeklyAvgValue: { fontSize: 14, fontWeight: '600', color: theme.textPrimary },
  levelCard: { borderRadius: theme.radius.xl, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 20 },
  levelLeft: { alignItems: 'center' },
  levelLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.7)', letterSpacing: 1 },
  levelValue: { fontSize: 36, fontWeight: '700', color: '#FFF' },
  levelRight: { flex: 1 },
  xpBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 4, overflow: 'hidden' },
  xpBarFill: { height: 8, backgroundColor: '#FFF', borderRadius: 4 },
  xpBarText: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 6 },
});
