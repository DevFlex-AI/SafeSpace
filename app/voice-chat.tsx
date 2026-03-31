
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import theme from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

function SoundwaveBar({ index, audioLevel }: { index: number; audioLevel: number }) {
  const height = useSharedValue(20);

  useEffect(() => {
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
  }, [audioLevel, height, index]);

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
  }, [isActive, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.pulseCircle, animatedStyle]} />
  );
}

export default function VoiceChatScreen() {
  const router = useRouter();
  const [isListening] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0.5);

  useEffect(() => {
    const interval = setInterval(() => {
      setAudioLevel(Math.random());
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.blueBackground} />
      
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <MaterialIcons name="close" size={28} color="#FFF" />
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.talkingContainer}>
            <PulsingCircle isActive={isListening} />
            <View style={styles.micCircle}>
              <MaterialIcons name="mic" size={40} color="#FFF" />
            </View>
          </View>

          <Text style={styles.statusText}>
            {isListening ? 'Listening...' : 'Processing...'}
          </Text>
          <Text style={styles.subText}>
            Speak naturally, I&apos;m here to help
          </Text>

          <View style={styles.waveform}>
            {Array.from({ length: 12 }).map((_, i) => (
              <SoundwaveBar key={i} index={i} audioLevel={audioLevel} />
            ))}
          </View>

          <Pressable 
            style={styles.endButton}
            onPress={handleClose}
          >
            <MaterialIcons name="call-end" size={24} color="#FFF" />
            <Text style={styles.endButtonText}>End Voice Chat</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E40AF',
  },
  blueBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.voiceChat?.background || '#1E40AF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'flex-end',
  },
  closeButton: {
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
    paddingBottom: 100,
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
    backgroundColor: theme.voiceChat?.bubble || 'rgba(59, 130, 246, 0.6)',
  },
  micCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.voiceChat?.bubble || 'rgba(59, 130, 246, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  statusText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subText: {
    fontSize: 16,
    color: '#93C5FD',
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
    backgroundColor: theme.voiceChat?.waveform || '#93C5FD',
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
