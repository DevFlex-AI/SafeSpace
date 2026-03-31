import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { AuthRouter } from '@/template';
import { Redirect } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay, 
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../constants/theme';

const { width, height } = Dimensions.get('window');

function LiquidGlassAnimation({ onComplete }: { onComplete: () => void }) {
  const blob1Scale = useSharedValue(0.8);
  const blob2Scale = useSharedValue(0.8);
  const blob3Scale = useSharedValue(0.8);
  const textOpacity = useSharedValue(0);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    // Animate blobs
    blob1Scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.8, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    blob2Scale.value = withDelay(1000, withRepeat(
      withSequence(
        withTiming(1.3, { duration: 3500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.7, { duration: 3500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    ));
    blob3Scale.value = withDelay(500, withRepeat(
      withSequence(
        withTiming(1.1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.9, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    ));

    // Animate text
    textOpacity.value = withDelay(500, withTiming(1, { duration: 1000 }));

    // Finish after 3 seconds
    const timer = setTimeout(() => {
      containerOpacity.value = withTiming(0, { duration: 800 }, () => {
        onComplete();
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [blob1Scale, blob2Scale, blob3Scale, containerOpacity, onComplete, textOpacity]);

  const blob1Style = useAnimatedStyle(() => ({
    transform: [{ scale: blob1Scale.value }, { translateX: -50 }, { translateY: -50 }],
  }));
  const blob2Style = useAnimatedStyle(() => ({
    transform: [{ scale: blob2Scale.value }, { translateX: 50 }, { translateY: 50 }],
  }));
  const blob3Style = useAnimatedStyle(() => ({
    transform: [{ scale: blob3Scale.value }, { translateX: 0 }, { translateY: 100 }],
  }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: withTiming(textOpacity.value ? 0 : 20, { duration: 1000 }) }]
  }));
  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  return (
    <Animated.View style={[styles.animationContainer, containerStyle]}>
      <LinearGradient
        colors={[theme.background, '#E0D7FF']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Background blobs */}
      <Animated.View style={[styles.blob, styles.blob1, blob1Style]} />
      <Animated.View style={[styles.blob, styles.blob2, blob2Style]} />
      <Animated.View style={[styles.blob, styles.blob3, blob3Style]} />

      <BlurView intensity={60} style={StyleSheet.absoluteFill} tint="light" />

      <Animated.View style={[styles.content, textStyle]}>
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={[theme.primaryLight, theme.primary]}
            style={styles.logoGradient}
          />
          <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="light" />
        </View>
        <Text style={styles.appName}>SafeSpace</Text>
        <Text style={styles.tagline}>Liquid Glass Edition</Text>
      </Animated.View>
    </Animated.View>
  );
}

export default function RootScreen() {
  const [showAnimation, setShowAnimation] = useState(true);

  if (showAnimation) {
    return <LiquidGlassAnimation onComplete={() => setShowAnimation(false)} />;
  }

  return (
    <AuthRouter loginRoute="/login">
      <Redirect href="/(tabs)" />
    </AuthRouter>
  );
}

const styles = StyleSheet.create({
  animationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  blob: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.5,
  },
  blob1: {
    backgroundColor: theme.primaryLight,
    top: height * 0.3,
    left: width * 0.3,
  },
  blob2: {
    backgroundColor: theme.accentLight,
    top: height * 0.5,
    right: width * 0.2,
  },
  blob3: {
    backgroundColor: theme.warmLight,
    bottom: height * 0.2,
    left: width * 0.4,
  },
  content: {
    alignItems: 'center',
    zIndex: 10,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  logoGradient: {
    flex: 1,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.textPrimary,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    color: theme.textSecondary,
    marginTop: 8,
    fontWeight: '500',
  },
});
