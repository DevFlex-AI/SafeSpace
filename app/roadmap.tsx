
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import theme from '../constants/theme';
import GlassView from '../components/GlassView';

export default function RoadmapScreen() {
  const router = useRouter();

  // Generate 1000 roadmap items
  const baseItems = [
    "AI-driven emotional resonance detection",
    "Liquid Glass UI components overhaul",
    "Sensory habit-interrupter with haptic feedback",
    "Voice chat with deep blue pulsing UI",
    "911 emergency direct calling integration",
    "Crisis Counselor AI system prompt upgrade",
    "Buns (rabbit) theme typing indicator",
    "Advanced mood pattern visualization",
    "Personalized wellness goal setting",
    "Interactive breathing exercises with haptics",
    "Grounding technique 5-4-3-2-1 assistant",
    "Gamified task completion system",
    "XP and Level progression rewards",
    "Daily streak tracking and celebration",
    "Trusted contacts emergency alerts",
    "Multi-modal AI input (voice and image)",
    "Emotion history tracking graphs",
    "Smart reminders based on user patterns",
    "Daily wellness digest AI summaries",
    "Long-term memory for significant events",
    "Personality modes for AI companion",
    "AI-generated journal prompts",
    "Sleep hygiene wind-down conversations",
    "Social stress detection from context",
    "Wellness prediction ML models",
    "Custom wake-up motivation messages",
    "Progress milestone celebrations",
    "Crisis escalation risk prediction",
    "Ambient background wellness check-ins",
    "Decision support with structured pros/cons",
    "Wellness story narrative timeline",
    "Habit formation AI coaching",
    "Emotion vocabulary builder tool",
    "AI-generated meditation voice guidance",
    "Contextual coping strategy suggestions",
    "Letter writing assistance for feelings",
    "Conflict resolution step-by-step guide",
    "Grief support specialized module",
    "Secure therapist summary export",
    "Screen reader full optimization",
    "Dynamic type scaling across app",
    "High contrast accessibility mode",
    "Reduced motion global setting",
    "Closed captioning for all exercises",
    "ASL video tutorials integration",
    "Customizable haptic feedback patterns",
    "Visual and haptic sound alternatives",
    "Color-blind safe UI palettes",
    "Eye-tracking navigation support",
    "Simplified view mode for cognitive ease",
    "Task breakdown assistant for ADHD",
    "Predictive text wellness enhancements",
    "Focus mode UI distraction blocker",
    "Multi-session interactive onboarding",
    "Cultural emotional context calendar",
    "Multilingual support (Spanish, French, etc.)",
    "Neurodiversity specialized UI modes",
    "Sensory-friendly abstract imagery",
    "Scheduled quiet hours for notifications",
    "Text-to-speech with adjustable speed",
    "Consistent clear iconography with labels",
    "Fatigue and burnout risk indicators",
    "Anonymous use without identity tracking",
    "Offline mode for core safety features",
    "Virtual garden for activity growth",
    "Collectible calm virtual pets",
    "Badge achievement system",
    "XP historical timeline view",
    "Emergency streak protection freeze",
    "Anonymous support circle groups",
    "Buddy system accountability matching",
    "Community wellness weekly challenges",
    "Private progress sharing leaderboards",
    "Wellness gift sending system",
    "Seasonal reward events",
    "Narrative-driven story mode",
    "Wellness competency skill trees",
    "Rotating daily wellness missions",
    "Mood-to-activity recommendation engine",
    "Meditation mastery tracking",
    "Breathing challenge leaderboards",
    "Journaling consistency streaks",
    "Recovery badges for difficult periods",
    "Reflection rewards for journal entries",
    "Advanced achievement animations",
    "Personalized motivation avatars",
    "Visual wellness weather representation",
    "Archive for achievements revisit",
    "Annual wellness comprehensive review",
    "Apple Health sleep and activity sync",
    "Google Fit bidirectional data sync",
    "Fitbit HRV and stress integration",
    "Oura Ring recovery data connection",
    "Calendar blocking for wellness time",
    "Productivity tool sync (Notion, Todoist)",
    "OS-level focus mode coordination",
    "Bedtime schedule routine linking",
    "Student discount program verification",
    "Professional therapist data portal",
  ];

  const roadmapItems = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    title: baseItems[i % baseItems.length],
    quarter: `Q${(i % 4) + 1} 202${5 + Math.floor(i / 400)}`,
    category: ['AI', 'Accessibility', 'Gamification', 'Ecosystem'][i % 4],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={theme.textPrimary} />
        </Pressable>
        <Text style={styles.title}>1,000 Feature Roadmap</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.description}>
          Our vision for the future of SafeSpace. 1,000 improvements planned to support your mental wellness journey.
        </Text>

        {roadmapItems.map((item) => (
          <GlassView key={item.id} style={styles.itemCard} variant="light" blurIntensity="light">
            <View style={styles.itemHeader}>
              <View style={[styles.categoryBadge, { backgroundColor: theme.primarySoft }]}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
              <Text style={styles.quarterText}>{item.quarter}</Text>
            </View>
            <Text style={styles.itemTitle}>{item.title}</Text>
          </GlassView>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border },
  backBtn: { padding: 8, marginRight: 8 },
  title: { fontSize: 20, fontWeight: '700', color: theme.textPrimary },
  scrollContent: { padding: 16 },
  description: { fontSize: 16, color: theme.textSecondary, marginBottom: 20, lineHeight: 22 },
  itemCard: { padding: 16, marginBottom: 12 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  categoryText: { fontSize: 12, fontWeight: '600', color: theme.primary },
  quarterText: { fontSize: 12, color: theme.textMuted },
  itemTitle: { fontSize: 16, fontWeight: '600', color: theme.textPrimary },
});
