import { Stack } from 'expo-router';
import { AlertProvider, AuthProvider } from '@/template';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppProvider } from '../contexts/AppContext';

export default function RootLayout() {
  return (
    <AlertProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AuthProvider>
            <AppProvider>
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
              </Stack>
            </AppProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </AlertProvider>
  );
}
