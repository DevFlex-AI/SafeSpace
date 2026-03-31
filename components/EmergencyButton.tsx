
import React from 'react';
import { Pressable, Text, StyleSheet, View, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../constants/theme';
import { APP_CONFIG } from '../constants/config';

export default function EmergencyButton() {
  const insets = useSafeAreaInsets();
  
  const handleEmergencyPress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      '🚨 Emergency Call',
      `This will call ${APP_CONFIG.safety.emergency.primary} for immediate emergency assistance. Are you sure you want to proceed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call 911', 
          style: 'destructive',
          onPress: () => Linking.openURL(`tel:${APP_CONFIG.safety.emergency.primary}`),
        },
      ]
    );
  };

  return (
    <Pressable 
      style={[styles.emergencyBtn, { top: insets.top + 10 }]} 
      onPress={handleEmergencyPress}
    >
      <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.emergencyBtnContent}>
        <MaterialIcons name="emergency" size={18} color="#FFF" />
        <Text style={styles.emergencyText}>911</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  emergencyBtn: {
    position: 'absolute',
    right: 16,
    zIndex: 1000,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emergencyBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.error,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  emergencyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
});
