// Grounding Exercise — 5-4-3-2-1 sensory technique
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn, FadeInDown, FadeInUp, SlideInRight,
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
} from 'react-native-reanimated';
import theme from '../constants/theme';
import { APP_CONFIG } from '../constants/config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const STEP_COLORS = ['#8B7EC8', '#87CEEB', '#6BC5A0', '#F2D06B', '#F2A977'];
const STEP_BG_COLORS = ['#EDE9FE', '#E0F2FE', '#D1FAE5', '#FEF3C7', '#FDDCBF'];

export default function GroundingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const steps = APP_CONFIG.grounding.steps;

  const [currentStep, setCurrentStep] = useState(0);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean[]>>({});
  const [isDone, setIsDone] = useState(false);

  const step = steps[currentStep];
  const stepColor = STEP_COLORS[currentStep];
  const stepBg = STEP_BG_COLORS[currentStep];
  const checked = checkedItems[currentStep] || Array(step.count).fill(false);
  const allChecked = checked.every(Boolean);

  const progress = useSharedValue(0);
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  const toggleItem = (index: number) => {
    Haptics.selectionAsync();
    const updated = [...checked];
    updated[index] = !updated[index];
    setCheckedItems(prev => ({ ...prev, [currentStep]: updated }));

    const totalItems = steps.reduce((sum, s) => sum + s.count, 0);
    const completedItems = Object.entries({ ...checkedItems, [currentStep]: updated })
      .reduce((sum, [, items]) => sum + (items as boolean[]).filter(Boolean).length, 0);
    progress.value = withTiming((completedItems / totalItems) * 100, { duration: 300 });
  };

  const nextStep = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsDone(true);
    }
  };

  const prevStep = () => {
    Haptics.selectionAsync();
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const restart = () => {
    Haptics.selectionAsync();
    setCurrentStep(0);
    setCheckedItems({});
    setIsDone(false);
    progress.value = withTiming(0, { duration: 300 });
  };

  if (isDone) {
    return (
      <View style={[styles.container, { backgroundColor: '#D1FAE5' }]}>
        <Pressable
          style={[styles.closeBtn, { top: insets.top + 12 }]}
          onPress={() => router.back()}
        >
          <MaterialIcons name="close" size={24} color={theme.textSecondary} />
        </Pressable>

        <Animated.View entering={FadeIn.duration(600)} style={styles.doneContent}>
          <View style={styles.doneIcon}>
            <MaterialIcons name="check-circle" size={64} color={theme.accent} />
          </View>
          <Text style={styles.doneTitle}>You're grounded</Text>
          <Text style={styles.doneDesc}>
            You just engaged all 5 senses to bring yourself back to the present moment. Great work.
          </Text>
          <View style={styles.doneControls}>
            <Pressable style={styles.startBtn} onPress={restart}>
              <Text style={styles.startBtnText}>Do Again</Text>
            </Pressable>
            <Pressable style={styles.secondaryBtn} onPress={() => router.back()}>
              <Text style={styles.secondaryBtnText}>Done</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: stepBg }]}>
      {/* Close */}
      <Pressable
        style={[styles.closeBtn, { top: insets.top + 12 }]}
        onPress={() => router.back()}
      >
        <MaterialIcons name="close" size={24} color={theme.textSecondary} />
      </Pressable>

      {/* Progress Bar */}
      <View style={[styles.progressBar, { top: insets.top + 64 }]}>
        <Animated.View style={[styles.progressFill, progressStyle, { backgroundColor: stepColor }]} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Step Counter */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.stepCounter}>
          <Text style={[styles.stepNumber, { color: stepColor }]}>{step.count}</Text>
          <Text style={[styles.stepSense, { color: stepColor }]}>things you can</Text>
          <Text style={[styles.stepSenseWord, { color: stepColor }]}>{step.sense}</Text>
        </Animated.View>

        {/* Instruction */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <View style={[styles.instructionCard, { borderColor: stepColor + '40' }]}>
            <MaterialIcons name={step.icon as any} size={28} color={stepColor} />
            <Text style={styles.instructionText}>{step.instruction}</Text>
          </View>
        </Animated.View>

        {/* Checkboxes */}
        <View style={styles.checkList}>
          {Array.from({ length: step.count }).map((_, i) => (
            <Animated.View key={`${currentStep}-${i}`} entering={FadeInDown.duration(300).delay(200 + i * 80)}>
              <Pressable
                style={[
                  styles.checkItem,
                  checked[i] && { backgroundColor: stepColor + '15', borderColor: stepColor },
                ]}
                onPress={() => toggleItem(i)}
              >
                <View style={[
                  styles.checkbox,
                  checked[i] && { backgroundColor: stepColor, borderColor: stepColor },
                ]}>
                  {checked[i] && <MaterialIcons name="check" size={18} color="#FFF" />}
                </View>
                <Text style={[
                  styles.checkText,
                  checked[i] && { color: stepColor },
                ]}>
                  {checked[i] ? 'Found one!' : `Thing ${i + 1}`}
                </Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>

        {/* Navigation */}
        <View style={styles.navRow}>
          {currentStep > 0 && (
            <Pressable style={styles.navBtn} onPress={prevStep}>
              <MaterialIcons name="arrow-back" size={22} color={theme.textSecondary} />
              <Text style={styles.navBtnText}>Back</Text>
            </Pressable>
          )}

          <View style={{ flex: 1 }} />

          <Pressable
            style={[styles.nextBtn, { backgroundColor: allChecked ? stepColor : theme.border }]}
            onPress={nextStep}
            disabled={!allChecked}
          >
            <Text style={[styles.nextBtnText, { color: allChecked ? '#FFF' : theme.textMuted }]}>
              {currentStep < steps.length - 1 ? 'Next' : 'Finish'}
            </Text>
            <MaterialIcons
              name={currentStep < steps.length - 1 ? 'arrow-forward' : 'check'}
              size={20}
              color={allChecked ? '#FFF' : theme.textMuted}
            />
          </Pressable>
        </View>

        {/* Step dots */}
        <View style={styles.stepDots}>
          {steps.map((_, i) => (
            <View
              key={i}
              style={[
                styles.stepDot,
                i === currentStep && { backgroundColor: stepColor, width: 24 },
                i < currentStep && { backgroundColor: stepColor },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  progressBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 2,
    overflow: 'hidden',
    zIndex: 5,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 80,
  },

  // Step Counter
  stepCounter: {
    alignItems: 'center',
    marginBottom: 24,
  },
  stepNumber: {
    fontSize: 72,
    fontWeight: '700',
    lineHeight: 80,
  },
  stepSense: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: -4,
  },
  stepSenseWord: {
    fontSize: 28,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },

  // Instruction
  instructionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: theme.radius.lg,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: theme.textPrimary,
    lineHeight: 22,
  },

  // Checklist
  checkList: {
    gap: 10,
    marginBottom: 32,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: theme.radius.md,
    padding: 16,
    gap: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.textSecondary,
  },

  // Navigation
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 4,
  },
  navBtnText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: theme.radius.full,
    gap: 6,
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },

  // Dots
  stepDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },

  // Done
  doneContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  doneIcon: {
    marginBottom: 24,
  },
  doneTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 12,
  },
  doneDesc: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  doneControls: {
    flexDirection: 'row',
    gap: 16,
  },
  startBtn: {
    backgroundColor: theme.accent,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: theme.radius.full,
  },
  startBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  secondaryBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    borderColor: theme.accent,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.accent,
  },
});
