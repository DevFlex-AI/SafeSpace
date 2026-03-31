// GlassView — Liquid Glass component with frosted glass effect
// Uses expo-blur for the glassmorphism effect
import React from 'react';
import { StyleSheet, View, ViewStyle, Pressable, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

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
  elevated?: boolean; // Adds shadow for elevated appearance
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
    if (hapticFeedback) {
      Haptics.selectionAsync();
    }
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

  // For accessibility - reduced motion/blur preference
  // If blur is not supported or reduced, we use a simple semi-transparent view
  const useFallback = false; // Could check AppContext.settings.reducedMotion here

  const content = (
    <>
      {/* Background blur layer */}
      <BlurView
        intensity={blurAmount}
        tint="default"
        style={[StyleSheet.absoluteFill, { borderRadius }]}
      />
      
      {/* Gradient overlay for depth */}
      <LinearGradient
        colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius }]}
      />
      
      {/* Content */}
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

// TypeScript reference to theme
import theme from '../constants/theme';