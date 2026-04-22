import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack, router, useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as WebBrowser from 'expo-web-browser';
import { useFonts } from 'expo-font';
import {
  Sora_300Light,
  Sora_400Regular,
  Sora_500Medium,
  Sora_600SemiBold,
  Sora_700Bold,
  Sora_800ExtraBold,
} from '@expo-google-fonts/sora';
import { Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import ErrorBoundary from '@/components/ErrorBoundary';
import { SoilMarkersProvider } from '@/context/SoilMarkersContext';
import { useAuthStore } from '@/store/authStore';
import { checkAuthStatus, registerDevice } from '@/features/auth/services/auth';
import { getStoredAccessToken, getStoredRefreshToken } from '@/services/api';

SplashScreen.preventAutoHideAsync();
WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  const navigationRouter = useRouter();
  const [fontsLoaded] = useFonts({
    Sora_300Light,
    Sora_400Regular,
    Sora_500Medium,
    Sora_600SemiBold,
    Sora_700Bold,
    Sora_800ExtraBold,
    Pacifico_400Regular,
  });

  useEffect(() => {
    async function initializeApp() {
      try {
        // checkAuthStatus reads saathi_token from AsyncStorage and hits /api/user
        const user = await checkAuthStatus();

        if (user) {
          // Restore session into Zustand (token already in AsyncStorage for interceptor)
          // IMPORTANT: Get token directly from storage, not from Zustand (not yet rehydrated)
          const token = await getStoredAccessToken();
          const refreshToken = await getStoredRefreshToken();
          
          if (token) {
            await useAuthStore.getState().setAuth(token, refreshToken, user);
          } else {
            // Token should exist if checkAuthStatus returned a user, but safeguard
            useAuthStore.setState({
              user: null,
              token: null,
              refreshToken: null,
              isAuthenticated: false,
            });
          }

          // Register push token in background (non-blocking)
          try {
            if (Constants.appOwnership !== 'expo') {
              const expoToken = (await Notifications.getExpoPushTokenAsync()).data;
              await registerDevice({
                expo_push_token: expoToken,
                device_type: Platform.OS === 'ios' ? 'ios' : 'android',
                device_name: Platform.OS === 'ios' ? 'iPhone' : 'Android Device',
              });
            }
          } catch (error) {
            console.warn('[Push Register Error]', error);
          }
        } else {
          useAuthStore.setState({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
          });
        }
      } catch (error) {
        console.error('[App Init]', error);
        useAuthStore.setState({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      } finally {
        useAuthStore.setState({ isLoading: false });
        if (fontsLoaded) {
          SplashScreen.hideAsync().catch(() => {});
        }
      }
    }

    if (fontsLoaded) {
      initializeApp();
    }
  }, [fontsLoaded]);

  // Auto-redirect to login when user logs out from any screen
  useEffect(() => {
    const unsubscribe = useAuthStore.subscribe((state, prevState) => {
      if (prevState.isAuthenticated && !state.isAuthenticated && !state.isLoading) {
        router.replace('/(auth)/login');
      }
    });
    return unsubscribe;
  }, []);

  // Handle deep-link push notification taps
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const screen = response.notification.request.content.data?.screen;
      if (screen) {
        navigationRouter.push(`/(app)/${screen}`);
      }
    });
    return () => subscription.remove();
  }, [navigationRouter]);

  return (
    <ErrorBoundary>
      <SoilMarkersProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(onboarding)" options={{ animation: 'fade' }} />
            <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
            <Stack.Screen name="(app)" options={{ animation: 'fade' }} />
          </Stack>
        </GestureHandlerRootView>
      </SoilMarkersProvider>
    </ErrorBoundary>
  );
}
