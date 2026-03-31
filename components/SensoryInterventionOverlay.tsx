// SensoryInterventionOverlay — Displays calming message when hair-pulling detected
// Glass-styled overlay with gentle intervention
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import theme from '../constants/theme';
import { SENSORY_MESSAGES } from '../hooks/useSensoryMonitor';

interface SensoryInterventionOverlayProps {
  visible: boolean;
  onDismiss: () => void;
}

export default function SensoryInterventionOverlay({
  visible,
  onDismiss,
}: SensoryInterventionOverlayProps) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 12, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = withTiming(0.8, { duration: 150 });
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handleDismiss = () => {
    Haptics.selectionAsync();
    onDismiss();
  };

  // Pick a random message
  const message = SENSORY_MESSAGES[Math.floor(Math.random() * SENSORY_MESSAGES.length)];

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]} entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
      <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
      
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <MaterialIcons name="self-improvement" size={48} color={theme.primary} />
        </View>

        {/* Message */}
        <Text style={styles.message}>{message}</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Take a moment to check in with yourself
        </Text>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable style={styles.primaryBtn} onPress={handleDismiss}>
            <Text style={styles.primaryBtnText}>I&apos;m okay</Text>
          </Pressable>
          
          <Pressable style={styles.secondaryBtn} onPress={handleDismiss}>
            <Text style={styles.secondaryBtnText}>Let&apos;s do 5-4-3-2-1</Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(248, 246, 255, 0.9)',
    zIndex: 2000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    backgroundColor: theme.glass.light.background,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 32,
    borderWidth: 1,
    borderColor: theme.glass.light.border,
    shadowColor: theme.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  message: {
    fontSize: 22,
    fontWeight: '600',
    color: theme.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: theme.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFF',
  },
  secondaryBtn: {
    backgroundColor: theme.accentSoft,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.accent,
  },
  secondaryBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.accentDark,
  },
});