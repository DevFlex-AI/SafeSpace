// Chat Screen — AI companion with safety layer + glassmorphism + voice chat
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, TextInput,
  KeyboardAvoidingView, Platform, Linking, Alert, useWindowDimensions,
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
import VoiceChatOverlay from '../../components/VoiceChatOverlay';

const SUGGESTED_PROMPTS = [
  { emoji: '😰', label: 'I feel anxious about school', message: 'I feel really anxious about school and I do not know what to do' },
  { emoji: '😔', label: 'I need motivation', message: 'I have no motivation today and everything feels hard' },
  { emoji: '🧠', label: 'I can not focus', message: 'I can not focus on anything today and my mind keeps wandering' },
  { emoji: '😴', label: 'I feel exhausted', message: 'I feel so tired and exhausted I do not want to do anything' },
  { emoji: '✋', label: 'I feel an urge', message: 'I am feeling the urge to pull my hair and I need help redirecting it' },
  { emoji: '💭', label: 'I just need to talk', message: 'I just need someone to talk to right now' },
];

function TypingIndicator() {
  return <BunsIndicator />;
}

function CrisisBanner({ contacts }: { contacts: Array<{ name: string; phone: string }> }) {
  const call911 = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('🚨 Call Emergency Services?', 'This will call 911 immediately.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call 911', style: 'destructive', onPress: () => Linking.openURL('tel:911') },
    ]);
  };

  const callContact = (phone: string, name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(`Call ${name}?`, `This will open your phone to call ${name}.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: `Call ${name}`, onPress: () => Linking.openURL(`tel:${phone.replace(/\D/g, '')}`) },
    ]);
  };

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.crisisBanner}>
      <BlurView intensity={15} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.crisisContent}>
        <MaterialIcons name="warning" size={20} color="#FFF" />
        <View style={{ flex: 1 }}>
          <Text style={styles.crisisTitle}>You are not alone — help is here</Text>
          <Text style={styles.crisisText}>
            📞 {APP_CONFIG.safety.crisisResources.phoneName}: {APP_CONFIG.safety.crisisResources.phone}
          </Text>
          <Text style={styles.crisisText}>
            💬 {APP_CONFIG.safety.crisisResources.name}: {APP_CONFIG.safety.crisisResources.action}
          </Text>
          {/* 911 button */}
          <Pressable style={styles.crisis911Btn} onPress={call911}>
            <MaterialIcons name="local-phone" size={14} color="#FFF" />
            <Text style={styles.crisis911Text}>Call 911 Now</Text>
          </Pressable>
          {/* Trusted contacts */}
          {contacts.length > 0 && (
            <View style={styles.crisisContactsRow}>
              {contacts.slice(0, 3).map((c, i) => (
                <Pressable key={i} style={styles.crisisContactBtn} onPress={() => callContact(c.phone, c.name)}>
                  <MaterialIcons name="person" size={12} color="#FFF" />
                  <Text style={styles.crisisContactName}>{c.name}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const router = useRouter();
  const { messages, addMessage, contacts } = useApp();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCrisis, setShowCrisis] = useState(false);
  const [lastEmotion, setLastEmotion] = useState('neutral');
  const [showVoiceChat, setShowVoiceChat] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const isTablet = SCREEN_WIDTH >= 768;

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, isTyping]);

  const sendMessage = useCallback((text?: string) => {
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
  }, [input, isTyping, addMessage]);

  const handleQuickAction = (action: string) => {
    Haptics.selectionAsync();
    if (action === 'breathing') router.push('/breathing');
    else if (action === 'grounding') router.push('/grounding');
    else if (action === 'urge') router.push('/urge' as any);
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

  const quickActions = getQuickActions(lastEmotion);
  const showSuggestedPrompts = messages.length <= 2 && !isTyping;

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {/* Voice Chat Overlay */}
      <VoiceChatOverlay
        visible={showVoiceChat}
        onClose={() => { setShowVoiceChat(false); setIsListening(false); }}
        isListening={isListening}
        audioLevel={isListening ? 0.7 : 0}
      />

      <View style={styles.header}>
        <Image source={require('../../assets/images/chat-companion.png')} style={styles.avatar} contentFit="cover" />
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>SafeSpace</Text>
          <View style={styles.onlineRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.headerSub}>Always here for you</Text>
          </View>
        </View>
        {/* Voice chat button */}
        <Pressable
          style={styles.voiceBtn}
          onPress={() => { Haptics.selectionAsync(); setShowVoiceChat(true); }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
          <MaterialIcons name="mic" size={20} color={theme.primary} />
        </Pressable>
      </View>

      {showCrisis ? <CrisisBanner contacts={contacts || []} /> : null}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.messageList,
            isTablet && { maxWidth: 640, alignSelf: 'center', width: '100%' },
          ]}
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

          {showSuggestedPrompts ? (
            <Animated.View entering={FadeInDown.duration(400).delay(300)} style={styles.suggestedSection}>
              <Text style={styles.suggestedTitle}>Not sure what to say? Try one of these:</Text>
              <View style={styles.suggestedGrid}>
                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                  <Pressable key={idx} style={styles.suggestedCard} onPress={() => sendMessage(prompt.message)}>
                    <Text style={styles.suggestedEmoji}>{prompt.emoji}</Text>
                    <Text style={styles.suggestedLabel}>{prompt.label}</Text>
                  </Pressable>
                ))}
              </View>
            </Animated.View>
          ) : null}

          {isTyping ? <TypingIndicator /> : null}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActions}>
          {quickActions.map((action, idx) => (
            <Pressable key={idx} style={styles.quickActionBtn} onPress={() => handleQuickAction(action.action)}>
              <Text style={styles.quickActionText}>{action.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

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
            style={styles.voiceInlineBtn}
            onPress={() => { Haptics.selectionAsync(); setShowVoiceChat(true); }}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <MaterialIcons name="mic-none" size={20} color={theme.primary} />
          </Pressable>
          <Pressable
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || isTyping}
          >
            <MaterialIcons name="send" size={22} color={input.trim() ? '#FFF' : theme.textMuted} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <EmergencyButton />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: theme.border,
    backgroundColor: theme.surface, gap: 10,
  },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: theme.textPrimary },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 1 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4CAF50' },
  headerSub: { fontSize: 11, color: theme.textSecondary },
  voiceBtn: {
    width: 38, height: 38, borderRadius: 19,
    overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: theme.border, flexShrink: 0,
  },
  crisisBanner: {
    overflow: 'hidden', backgroundColor: '#C62828',
  },
  crisisContent: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 16, paddingVertical: 12, gap: 8,
  },
  crisisTitle: { fontSize: 13, fontWeight: '700', color: '#FFF', marginBottom: 3 },
  crisisText: { fontSize: 12, color: 'rgba(255,255,255,0.9)', lineHeight: 18 },
  crisis911Btn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6, marginTop: 7, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)',
  },
  crisis911Text: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  crisisContactsRow: { flexDirection: 'row', gap: 6, marginTop: 5, flexWrap: 'wrap' },
  crisisContactBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  crisisContactName: { fontSize: 11, color: '#FFF', fontWeight: '600' },
  messageList: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  messageRow: { marginBottom: 6 },
  userRow: { alignItems: 'flex-end' },
  aiRow: { alignItems: 'flex-start' },
  userBubble: {
    backgroundColor: theme.primary, borderRadius: 18, borderBottomRightRadius: 4,
    paddingHorizontal: 14, paddingVertical: 10, maxWidth: '78%',
  },
  aiBubble: {
    backgroundColor: theme.surface, borderRadius: 18, borderBottomLeftRadius: 4,
    paddingHorizontal: 14, paddingVertical: 10, maxWidth: '78%',
    borderWidth: 1, borderColor: theme.border,
  },
  userText: { fontSize: 15, color: '#FFF', lineHeight: 21 },
  aiText: { fontSize: 15, color: theme.textPrimary, lineHeight: 21 },
  timestamp: { fontSize: 10, marginTop: 3 },
  timestampRight: { color: 'rgba(255,255,255,0.6)', alignSelf: 'flex-end' },
  timestampLeft: { color: theme.textMuted },
  suggestedSection: { marginTop: 12, marginBottom: 4 },
  suggestedTitle: { fontSize: 13, fontWeight: '600', color: theme.textSecondary, marginBottom: 10 },
  suggestedGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggestedCard: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: theme.surface, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: theme.border,
  },
  suggestedEmoji: { fontSize: 14 },
  suggestedLabel: { fontSize: 12, fontWeight: '500', color: theme.textPrimary },
  quickActions: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  quickActionBtn: {
    backgroundColor: theme.primarySoft, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1, borderColor: theme.primaryLight + '50',
  },
  quickActionText: { fontSize: 13, fontWeight: '600', color: theme.primary },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: 12, paddingTop: 8,
    borderTopWidth: 1, borderTopColor: theme.border,
    backgroundColor: theme.surface,
  },
  input: {
    flex: 1, backgroundColor: theme.backgroundSecondary, borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 15, color: theme.textPrimary, maxHeight: 100,
    borderWidth: 1, borderColor: theme.border,
  },
  voiceInlineBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: theme.primarySoft,
    alignItems: 'center', justifyContent: 'center', marginBottom: 1,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 1,
  },
  sendBtnDisabled: { backgroundColor: theme.border },
});
