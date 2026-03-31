// Swipe-to-complete task card
import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  runOnJS, interpolate, Extrapolation,
} from 'react-native-reanimated';
import theme from '../constants/theme';
import { TASK_CATEGORIES } from '../services/mockData';
import { Task } from '../services/mockData';

const SWIPE_THRESHOLD = 100;
const { width: SCREEN_W } = Dimensions.get('window');

interface SwipeableTaskProps {
  task: Task;
  onComplete: (taskId: string, xp: number) => void;
}

export default function SwipeableTask({ task, onComplete }: SwipeableTaskProps) {
  const translateX = useSharedValue(0);
  const height = useSharedValue(1);
  const cat = TASK_CATEGORIES[task.category];

  const handleComplete = useCallback(() => {
    onComplete(task.id, task.xp);
  }, [task.id, task.xp, onComplete]);

  const panGesture = Gesture.Pan()
    .enabled(!task.completed)
    .onUpdate((event) => {
      if (event.translationX > 0) {
        translateX.value = Math.min(event.translationX, SCREEN_W * 0.5);
      }
    })
    .onEnd((event) => {
      if (event.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(SCREEN_W, { duration: 200 }, () => {
          runOnJS(handleComplete)();
        });
      } else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
    transform: [
      { scale: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0.3, 1.2], Extrapolation.CLAMP) },
    ],
  }));

  const xpFlyStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [SWIPE_THRESHOLD * 0.8, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(translateX.value, [SWIPE_THRESHOLD * 0.8, SWIPE_THRESHOLD * 1.5], [0, -20], Extrapolation.CLAMP) },
    ],
  }));

  if (task.completed) {
    return (
      <Pressable style={[styles.taskCard, styles.taskCardDone]}>
        <View style={styles.taskCardLeft}>
          <View style={[styles.taskCheck, styles.taskCheckDone]}>
            <MaterialIcons name="check" size={18} color="#FFF" />
          </View>
        </View>
        <View style={styles.taskCardCenter}>
          <View style={styles.taskCatRow}>
            <View style={[styles.taskCatDot, { backgroundColor: cat.color }]} />
            <Text style={styles.taskCatLabel}>{cat.label}</Text>
          </View>
          <Text style={[styles.taskTitle, styles.taskTitleDone]}>{task.title}</Text>
          <Text style={styles.taskDesc}>{task.description}</Text>
        </View>
        <View style={styles.taskCardRight}>
          <View style={[styles.xpChip, styles.xpChipDone]}>
            <Text style={[styles.xpChipText, styles.xpChipTextDone]}>+{task.xp}</Text>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={styles.swipeContainer}>
      {/* Background revealed on swipe */}
      <View style={styles.swipeBg}>
        <Animated.View style={[styles.swipeCheckWrap, checkStyle]}>
          <MaterialIcons name="check-circle" size={32} color="#FFF" />
          <Text style={styles.swipeCheckText}>Done!</Text>
        </Animated.View>
        <Animated.View style={[styles.xpFly, xpFlyStyle]}>
          <Text style={styles.xpFlyText}>+{task.xp} XP</Text>
        </Animated.View>
      </View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.taskCard, cardStyle]}>
          <View style={styles.taskCardLeft}>
            <View style={styles.taskCheck} />
          </View>
          <View style={styles.taskCardCenter}>
            <View style={styles.taskCatRow}>
              <View style={[styles.taskCatDot, { backgroundColor: cat.color }]} />
              <Text style={styles.taskCatLabel}>{cat.label}</Text>
            </View>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskDesc}>{task.description}</Text>
          </View>
          <View style={styles.taskCardRight}>
            <View style={styles.xpChip}>
              <Text style={styles.xpChipText}>+{task.xp}</Text>
            </View>
            <Text style={styles.swipeHint}>swipe →</Text>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  swipeContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: theme.radius.lg,
  },
  swipeBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.accent,
    borderRadius: theme.radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    gap: 8,
  },
  swipeCheckWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  swipeCheckText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  xpFly: {
    position: 'absolute',
    right: 20,
    top: 8,
  },
  xpFlyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
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
  taskCheckDone: {
    backgroundColor: theme.accent,
    borderColor: theme.accent,
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
    gap: 4,
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
  swipeHint: {
    fontSize: 10,
    color: theme.textMuted,
    fontWeight: '500',
  },
});
