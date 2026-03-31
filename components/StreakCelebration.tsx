// Streak Celebration Modal with confetti animation
import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay,
  withSpring, withRepeat, withSequence, Easing, FadeIn, FadeOut,
} from 'react-native-reanimated';
import theme from '../constants/theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const MILESTONES: Record<number, { title: string; badge: string; message: string }> = {
  3: { title: '3-Day Streak!', badge: '🌱', message: 'You are building a healthy habit. Keep going!' },
  7: { title: 'One Week!', badge: '🌿', message: 'A full week of showing up for yourself. Amazing!' },
  14: { title: 'Two Weeks!', badge: '🌳', message: 'Two weeks strong! Your consistency is inspiring.' },
  30: { title: 'One Month!', badge: '🏆', message: 'A whole month! You should be incredibly proud.' },
  60: { title: 'Two Months!', badge: '💎', message: 'Unstoppable! Your dedication is truly remarkable.' },
  100: { title: '100 Days!', badge: '👑', message: 'Legendary streak! You are a SafeSpace champion!' },
};

const CONFETTI_COLORS = ['#8B7EC8', '#6BC5A0', '#F2D06B', '#F2A977', '#87CEEB', '#E88B8B'];

function ConfettiPiece({ index }: { index: number }) {
  const x = useSharedValue(Math.random() * SCREEN_W);
  const y = useSharedValue(-20 - Math.random() * 100);
  const rotation = useSharedValue(Math.random() * 360);
  const size = 8 + Math.random() * 8;
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const delay = index * 40;

  useEffect(() => {
    x.value = withDelay(delay, withTiming(Math.random() * SCREEN_W, { duration: 2500 + Math.random() * 1000 }));
    y.value = withDelay(delay, withTiming(SCREEN_H + 50, { duration: 2000 + Math.random() * 1500, easing: Easing.in(Easing.quad) }));
    rotation.value = withDelay(delay, withTiming(rotation.value + 720 + Math.random() * 360, { duration: 2500 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: x.value,
    top: y.value,
    width: size,
    height: size * (0.5 + Math.random() * 0.5),
    backgroundColor: color,
    borderRadius: Math.random() > 0.5 ? size / 2 : 2,
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return <Animated.View style={style} />;
}

interface StreakCelebrationProps {
  visible: boolean;
  streak: number;
  onDismiss: () => void;
}

export default function StreakCelebration({ visible, streak, onDismiss }: StreakCelebrationProps) {
  const milestone = MILESTONES[streak];
  if (!milestone) return null;

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [visible]);

  const badgeScale = useSharedValue(0);
  useEffect(() => {
    if (visible) {
      badgeScale.value = withDelay(300, withSpring(1, { damping: 8, stiffness: 100 }));
    } else {
      badgeScale.value = 0;
    }
  }, [visible]);

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        {/* Confetti */}
        {visible && Array.from({ length: 40 }).map((_, i) => (
          <ConfettiPiece key={i} index={i} />
        ))}

        <Animated.View entering={FadeIn.duration(300)} style={styles.card}>
          <Animated.View style={[styles.badgeCircle, badgeStyle]}>
            <Text style={styles.badgeEmoji}>{milestone.badge}</Text>
          </Animated.View>

          <Text style={styles.title}>{milestone.title}</Text>
          <Text style={styles.streakNumber}>{streak} days</Text>
          <Text style={styles.message}>{milestone.message}</Text>

          <View style={styles.decorRow}>
            <MaterialIcons name="local-fire-department" size={20} color={theme.warm} />
            <MaterialIcons name="local-fire-department" size={20} color={theme.warm} />
            <MaterialIcons name="local-fire-department" size={20} color={theme.warm} />
          </View>

          <Pressable style={styles.continueBtn} onPress={onDismiss}>
            <Text style={styles.continueBtnText}>Keep Going!</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

export function shouldCelebrate(streak: number): boolean {
  return Object.keys(MILESTONES).map(Number).includes(streak);
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    zIndex: 10,
  },
  badgeCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.warmSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  badgeEmoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.textPrimary,
    textAlign: 'center',
  },
  streakNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.warm,
    marginTop: 4,
  },
  message: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 12,
    marginBottom: 20,
  },
  decorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  continueBtn: {
    backgroundColor: theme.primary,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: theme.radius.full,
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
