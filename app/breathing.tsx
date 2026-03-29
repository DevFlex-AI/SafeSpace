// Breathing Exercise — 4-4-6 pattern with animated circle
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSequence,
  withDelay, Easing, FadeIn, cancelAnimation, runOnJS,
} from 'react-native-reanimated';
import theme from '../constants/theme';
import { APP_CONFIG } from '../constants/config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CIRCLE_SIZE = SCREEN_WIDTH * 0.55;

type Phase = 'idle' | 'inhale' | 'hold' | 'exhale' | 'done';

export default function BreathingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { inhaleSeconds, holdSeconds, exhaleSeconds, defaultCycles } = APP_CONFIG.breathing;

  const [phase, setPhase] = useState<Phase>('idle');
  const [currentCycle, setCurrentCycle] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0.4);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getPhaseLabel = () => {
    switch (phase) {
      case 'idle': return 'Tap to begin';
      case 'inhale': return 'Breathe in';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe out';
      case 'done': return 'Well done';
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale': return theme.primary;
      case 'hold': return '#87CEEB';
      case 'exhale': return theme.accent;
      default: return theme.textSecondary;
    }
  };

  // Breathing cycle logic
  useEffect(() => {
    if (!isActive || phase === 'done' || phase === 'idle') return;

    let countdown = 0;
    if (phase === 'inhale') countdown = inhaleSeconds;
    else if (phase === 'hold') countdown = holdSeconds;
    else if (phase === 'exhale') countdown = exhaleSeconds;

    setTimer(countdown);

    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          // Transition to next phase
          if (phase === 'inhale') {
            setPhase('hold');
          } else if (phase === 'hold') {
            setPhase('exhale');
          } else if (phase === 'exhale') {
            if (currentCycle + 1 >= defaultCycles) {
              setPhase('done');
              setIsActive(false);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
              setCurrentCycle(c => c + 1);
              setPhase('inhale');
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, isActive, currentCycle]);

  // Animate circle based on phase
  useEffect(() => {
    if (phase === 'inhale') {
      scale.value = withTiming(1.0, { duration: inhaleSeconds * 1000, easing: Easing.inOut(Easing.ease) });
      opacity.value = withTiming(0.9, { duration: inhaleSeconds * 1000 });
      Haptics.selectionAsync();
    } else if (phase === 'hold') {
      // Gentle pulse
      scale.value = withSequence(
        withTiming(1.02, { duration: 1000 }),
        withTiming(0.98, { duration: 1000 }),
        withTiming(1.0, { duration: (holdSeconds - 2) * 1000 }),
      );
    } else if (phase === 'exhale') {
      scale.value = withTiming(0.6, { duration: exhaleSeconds * 1000, easing: Easing.inOut(Easing.ease) });
      opacity.value = withTiming(0.4, { duration: exhaleSeconds * 1000 });
    } else if (phase === 'done') {
      scale.value = withTiming(0.8, { duration: 500 });
      opacity.value = withTiming(0.7, { duration: 500 });
    }
  }, [phase]);

  const startExercise = () => {
    Haptics.selectionAsync();
    setCurrentCycle(0);
    setIsActive(true);
    setPhase('inhale');
  };

  const resetExercise = () => {
    Haptics.selectionAsync();
    setIsActive(false);
    setPhase('idle');
    setCurrentCycle(0);
    setTimer(0);
    scale.value = withTiming(0.6, { duration: 300 });
    opacity.value = withTiming(0.4, { duration: 300 });
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/breathing-bg.png')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        blurRadius={40}
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(248,246,255,0.85)' }]} />

      {/* Close Button */}
      <Pressable
        style={[styles.closeBtn, { top: insets.top + 12 }]}
        onPress={() => router.back()}
      >
        <MaterialIcons name="close" size={24} color={theme.textSecondary} />
      </Pressable>

      {/* Content */}
      <View style={styles.content}>
        <Animated.View entering={FadeIn.duration(600)}>
          <Text style={styles.title}>Breathing Exercise</Text>
          <Text style={styles.subtitle}>4 - 4 - 6 pattern</Text>
        </Animated.View>

        {/* Breathing Circle */}
        <View style={styles.circleWrap}>
          <Animated.View style={[styles.circle, circleStyle]}>
            <View style={styles.circleInner}>
              {phase !== 'idle' && phase !== 'done' ? (
                <>
                  <Text style={[styles.timerText, { color: getPhaseColor() }]}>{timer}</Text>
                  <Text style={[styles.phaseText, { color: getPhaseColor() }]}>{getPhaseLabel()}</Text>
                </>
              ) : phase === 'done' ? (
                <>
                  <MaterialIcons name="check-circle" size={48} color={theme.accent} />
                  <Text style={[styles.phaseText, { color: theme.accent, marginTop: 8 }]}>
                    {getPhaseLabel()}
                  </Text>
                </>
              ) : (
                <Text style={styles.phaseText}>{getPhaseLabel()}</Text>
              )}
            </View>
          </Animated.View>

          {/* Cycle dots */}
          {isActive && (
            <View style={styles.cycleDots}>
              {Array.from({ length: defaultCycles }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.cycleDot,
                    i <= currentCycle && { backgroundColor: theme.primary },
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {phase === 'idle' ? (
            <Pressable style={styles.startBtn} onPress={startExercise}>
              <Text style={styles.startBtnText}>Begin</Text>
            </Pressable>
          ) : phase === 'done' ? (
            <View style={styles.doneControls}>
              <Pressable style={styles.startBtn} onPress={startExercise}>
                <Text style={styles.startBtnText}>Again</Text>
              </Pressable>
              <Pressable style={styles.secondaryBtn} onPress={() => router.back()}>
                <Text style={styles.secondaryBtnText}>Done</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.secondaryBtn} onPress={resetExercise}>
              <Text style={styles.secondaryBtnText}>Stop</Text>
            </Pressable>
          )}
        </View>

        {/* Info */}
        <Text style={styles.infoText}>
          {phase === 'idle' && 'This exercise helps calm your nervous system.'}
          {phase === 'done' && `You completed ${defaultCycles} cycles. Your body is calmer now.`}
          {isActive && `Cycle ${currentCycle + 1} of ${defaultCycles}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  closeBtn: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 40,
  },

  // Circle
  circleWrap: {
    alignItems: 'center',
    marginBottom: 48,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: theme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 72,
    fontWeight: '300',
    letterSpacing: -2,
  },
  phaseText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  cycleDots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 24,
  },
  cycleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.border,
  },

  // Controls
  controls: {
    alignItems: 'center',
    marginBottom: 24,
  },
  startBtn: {
    backgroundColor: theme.primary,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: theme.radius.full,
  },
  startBtnText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  secondaryBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    borderColor: theme.border,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  doneControls: {
    flexDirection: 'row',
    gap: 16,
  },
  infoText: {
    fontSize: 14,
    color: theme.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
