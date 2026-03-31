// GlassToast — Glass-styled in-app notification component
// Floats with blur effect for push notification previews
import React, { useEffect } from 'react';
import { Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '../constants/theme';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

interface GlassToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss?: () => void;
  style?: ViewStyle;
}

const ICONS: Record<ToastType, string> = {
  info: 'info',
  success: 'check-circle',
  warning: 'warning',
  error: 'error',
};

const COLORS: Record<ToastType, { bg: string; border: string; icon: string }> = {
  info: { bg: 'rgba(135, 206, 235, 0.25)', border: 'rgba(135, 206, 235, 0.5)', icon: '#1E40AF' },
  success: { bg: 'rgba(107, 197, 160, 0.25)', border: 'rgba(107, 197, 160, 0.5)', icon: '#4BA882' },
  warning: { bg: 'rgba(242, 208, 107, 0.3)', border: 'rgba(242, 208, 107, 0.5)', icon: '#B8860B' },
  error: { bg: 'rgba(232, 139, 139, 0.3)', border: 'rgba(232, 139, 139, 0.5)', icon: '#C53030' },
};

export default function GlassToast({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onDismiss,
  style,
}: GlassToastProps) {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 200 });

      // Auto-dismiss
      if (duration > 0) {
        const timer = setTimeout(() => {
          dismissToast();
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      translateY.value = withTiming(-100, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const dismissToast = () => {
    translateY.value = withTiming(-100, { duration: 200 }, (finished) => {
      if (finished && onDismiss) {
        runOnJS(onDismiss)();
      }
    });
    opacity.value = withTiming(0, { duration: 200 });
    Haptics.selectionAsync();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  const colorScheme = COLORS[type];

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      <BlurView intensity={20} tint="light" style={styles.blur} />
      <Animated.View
        style={[
          styles.toast,
          {
            backgroundColor: colorScheme.bg,
            borderColor: colorScheme.border,
          },
        ]}
      >
        <MaterialIcons name={ICONS[type] as any} size={22} color={colorScheme.icon} />
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
        <Pressable onPress={dismissToast} hitSlop={8}>
          <MaterialIcons name="close" size={18} color={theme.textSecondary} />
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    shadowColor: theme.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  message: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: theme.textPrimary,
    lineHeight: 20,
  },
});