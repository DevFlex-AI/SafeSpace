import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { AlertProvider, AuthProvider } from '@/template';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppProvider } from '../contexts/AppContext';
import useSensoryMonitor from '../hooks/useSensoryMonitor';
import SensoryInterventionOverlay from '../components/SensoryInterventionOverlay';

function SensoryMonitorWrapper({ children }: { children: React.ReactNode }) {
  const { startMonitoring, showIntervention, dismissIntervention } = useSensoryMonitor();

  useEffect(() => {
    startMonitoring();
  }, [startMonitoring]);

  return (
    <>
      {children}
      <SensoryInterventionOverlay 
        visible={showIntervention} 
        onDismiss={dismissIntervention} 
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <AlertProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AuthProvider>
            <AppProvider>
              <SensoryMonitorWrapper>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="login" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="breathing"
                    options={{ presentation: 'fullScreenModal', animation: 'fade' }}
                  />
                  <Stack.Screen
                    name="grounding"
                    options={{ presentation: 'fullScreenModal', animation: 'fade' }}
                  />
                  <Stack.Screen
                    name="voice-chat"
                    options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
                  />
                  <Stack.Screen
                    name="urge"
                    options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
                  />
                  <Stack.Screen
                    name="roadmap"
                    options={{ presentation: 'card', animation: 'slide_from_right' }}
                  />
                </Stack>
              </SensoryMonitorWrapper>
            </AppProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </AlertProvider>
  );
}
