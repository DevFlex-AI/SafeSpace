// VoiceChatOverlay — Full-screen voice chat interface with animated soundwaves
// Blue background with pulsing talking indicator
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import theme from '../constants/theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface VoiceChatOverlayProps {
  visible: boolean;
  onClose: () => void;
  isListening?: boolean;
  audioLevel?: number; // 0-1 range for waveform
}

function SoundwaveBar({ index, audioLevel }: { index: number; audioLevel: number }) {
  const height = useSharedValue(20);

  useEffect(() => {
    // Animate based on audio level + random offset for natural look
    const baseHeight = 20 + audioLevel * 60;
    const randomOffset = Math.sin(index * 0.5) * 15;
    
    height.value = withRepeat(
      withSequence(
        withTiming(baseHeight + randomOffset, { duration: 200 + index * 50, easing: Easing.inOut(Easing.ease) }),
        withTiming(baseHeight - randomOffset * 0.5, { duration: 200 + index * 50, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [audioLevel]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return (
    <Animated.View style={[styles.waveBar, animatedStyle]} />
  );
}

function PulsingCircle({ isActive }: { isActive: boolean }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    if (isActive) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.6, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      scale.value = withTiming(1, { duration: 300 });
      opacity.value = withTiming(0.6, { duration: 300 });
    }
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.pulseCircle, animatedStyle]} />
  );
}

export default function VoiceChatOverlay({
  visible,
  onClose,
  isListening = true,
  audioLevel = 0.5,
}: VoiceChatOverlayProps) {
  const handleClose = () => {
    Haptics.selectionAsync();
    onClose();
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* Deep blue background with blur */}
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.blueBackground} />

      {/* Close button */}
      <Pressable style={styles.closeButton} onPress={handleClose}>
        <MaterialIcons name="close" size={28} color="#FFF" />
      </Pressable>

      {/* Main content */}
      <View style={styles.content}>
        {/* Talking indicator */}
        <View style={styles.talkingContainer}>
          <PulsingCircle isActive={isListening} />
          <View style={styles.micCircle}>
            <MaterialIcons name="mic" size={40} color="#FFF" />
          </View>
        </View>

        {/* Status text */}
        <Text style={styles.statusText}>
          {isListening ? 'Listening...' : 'Processing...'}
        </Text>
        <Text style={styles.subText}>
          Speak naturally, I&apos;m here to help
        </Text>

        {/* Soundwave visualization */}
        <View style={styles.waveform}>
          {Array.from({ length: 12 }).map((_, i) => (
            <SoundwaveBar key={i} index={i} audioLevel={audioLevel} />
          ))}
        </View>

        {/* End call button */}
        <Pressable 
          style={styles.endButton}
          onPress={handleClose}
        >
          <MaterialIcons name="call-end" size={24} color="#FFF" />
          <Text style={styles.endButtonText}>End Voice Chat</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 1000,
  },
  blueBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.voiceChat.background,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  talkingContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  pulseCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: theme.voiceChat.bubble,
  },
  micCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.voiceChat.bubble,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  statusText: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.voiceChat.text,
    marginBottom: 8,
  },
  subText: {
    fontSize: 16,
    color: theme.voiceChat.icon,
    marginBottom: 48,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    gap: 6,
    marginBottom: 60,
  },
  waveBar: {
    width: 6,
    backgroundColor: theme.voiceChat.waveform,
    borderRadius: 3,
  },
  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(232, 139, 139, 0.4)',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  endButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});