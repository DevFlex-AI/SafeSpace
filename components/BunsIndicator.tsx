// BunsIndicator — Rabbit-themed typing animation for SafeSpace chat
// A playful "bouncing bunny ears" animation to indicate AI is typing
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  withDelay,
} from 'react-native-reanimated';
import theme from '../constants/theme';

export default function BunsIndicator() {
  // Shared values for animation
  const leftEarRotation = useSharedValue(0);
  const rightEarRotation = useSharedValue(0);
  const bounce = useSharedValue(0);
  
  useEffect(() => {
    // Left ear bounce
    leftEarRotation.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 200, easing: Easing.inOut(Easing.ease) }),
        withTiming(10, { duration: 150, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 150, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Right ear bounce (slightly offset)
    rightEarRotation.value = withDelay(
      100,
      withRepeat(
        withSequence(
          withTiming(15, { duration: 200, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 200, easing: Easing.inOut(Easing.ease) }),
          withTiming(-10, { duration: 150, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 150, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );

    // Whole head bounce
    bounce.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: 250, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 250, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const leftEarStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${leftEarRotation.value}deg` },
      { translateY: -2 },
    ],
  }));

  const rightEarStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rightEarRotation.value}deg` },
      { translateY: -2 },
    ],
  }));

  const headStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.bunnyHead, headStyle]}>
        {/* Left ear */}
        <Animated.View style={[styles.ear, styles.leftEar, leftEarStyle]}>
          <View style={styles.earInner} />
        </Animated.View>

        {/* Right ear */}
        <Animated.View style={[styles.ear, styles.rightEar, rightEarStyle]}>
          <View style={styles.earInner} />
        </Animated.View>

        {/* Face */}
        <View style={styles.face}>
          {/* Eyes */}
          <View style={styles.eyes}>
            <View style={styles.eye} />
            <View style={styles.eye} />
          </View>
          {/* Nose */}
          <View style={styles.nose} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    paddingLeft: 4,
  },
  bunnyHead: {
    width: 48,
    height: 44,
    position: 'relative',
  },
  ear: {
    position: 'absolute',
    width: 14,
    height: 26,
    backgroundColor: theme.primaryLight,
    borderRadius: 7,
    top: -12,
    borderWidth: 1,
    borderColor: theme.primary,
  },
  leftEar: {
    left: 6,
    transformOrigin: 'bottom center',
  },
  rightEar: {
    right: 6,
    transformOrigin: 'bottom center',
  },
  earInner: {
    position: 'absolute',
    width: 8,
    height: 16,
    backgroundColor: theme.primarySoft,
    borderRadius: 4,
    top: 4,
    left: 3,
  },
  face: {
    width: 40,
    height: 32,
    backgroundColor: theme.primaryLight,
    borderRadius: 20,
    marginLeft: 4,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.primary,
  },
  eyes: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  eye: {
    width: 6,
    height: 8,
    backgroundColor: theme.textPrimary,
    borderRadius: 3,
  },
  nose: {
    width: 8,
    height: 6,
    backgroundColor: theme.primary,
    borderRadius: 4,
    marginTop: 4,
  },
});