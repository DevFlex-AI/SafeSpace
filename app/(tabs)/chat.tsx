// Chat Screen — AI companion with safety layer
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, TextInput,
  KeyboardAvoidingView, Platform, Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing,
  FadeIn, FadeInUp, SlideInRight, SlideInLeft,
} from 'react-native-reanimated';
import theme from '../../constants/theme';
import { useApp } from '../../contexts/AppContext';
import { getAIResponse, getQuickActions } from '../../services/aiChat';
import { APP_CONFIG } from '../../constants/config';

function TypingIndicator() {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    dot1.value = withRepeat(withTiming(-6, { duration: 400, easing: Easing.inOut(Easing.ease) }), -1, true);
    setTimeout(() => {
      dot2.value = withRepeat(withTiming(-6, { duration: 400, easing: Easing.inOut(Easing.ease) }), -1, true);
    }, 150);
    setTimeout(() => {
      dot3.value = withRepeat(withTiming(-6, { duration: 400, easing: Easing.inOut(Easing.ease) }), -1, true);
    }, 300);
  }, []);

  const s1 = useAnimatedStyle(() => ({ transform: [{ translateY: dot1.value }] }));
  const s2 = useAnimatedStyle(() => ({ transform: [{ translateY: dot2.value }] }));
  const s3 = useAnimatedStyle(() => ({ transform: [{ translateY: dot3.value }] }));

  return (
    <View style={styles.typingContainer}>
      <View style={styles.aiBubble}>
        <View style={styles.typingDots}>
          <Animated.View style={[styles.dot, s1]} />
          <Animated.View style={[styles.dot, s2]} />
          <Animated.View style={[styles.dot, s3]} />
        </View>
      </View>
    </View>
  );
}

function CrisisBanner() {
  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.crisisBanner}>
      <MaterialIcons name="warning" size={20} color="#FFF" />
      <View style={{ flex: 1 }}>
        <Text style={styles.crisisTitle}>You're not alone</Text>
        <Text style={styles.crisisText}>
          📞 {APP_CONFIG.safety.crisisResources.phoneName}: {APP_CONFIG.safety.crisisResources.phone}
        </Text>
        <Text style={styles.crisisText}>
          💬 {APP_CONFIG.safety.crisisResources.name}: {APP_CONFIG.safety.crisisResources.action}
        </Text>
      </View>
    </Animated.View>
  );
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { messages, addMessage } = useApp();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCrisis, setShowCrisis] = useState(false);
  const [lastEmotion, setLastEmotion] = useState('neutral');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, isTyping]);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    Haptics.selectionAsync();
    addMessage(trimmed, 'user');
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      const result = getAIResponse(trimmed);
      addMessage(result.response, 'ai', result.emotion);
      setLastEmotion(result.emotion);
      setIsTyping(false);

      if (result.isDistress) {
        setShowCrisis(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    }, APP_CONFIG.chat.typingDelay + Math.random() * 600);
  };

  const quickActions = getQuickActions(lastEmotion);

  const handleQuickAction = (action: string) => {
    Haptics.selectionAsync();
    if (action === 'breathing') router.push('/breathing');
    else if (action === 'grounding') router.push('/grounding');
    else if (action === 'task') router.push('/(tabs)/tasks');
    else if (action === 'mood') router.push('/(tabs)/mood');
    else {
      // Send as message
      const labels: Record<string, string> = {
        talk: 'I need to talk about something',
        journal: 'I want to write about how I feel',
        movement: 'I need some movement suggestions',
        hydrate: 'Remind me to take care of myself',
        rest: 'I think I need to rest',
      };
      setInput(labels[action] || '');
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/chat-companion.png')}
          style={styles.avatar}
          contentFit="cover"
        />
        <View>
          <Text style={styles.headerTitle}>SafeSpace</Text>
          <Text style={styles.headerSub}>Always here for you</Text>
        </View>
      </View>

      {showCrisis && <CrisisBanner />}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg, idx) => (
            <Animated.View
              key={msg.id}
              entering={msg.sender === 'user' ? SlideInRight.duration(250) : SlideInLeft.duration(250)}
              style={[
                styles.messageRow,
                msg.sender === 'user' ? styles.userRow : styles.aiRow,
              ]}
            >
              <View
                style={[
                  msg.sender === 'user' ? styles.userBubble : styles.aiBubble,
                ]}
              >
                <Text style={msg.sender === 'user' ? styles.userText : styles.aiText}>
                  {msg.content}
                </Text>
              </View>
              <Text style={[styles.timestamp, msg.sender === 'user' ? styles.timestampRight : styles.timestampLeft]}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </Animated.View>
          ))}

          {isTyping && <TypingIndicator />}
        </ScrollView>

        {/* Quick Actions */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickActions}
        >
          {quickActions.map((action, idx) => (
            <Pressable
              key={idx}
              style={styles.quickActionBtn}
              onPress={() => handleQuickAction(action.action)}
            >
              <Text style={styles.quickActionText}>{action.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Input Bar */}
        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type how you're feeling..."
            placeholderTextColor={theme.textMuted}
            multiline
            maxLength={APP_CONFIG.chat.maxMessageLength}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
            blurOnSubmit={false}
          />
          <Pressable
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!input.trim() || isTyping}
          >
            <MaterialIcons
              name="send"
              size={22}
              color={input.trim() ? '#FFF' : theme.textMuted}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.surface,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  headerSub: {
    fontSize: 12,
    color: theme.textSecondary,
  },

  // Crisis
  crisisBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E88B8B',
    padding: 14,
    gap: 10,
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: theme.radius.md,
  },
  crisisTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  crisisText: {
    fontSize: 13,
    color: '#FFF',
    lineHeight: 20,
  },

  // Messages
  messageList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageRow: {
    marginBottom: 12,
    maxWidth: '82%',
  },
  userRow: {
    alignSelf: 'flex-end',
  },
  aiRow: {
    alignSelf: 'flex-start',
  },
  userBubble: {
    backgroundColor: theme.primary,
    borderRadius: 20,
    borderBottomRightRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  aiBubble: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: theme.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  userText: {
    fontSize: 16,
    color: '#FFF',
    lineHeight: 22,
  },
  aiText: {
    fontSize: 16,
    color: theme.textPrimary,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 11,
    color: theme.textMuted,
    marginTop: 4,
  },
  timestampRight: {
    textAlign: 'right',
  },
  timestampLeft: {
    textAlign: 'left',
  },

  // Typing
  typingContainer: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    height: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.textMuted,
  },

  // Quick Actions
  quickActions: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  quickActionBtn: {
    backgroundColor: theme.primarySoft,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.primary + '30',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.primaryDark,
  },

  // Input
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: theme.surface,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: theme.backgroundSecondary,
    borderRadius: theme.radius.xl,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.textPrimary,
    maxHeight: 100,
    minHeight: 44,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: theme.backgroundSecondary,
  },
});
