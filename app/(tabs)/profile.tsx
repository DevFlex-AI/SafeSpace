// Profile Screen — Settings, contacts, progress stats
import React, { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, TextInput, Alert, Switch,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import theme from '../../constants/theme';
import { useApp } from '../../contexts/AppContext';
import { APP_CONFIG } from '../../constants/config';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile, updateProfile, updateSettings, contacts, addContact, removeContact } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' });

  const xpProgress = profile.xp / APP_CONFIG.tasks.xpPerLevel;

  const handleSaveName = () => {
    if (editName.trim()) {
      updateProfile({ name: editName.trim() });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setIsEditing(false);
  };

  const handleAddContact = () => {
    if (!newContact.name.trim() || !newContact.phone.trim()) return;
    addContact({
      name: newContact.name.trim(),
      phone: newContact.phone.trim(),
      relationship: newContact.relationship.trim() || 'Other',
      isEmergency: false,
    });
    setNewContact({ name: '', phone: '', relationship: '' });
    setShowAddContact(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleRemoveContact = (id: string, name: string) => {
    Alert.alert('Remove Contact', `Remove ${name} from your trusted contacts?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: () => {
          removeContact(id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        },
      },
    ]);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <Animated.View entering={FadeInDown.duration(500)}>
          <LinearGradient
            colors={['#B8ADE8', '#8B7EC8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileHeader}
          >
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{profile.name.charAt(0).toUpperCase()}</Text>
            </View>

            {isEditing ? (
              <View style={styles.editNameRow}>
                <TextInput
                  style={styles.editNameInput}
                  value={editName}
                  onChangeText={setEditName}
                  autoFocus
                  maxLength={30}
                  returnKeyType="done"
                  onSubmitEditing={handleSaveName}
                />
                <Pressable onPress={handleSaveName} style={styles.editSaveBtn}>
                  <MaterialIcons name="check" size={20} color={theme.primary} />
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={() => { setEditName(profile.name); setIsEditing(true); }}>
                <Text style={styles.profileName}>{profile.name}</Text>
                <Text style={styles.editHint}>Tap to edit name</Text>
              </Pressable>
            )}

            {/* Level */}
            <View style={styles.levelRow}>
              <Text style={styles.levelText}>Level {profile.level}</Text>
              <View style={styles.xpBarWrap}>
                <View style={[styles.xpBarFill, { width: `${xpProgress * 100}%` }]} />
              </View>
              <Text style={styles.xpText}>{profile.xp}/{APP_CONFIG.tasks.xpPerLevel} XP</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.section}>
          <Text style={styles.sectionTitle}>Your Journey</Text>
          <View style={styles.statsGrid}>
            {[
              { icon: 'local-fire-department', value: profile.streak, label: 'Current\nStreak', color: theme.warm },
              { icon: 'emoji-events', value: profile.longestStreak, label: 'Longest\nStreak', color: '#F2D06B' },
              { icon: 'check-circle', value: profile.tasksCompleted, label: 'Tasks\nDone', color: theme.accent },
              { icon: 'star', value: profile.totalXp, label: 'Total\nXP', color: theme.primary },
            ].map((stat, idx) => (
              <View key={idx} style={styles.statCard}>
                <MaterialIcons name={stat.icon as any} size={24} color={stat.color} />
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Trusted Contacts */}
        <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trusted Contacts</Text>
            <Pressable
              style={styles.addBtn}
              onPress={() => { Haptics.selectionAsync(); setShowAddContact(!showAddContact); }}
            >
              <MaterialIcons name={showAddContact ? 'close' : 'add'} size={20} color={theme.primary} />
            </Pressable>
          </View>

          {showAddContact && (
            <Animated.View entering={FadeInDown.duration(300)} style={styles.addContactCard}>
              <TextInput
                style={styles.contactInput}
                value={newContact.name}
                onChangeText={(t) => setNewContact(prev => ({ ...prev, name: t }))}
                placeholder="Name"
                placeholderTextColor={theme.textMuted}
              />
              <TextInput
                style={styles.contactInput}
                value={newContact.phone}
                onChangeText={(t) => setNewContact(prev => ({ ...prev, phone: t }))}
                placeholder="Phone number"
                placeholderTextColor={theme.textMuted}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.contactInput}
                value={newContact.relationship}
                onChangeText={(t) => setNewContact(prev => ({ ...prev, relationship: t }))}
                placeholder="Relationship (e.g., Teacher)"
                placeholderTextColor={theme.textMuted}
              />
              <Pressable style={styles.saveContactBtn} onPress={handleAddContact}>
                <Text style={styles.saveContactBtnText}>Add Contact</Text>
              </Pressable>
            </Animated.View>
          )}

          {contacts.map((contact) => (
            <View key={contact.id} style={styles.contactCard}>
              <View style={styles.contactIcon}>
                <MaterialIcons name="person" size={22} color={theme.primary} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactRel}>{contact.relationship} · {contact.phone}</Text>
              </View>
              {contact.isEmergency && (
                <View style={styles.emergencyBadge}>
                  <Text style={styles.emergencyText}>SOS</Text>
                </View>
              )}
              <Pressable
                style={styles.contactAction}
                onPress={() => handleRemoveContact(contact.id, contact.name)}
              >
                <MaterialIcons name="more-vert" size={20} color={theme.textMuted} />
              </Pressable>
            </View>
          ))}

          <View style={styles.crisisCard}>
            <MaterialIcons name="phone" size={20} color={theme.error} />
            <View style={{ flex: 1 }}>
              <Text style={styles.crisisLabel}>{APP_CONFIG.safety.crisisResources.phoneName}</Text>
              <Text style={styles.crisisNumber}>Call or text {APP_CONFIG.safety.crisisResources.phone}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Settings */}
        <Animated.View entering={FadeInDown.duration(500).delay(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsCard}>
            {[
              { label: 'Notifications', key: 'notifications', icon: 'notifications-none' },
              { label: 'Mood Reminders', key: 'moodReminders', icon: 'schedule' },
              { label: 'Task Reminders', key: 'taskReminders', icon: 'alarm' },
              { label: 'Reduced Motion', key: 'reducedMotion', icon: 'accessibility' },
            ].map((setting, idx) => (
              <View
                key={setting.key}
                style={[styles.settingRow, idx > 0 && styles.settingBorder]}
              >
                <MaterialIcons name={setting.icon as any} size={22} color={theme.textSecondary} />
                <Text style={styles.settingLabel}>{setting.label}</Text>
                <Switch
                  value={(profile.settings as any)[setting.key]}
                  onValueChange={(val) => {
                    Haptics.selectionAsync();
                    updateSettings({ [setting.key]: val });
                  }}
                  trackColor={{ false: theme.border, true: theme.primaryLight }}
                  thumbColor={
                    (profile.settings as any)[setting.key] ? theme.primary : '#f4f3f4'
                  }
                />
              </View>
            ))}
          </View>
        </Animated.View>

        {/* About */}
        <Animated.View entering={FadeInDown.duration(500).delay(400)} style={styles.section}>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutName}>{APP_CONFIG.name}</Text>
            <Text style={styles.aboutVersion}>Version {APP_CONFIG.version}</Text>
            <Text style={styles.aboutDesc}>{APP_CONFIG.description}</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },

  // Profile Header
  profileHeader: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 28,
    paddingHorizontal: 20,
    marginHorizontal: 0,
    borderBottomLeftRadius: theme.radius.xxl,
    borderBottomRightRadius: theme.radius.xxl,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
  },
  editHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 2,
  },
  editNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editNameInput: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: theme.radius.md,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 18,
    fontWeight: '600',
    color: theme.textPrimary,
    minWidth: 180,
    textAlign: 'center',
  },
  editSaveBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelRow: {
    width: '100%',
    marginTop: 16,
    gap: 6,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  xpBarWrap: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: 8,
    backgroundColor: '#FFF',
    borderRadius: 4,
  },
  xpText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },

  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: theme.surface,
    borderRadius: theme.radius.lg,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    shadowColor: theme.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },

  // Contacts
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addContactCard: {
    backgroundColor: theme.surface,
    borderRadius: theme.radius.lg,
    padding: 16,
    marginBottom: 12,
    gap: 10,
  },
  contactInput: {
    backgroundColor: theme.backgroundSecondary,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: theme.textPrimary,
  },
  saveContactBtn: {
    backgroundColor: theme.primary,
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveContactBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: theme.radius.md,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  contactRel: {
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: 2,
  },
  emergencyBadge: {
    backgroundColor: theme.error + '20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.sm,
  },
  emergencyText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.error,
  },
  contactAction: {
    padding: 4,
  },

  crisisCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.error + '08',
    borderRadius: theme.radius.md,
    padding: 14,
    gap: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: theme.error + '20',
  },
  crisisLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  crisisNumber: {
    fontSize: 13,
    color: theme.textSecondary,
  },

  // Settings
  settingsCard: {
    backgroundColor: theme.surface,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  settingBorder: {
    borderTopWidth: 1,
    borderTopColor: theme.borderLight,
  },
  settingLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: theme.textPrimary,
  },

  // About
  aboutCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  aboutName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  aboutVersion: {
    fontSize: 13,
    color: theme.textMuted,
    marginTop: 4,
  },
  aboutDesc: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});
