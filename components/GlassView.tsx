// GlassView — Liquid Glass component with frosted glass effect
// Uses expo-blur for the glassmorphism effect
import React from 'react';
import { StyleSheet, View, ViewStyle, Pressable, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import theme from '../constants/theme';

export type GlassVariant = 'light' | 'medium' | 'dark' | 'primary' | 'accent' | 'urgent';
export type BlurIntensity = 'light' | 'medium' | 'heavy' | 'extreme';

interface GlassViewProps {
  children?: React.ReactNode;
  variant?: GlassVariant;
  blurIntensity?: BlurIntensity;
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
  onPress?: () => void;
  disabled?: boolean;
  hapticFeedback?: boolean;
  elevated?: boolean;
}

export default function GlassView({
  children,
  variant = 'light',
  blurIntensity = 'medium',
  style,
  borderRadius = 16,
  onPress,
  disabled = false,
  hapticFeedback = false,
  elevated = false,
}: GlassViewProps) {
  const glassStyles = theme.glass[variant];
  const blurAmount = theme.blur[blurIntensity];

  const handlePress = () => {
    if (hapticFeedback) Haptics.selectionAsync();
    onPress?.();
  };

  const containerStyle: ViewStyle = {
    borderRadius,
    borderWidth: 1,
    borderColor: glassStyles.border,
    ...(elevated && {
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    }),
  };

  const content = (
    <>
      <BlurView
        intensity={blurAmount}
        tint="default"
        style={[StyleSheet.absoluteFill, { borderRadius }]}
      />
      <LinearGradient
        colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius }]}
      />
      <View style={styles.content}>
        {children}
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        style={[styles.container, containerStyle, style]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={[styles.container, containerStyle, style]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});
