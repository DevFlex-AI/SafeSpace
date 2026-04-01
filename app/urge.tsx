// Urge Surfing Screen — sensory redirection for trichotillomania / hair-pulling urges
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withSequence, withRepeat, Easing, FadeIn, FadeInDown,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../constants/theme';

const REDIRECT_ACTIVITIES = [
  { icon: 'grain', label: 'Squeeze a stress ball', desc: 'Keep hands busy with texture', color: '#8B7EC8' },
  { icon: 'radio-button-checked', label: 'Fidget with a hair tie', desc: 'Snap gently on wrist', color: '#6BC5A0' },
  { icon: 'colorize', label: 'Run fingers through sand', desc: 'Sensory grounding through touch', color: '#E8A87C' },
  { icon: 'air', label: 'Box breathing', desc: '4-4-4-4 breath pattern', color: '#7EC8D8', action: 'breathing' },
  { icon: 'touch-app', label: 'Tap your fingertips', desc: 'Press each fingertip together slowly', color: '#B87EC8' },
  { icon: 'water-drop', label: 'Cold water on wrists', desc: 'Splash cold water to interrupt the urge', color: '#7EA8C8' },
];

const AFFIRMATIONS = [
  'This urge will pass. You are stronger than it.',
  'You have surfed this wave before. You can do it again.',
  'The urge peaks, then fades. Ride it out.',
  'You are not your urge. You are the person watching it.',
  'Each time you redirect, you are building new pathways.',
];

export default function UrgeScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<'notice' | 'surf' | 'victory'>('notice');
  const [seconds, setSeconds] = useState(0);
  const [affirmIdx, setAffirmIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pulsing wave animation
  const waveScale = useSharedValue(1);
  const waveOpacity = useSharedValue(0.6);

  useEffect(() => {
    waveScale.value = withRepeat(
      withSequence(
        withTiming(1.18, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1, false
    );
    waveOpacity.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 1800 }),
        withTiming(0.5, { duration: 1800 }),
      ),
      -1, false
    );
  }, []);

  const waveStyle = useAnimatedStyle(() => ({
    transform: [{ scale: waveScale.value }],
    opacity: waveOpacity.value,
  }));

  // Timer while surfing
  useEffect(() => {
    if (phase === 'surf') {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s >= 89) {
            clearInterval(intervalRef.current!);
            setPhase('victory');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return 90;
          }
          return s + 1;
        });
        // Rotate affirmations every 15s
        setAffirmIdx(i => (i + 1) % AFFIRMATIONS.length);
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase]);

  const startSurfing = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPhase('surf');
    setSeconds(0);
  };

  const handleRedirect = (activity: typeof REDIRECT_ACTIVITIES[number]) => {
    Haptics.selectionAsync();
    if (activity.action === 'breathing') router.push('/breathing');
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <LinearGradient
        colors={['#E8E4F8', '#D4EEE8', '#F8F4FF']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={22} color={theme.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Urge Surfing</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Wave Orb */}
        <View style={styles.orbContainer}>
          <Animated.View style={[styles.orbOuter, waveStyle]}>
            <View style={styles.orbInner}>
              <Text style={styles.orbEmoji}>{phase === 'victory' ? '🌟' : '🌊'}</Text>
              {phase === 'surf' && <Text style={styles.timer}>{formatTime(seconds)}</Text>}
            </View>
          </Animated.View>
        </View>

        {phase === 'notice' && (
          <Animated.View entering={FadeIn.duration(400)} style={styles.section}>
            <Text style={styles.mainTitle}>You noticed the urge 💜</Text>
            <Text style={styles.mainDesc}>
              Noticing it is the hardest part — and you already did it.{'\n\n'}
              Urges are like waves. They rise, peak, and fade. You don't have to act on them.{'\n\n'}
              Let's surf this one together. Tap below when you're ready.
            </Text>
            <Pressable style={styles.primaryBtn} onPress={startSurfing}>
              <Text style={styles.primaryBtnText}>Start Surfing This Urge 🏄</Text>
            </Pressable>
          </Animated.View>
        )}

        {phase === 'surf' && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.section}>
            <Text style={styles.affirmText}>"{AFFIRMATIONS[affirmIdx]}"</Text>
            <Text style={styles.sectionHeading}>Try redirecting your hands:</Text>
            <View style={styles.activitiesGrid}>
              {REDIRECT_ACTIVITIES.map((act, idx) => (
                <Animated.View key={idx} entering={FadeInDown.duration(300).delay(idx * 60)}>
                  <Pressable style={styles.activityCard} onPress={() => handleRedirect(act)}>
                    <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
                    <View style={[styles.activityIcon, { backgroundColor: act.color + '33' }]}>
                      <MaterialIcons name={act.icon as any} size={22} color={act.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.activityLabel}>{act.label}</Text>
                      <Text style={styles.activityDesc}>{act.desc}</Text>
                    </View>
                    {act.action && <MaterialIcons name="chevron-right" size={18} color={theme.textMuted} />}
                  </Pressable>
                </Animated.View>
              ))}
            </View>
            <Pressable style={styles.secondaryBtn} onPress={() => { setPhase('victory'); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }}>
              <Text style={styles.secondaryBtnText}>✅ I redirected the urge</Text>
            </Pressable>
          </Animated.View>
        )}

        {phase === 'victory' && (
          <Animated.View entering={FadeIn.duration(500)} style={styles.section}>
            <Text style={styles.mainTitle}>You did it! 🌟</Text>
            <Text style={styles.mainDesc}>
              You surfed the urge{seconds > 0 ? ` for ${formatTime(seconds)}` : ''} and came out the other side.{'\n\n'}
              Every time you do this, you're rewiring your brain. That's real, lasting change.{'\n\n'}
              Be proud of yourself. Seriously. 💜
            </Text>
            <Pressable style={styles.primaryBtn} onPress={() => router.back()}>
              <Text style={styles.primaryBtnText}>Back to Safety ←</Text>
            </Pressable>
            <Pressable style={[styles.secondaryBtn, { marginTop: 12 }]} onPress={() => { setPhase('notice'); setSeconds(0); }}>
              <Text style={styles.secondaryBtnText}>Still feeling an urge? Try again</Text>
            </Pressable>
          </Animated.View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: theme.textPrimary },
  orbContainer: { alignItems: 'center', marginBottom: 24 },
  orbOuter: {
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(139,126,200,0.25)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(139,126,200,0.35)',
  },
  orbInner: { alignItems: 'center', justifyContent: 'center' },
  orbEmoji: { fontSize: 52 },
  timer: { fontSize: 26, fontWeight: '700', color: theme.primary, marginTop: 4 },
  content: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 8 },
  section: { gap: 16 },
  mainTitle: { fontSize: 24, fontWeight: '800', color: theme.textPrimary, textAlign: 'center' },
  mainDesc: { fontSize: 15, color: theme.textSecondary, lineHeight: 24, textAlign: 'center' },
  affirmText: {
    fontSize: 16, fontWeight: '600', color: theme.primary,
    fontStyle: 'italic', textAlign: 'center', lineHeight: 24,
    backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 16, padding: 14,
  },
  sectionHeading: { fontSize: 15, fontWeight: '700', color: theme.textPrimary },
  activitiesGrid: { gap: 10 },
  activityCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 16,
    padding: 14, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.7)',
  },
  activityIcon: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  activityLabel: { fontSize: 14, fontWeight: '600', color: theme.textPrimary },
  activityDesc: { fontSize: 12, color: theme.textSecondary, marginTop: 2 },
  primaryBtn: {
    backgroundColor: theme.primary, borderRadius: 28,
    paddingVertical: 16, alignItems: 'center', marginTop: 4,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  secondaryBtn: {
    backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 28,
    paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: theme.border,
  },
  secondaryBtnText: { fontSize: 15, fontWeight: '600', color: theme.textPrimary },
});
