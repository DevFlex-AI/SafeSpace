// Tasks Screen — Gamified micro-tasks with XP, streaks, categories
import React, { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming,
  FadeInDown, FadeIn, Layout,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import theme from '../../constants/theme';
import { useApp } from '../../contexts/AppContext';
import { TASK_CATEGORIES } from '../../services/mockData';
import { APP_CONFIG } from '../../constants/config';

function XPPopup({ xp, visible }: { xp: number; visible: boolean }) {
  if (!visible) return null;
  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.xpPopup}>
      <Text style={styles.xpPopupText}>+{xp} XP!</Text>
    </Animated.View>
  );
}

export default function TasksScreen() {
  const insets = useSafeAreaInsets();
  const { profile, dailyTasks, completeTask, completedToday, addXp, refreshTasks } = useApp();
  const [showXp, setShowXp] = useState<{ id: string; xp: number } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const taskProgress = dailyTasks.length > 0 ? completedToday / dailyTasks.length : 0;
  const allDone = completedToday === dailyTasks.length && dailyTasks.length > 0;

  const filteredTasks = selectedCategory
    ? dailyTasks.filter(t => t.category === selectedCategory)
    : dailyTasks;

  const handleComplete = (taskId: string, xp: number) => {
    const task = dailyTasks.find(t => t.id === taskId);
    if (!task || task.completed) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeTask(taskId);
    addXp(xp);

    setShowXp({ id: taskId, xp });
    setTimeout(() => setShowXp(null), 1200);
  };

  const progressRingSize = 100;
  const strokeWidth = 8;
  const radius = (progressRingSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - Math.min(taskProgress, 1) * circumference;

  const categories = Object.entries(TASK_CATEGORIES);

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <Text style={styles.pageTitle}>Today's Tasks</Text>
          <Pressable style={styles.refreshBtn} onPress={() => { Haptics.selectionAsync(); refreshTasks(); }}>
            <MaterialIcons name="refresh" size={22} color={theme.textSecondary} />
          </Pressable>
        </Animated.View>

        {/* Progress Hero */}
        <Animated.View entering={FadeInDown.duration(500).delay(100)}>
          <LinearGradient
            colors={allDone ? ['#A8E6CF', '#6BC5A0'] : ['#B8ADE8', '#8B7EC8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.progressCard}
          >
            <View style={styles.progressRingWrap}>
              <Svg width={progressRingSize} height={progressRingSize}>
                <Circle
                  cx={progressRingSize / 2} cy={progressRingSize / 2} r={radius}
                  stroke="rgba(255,255,255,0.25)" strokeWidth={strokeWidth} fill="none"
                />
                <Circle
                  cx={progressRingSize / 2} cy={progressRingSize / 2} r={radius}
                  stroke="#FFF" strokeWidth={strokeWidth}
                  strokeDasharray={`${circumference}`} strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round" fill="none" rotation="-90"
                  origin={`${progressRingSize / 2},${progressRingSize / 2}`}
                />
              </Svg>
              <View style={styles.progressRingCenter}>
                <Text style={styles.progressPercent}>{Math.round(taskProgress * 100)}%</Text>
              </View>
            </View>

            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>
                {allDone ? 'All done! Great work!' : `${completedToday} of ${dailyTasks.length} complete`}
              </Text>
              <Text style={styles.progressSub}>
                {allDone
                  ? `You earned ${completedToday * 15} XP today`
                  : `${dailyTasks.length - completedToday} tasks remaining`
                }
              </Text>

              <View style={styles.statsRow}>
                <View style={styles.statBadge}>
                  <MaterialIcons name="local-fire-department" size={16} color="#FFF" />
                  <Text style={styles.statText}>{profile.streak} day streak</Text>
                </View>
                <View style={styles.statBadge}>
                  <MaterialIcons name="star" size={16} color="#FFF" />
                  <Text style={styles.statText}>Level {profile.level}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Category Filter */}
        <Animated.View entering={FadeInDown.duration(500).delay(200)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
          >
            <Pressable
              style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
              onPress={() => { Haptics.selectionAsync(); setSelectedCategory(null); }}
            >
              <Text style={[styles.categoryChipText, !selectedCategory && styles.categoryChipTextActive]}>All</Text>
            </Pressable>
            {categories.map(([key, cat]) => (
              <Pressable
                key={key}
                style={[
                  styles.categoryChip,
                  selectedCategory === key && { backgroundColor: cat.color + '20', borderColor: cat.color },
                ]}
                onPress={() => { Haptics.selectionAsync(); setSelectedCategory(selectedCategory === key ? null : key); }}
              >
                <MaterialIcons name={cat.icon as any} size={16} color={selectedCategory === key ? cat.color : theme.textSecondary} />
                <Text style={[
                  styles.categoryChipText,
                  selectedCategory === key && { color: cat.color },
                ]}>{cat.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Task List */}
        <View style={styles.taskList}>
          {filteredTasks.map((task, idx) => {
            const cat = TASK_CATEGORIES[task.category];
            return (
              <Animated.View
                key={task.id}
                entering={FadeInDown.duration(400).delay(300 + idx * 60)}
                layout={Layout.springify()}
              >
                <Pressable
                  style={[styles.taskCard, task.completed && styles.taskCardDone]}
                  onPress={() => handleComplete(task.id, task.xp)}
                  disabled={task.completed}
                >
                  <View style={styles.taskCardLeft}>
                    <View style={[
                      styles.taskCheck,
                      task.completed && { backgroundColor: theme.accent, borderColor: theme.accent },
                    ]}>
                      {task.completed && <MaterialIcons name="check" size={18} color="#FFF" />}
                    </View>
                  </View>

                  <View style={styles.taskCardCenter}>
                    <View style={styles.taskCatRow}>
                      <View style={[styles.taskCatDot, { backgroundColor: cat.color }]} />
                      <Text style={styles.taskCatLabel}>{cat.label}</Text>
                    </View>
                    <Text style={[styles.taskTitle, task.completed && styles.taskTitleDone]}>
                      {task.title}
                    </Text>
                    <Text style={styles.taskDesc}>{task.description}</Text>
                  </View>

                  <View style={styles.taskCardRight}>
                    <View style={[styles.xpChip, task.completed && styles.xpChipDone]}>
                      <Text style={[styles.xpChipText, task.completed && styles.xpChipTextDone]}>
                        +{task.xp}
                      </Text>
                    </View>
                    {showXp?.id === task.id && <XPPopup xp={showXp.xp} visible />}
                  </View>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        {/* Empty filtered */}
        {filteredTasks.length === 0 && (
          <View style={styles.emptyState}>
            <Image
              source={require('../../assets/images/tasks-empty.png')}
              style={styles.emptyImage}
              contentFit="contain"
            />
            <Text style={styles.emptyTitle}>No tasks in this category</Text>
            <Text style={styles.emptyDesc}>Try selecting a different category</Text>
          </View>
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
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Progress Card
  progressCard: {
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: theme.radius.xl,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  progressRingWrap: {
    width: 100,
    height: 100,
    position: 'relative',
  },
  progressRingCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercent: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFF',
  },
  progressSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },

  // Categories
  categoryRow: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  categoryChipTextActive: {
    color: '#FFF',
  },

  // Task List
  taskList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: theme.radius.lg,
    padding: 16,
    shadowColor: theme.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    gap: 12,
  },
  taskCardDone: {
    opacity: 0.65,
  },
  taskCardLeft: {},
  taskCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCardCenter: {
    flex: 1,
  },
  taskCatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  taskCatDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  taskCatLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 2,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: theme.textMuted,
  },
  taskDesc: {
    fontSize: 13,
    color: theme.textSecondary,
    lineHeight: 18,
  },
  taskCardRight: {
    alignItems: 'center',
    position: 'relative',
  },
  xpChip: {
    backgroundColor: theme.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
  },
  xpChipDone: {
    backgroundColor: theme.accent,
  },
  xpChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.accentDark,
  },
  xpChipTextDone: {
    color: '#FFF',
  },

  // XP Popup
  xpPopup: {
    position: 'absolute',
    top: -28,
    backgroundColor: theme.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
  },
  xpPopupText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },

  // Empty
  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 40,
  },
  emptyImage: {
    width: 200,
    height: 150,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
  },
});
