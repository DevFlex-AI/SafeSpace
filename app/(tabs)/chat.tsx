// Chat Screen — AI companion with safety layer + glassmorphism + voice chat
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn, SlideInRight, SlideInLeft, FadeInDown,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import theme from '../../constants/theme';
import { useApp } from '../../contexts/AppContext';
import { getAIResponse, getQuickActions } from '../../services/aiChat';
import { APP_CONFIG } from '../../constants/config';
import BunsIndicator from '../../components/BunsIndicator';
import EmergencyButton from '../../components/EmergencyButton';

const SUGGESTED_PROMPTS = [
  { emoji: '😰', label: 'I feel anxious about school', message: 'I feel really anxious about school and I do not know what to do' },
  { emoji: '😔', label: 'I need motivation', message: 'I have no motivation today and everything feels hard' },
  { emoji: '🧠', label: 'I can not focus', message: 'I can not focus on anything today and my mind keeps wandering' },
  { emoji: '😴', label: 'I feel exhausted', message: 'I feel so tired and exhausted I do not want to do anything' },
  { emoji: '😊', label: 'Something good happened', message: 'Something good happened today and I want to share it' },
  { emoji: '💭', label: 'I just need to talk', message: 'I just need someone to talk to right now' },
];

function TypingIndicator() {
  return <BunsIndicator />;
}

function CrisisBanner() {
  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.crisisBanner}>
      <BlurView intensity={15} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.crisisContent}>
        <MaterialIcons name="warning" size={20} color="#FFF" />
        <View style={{ flex: 1 }}>
          <Text style={styles.crisisTitle}>You are not alone</Text>
          <Text style={styles.crisisText}>
            {'\u{1F4DE}'} {APP_CONFIG.safety.crisisResources.phoneName}: {APP_CONFIG.safety.crisisResources.phone}
          </Text>
          <Text style={styles.crisisText}>
            {'\u{1F4AC}'} {APP_CONFIG.safety.crisisResources.name}: {APP_CONFIG.safety.crisisResources.action}
          </Text>
        </View>
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

  const sendMessage = (text?: string) => {
    const trimmed = (text || input).trim();
    if (!trimmed || isTyping) return;
    Haptics.selectionAsync();
    addMessage(trimmed, 'user');
    setInput('');
    setIsTyping(true);
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
  const showSuggestedPrompts = messages.length <= 2 && !isTyping;

  const handleQuickAction = (action: string) => {
    Haptics.selectionAsync();
    if (action === 'breathing') router.push('/breathing');
    else if (action === 'grounding') router.push('/grounding');
    else if (action === 'task') router.push('/(tabs)/tasks');
    else if (action === 'mood') router.push('/(tabs)/mood');
    else {
      const labels: Record<string, string> = {
        talk: 'I need to talk about something',
        journal: 'I want to write about how I feel',
        movement: 'I need some movement suggestions',
        hydrate: 'Remind me to take care of myself',
        rest: 'I think I need to rest',
      };
      sendMessage(labels[action] || '');
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <EmergencyButton />
      {/* Header with glass effect */}
      <BlurView intensity={20} tint="light" style={styles.headerGlass}>
        <View style={styles.header}>
          <Image source={require('../../assets/images/chat-companion.png')} style={styles.avatar} contentFit="cover" />
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>SafeSpace</Text>
            <Text style={styles.headerSub}>Always here for you</Text>
          </View>
          {/* Voice chat button */}
          <Pressable 
            style={styles.voiceBtn} 
            onPress={() => { Haptics.selectionAsync(); router.push('/voice-chat'); }}
          >
            <MaterialIcons name="mic" size={24} color="#FFF" />
          </Pressable>
        </View>
      </BlurView>

      {showCrisis ? <CrisisBanner /> : null}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg) => (
            <Animated.View
              key={msg.id}
              entering={msg.sender === 'user' ? SlideInRight.duration(250) : SlideInLeft.duration(250)}
              style={[styles.messageRow, msg.sender === 'user' ? styles.userRow : styles.aiRow]}
            >
              <View style={msg.sender === 'user' ? styles.userBubble : styles.aiBubble}>
                <Text style={msg.sender === 'user' ? styles.userText : styles.aiText}>{msg.content}</Text>
              </View>
              <Text style={[styles.timestamp, msg.sender === 'user' ? styles.timestampRight : styles.timestampLeft]}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </Animated.View>
          ))}

          {/* Suggested prompts — shown at start of conversation */}
          {showSuggestedPrompts ? (
            <Animated.View entering={FadeInDown.duration(400).delay(300)} style={styles.suggestedSection}>
              <Text style={styles.suggestedTitle}>Not sure what to say? Try one of these:</Text>
              <View style={styles.suggestedGrid}>
                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                  <Pressable
                    key={idx}
                    style={styles.suggestedCard}
                    onPress={() => sendMessage(prompt.message)}
                  >
                    <Text style={styles.suggestedEmoji}>{prompt.emoji}</Text>
                    <Text style={styles.suggestedLabel}>{prompt.label}</Text>
                  </Pressable>
                ))}
              </View>
            </Animated.View>
          ) : null}

          {isTyping ? <TypingIndicator /> : null}
        </ScrollView>

        {/* Quick Actions */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActions}>
          {quickActions.map((action, idx) => (
            <Pressable key={idx} style={styles.quickActionBtn} onPress={() => handleQuickAction(action.action)}>
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
            placeholder="Type how you are feeling..."
            placeholderTextColor={theme.textMuted}
            multiline
            maxLength={APP_CONFIG.chat.maxMessageLength}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage()}
            blurOnSubmit={false}
          />
          <Pressable
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || isTyping}
          >
            <MaterialIcons name="send" size={22} color={input.trim() ? '#FFF' : theme.textMuted} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  
  // Header with glass
  headerGlass: {
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 12, 
    backgroundColor: 'rgba(255,255,255,0.5)',
    gap: 12,
  },
  headerInfo: { flex: 1 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: theme.textPrimary },
  headerSub: { fontSize: 12, color: theme.textSecondary },
  
  // Voice chat button
  voiceBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Crisis banner with glass
  crisisBanner: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    backgroundColor: theme.error,
    padding: 14, 
    gap: 10, 
    marginHorizontal: 12, 
    marginTop: 8, 
    borderRadius: theme.radius.md,
    overflow: 'hidden',
  },
  crisisContent: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, flex: 1 },
  crisisTitle: { fontSize: 14, fontWeight: '700', color: '#FFF', marginBottom: 4 },
  crisisText: { fontSize: 13, color: '#FFF', lineHeight: 20 },

  messageList: { padding: 16, paddingBottom: 8 },
  messageRow: { marginBottom: 12, maxWidth: '82%' },
  userRow: { alignSelf: 'flex-end' },
  aiRow: { alignSelf: 'flex-start' },
  userBubble: { 
    backgroundColor: theme.primary, 
    borderRadius: 20, 
    borderBottomRightRadius: 6, 
    paddingHorizontal: 16, 
    paddingVertical: 12,
  },
  aiBubble: { 
    backgroundColor: 'rgba(255,255,255,0.7)', 
    borderRadius: 20, 
    borderBottomLeftRadius: 6, 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    shadowColor: theme.shadowColor, 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.08, 
    shadowRadius: 4, 
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  userText: { fontSize: 16, color: '#FFF', lineHeight: 22 },
  aiText: { fontSize: 16, color: theme.textPrimary, lineHeight: 22 },
  timestamp: { fontSize: 11, color: theme.textMuted, marginTop: 4 },
  timestampRight: { textAlign: 'right' },
  timestampLeft: { textAlign: 'left' },

  // Suggested prompts
  suggestedSection: { marginTop: 8, marginBottom: 16 },
  suggestedTitle: { fontSize: 14, fontWeight: '500', color: theme.textSecondary, marginBottom: 12, textAlign: 'center' },
  suggestedGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  suggestedCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.6)', 
    borderRadius: theme.radius.lg, 
    paddingHorizontal: 14, 
    paddingVertical: 12, 
    gap: 8, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.8)',
    width: '48%' as any, 
    minWidth: 150,
  },
  suggestedEmoji: { fontSize: 20 },
  suggestedLabel: { fontSize: 13, fontWeight: '500', color: theme.textPrimary, flex: 1 },

  quickActions: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  quickActionBtn: { 
    backgroundColor: 'rgba(139,126,200,0.15)', 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: theme.radius.full, 
    borderWidth: 1, 
    borderColor: 'rgba(139,126,200,0.3)' 
  },
  quickActionText: { fontSize: 14, fontWeight: '500', color: theme.primaryDark },
  inputBar: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    paddingHorizontal: 12, 
    paddingTop: 8, 
    backgroundColor: 'rgba(255,255,255,0.6)', 
    borderTopWidth: 1, 
    borderTopColor: theme.border, 
    gap: 8 
  },
  input: { 
    flex: 1, 
    backgroundColor: 'rgba(255,255,255,0.8)', 
    borderRadius: theme.radius.xl, 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    fontSize: 16, 
    color: theme.textPrimary, 
    maxHeight: 100, 
    minHeight: 44,
    borderWidth: 1,
    borderColor: theme.border,
  },
  sendBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: theme.primary, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  sendBtnDisabled: { backgroundColor: theme.backgroundSecondary },
});
