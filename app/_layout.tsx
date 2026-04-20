import { useEffect } from 'react';
import { Stack, router, useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { SoilMarkersProvider } from '../context/SoilMarkersContext';
import * as Linking from 'expo-linking';
import { useFonts } from 'expo-font';
import { 
  Sora_300Light, 
  Sora_400Regular, 
  Sora_500Medium, 
  Sora_600SemiBold, 
  Sora_700Bold, 
  Sora_800ExtraBold 
} from '@expo-google-fonts/sora';
import { Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '../store/authStore';
import { checkAuthStatus } from '../src/features/auth/services/auth';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import ErrorBoundary from '../components/ErrorBoundary';

// Keep native splash visible until we're ready
SplashScreen.preventAutoHideAsync();

WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  const { login, clearUser, setLoading } = useAuthStore();
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
        // ── Load persisted token first ─────────────────────────────────────
        const { getStoredAccessToken } = await import('../src/core/services/api');
        const token = await getStoredAccessToken();
        console.log('[App Init] Loaded token:', token ? token.slice(0, 20) + '…' : 'NONE');

        if (!token) {
          clearUser();
          return;
        }

        // ── Verify token is still valid by fetching user profile ──────────
        const user = await checkAuthStatus();
        
        if (user) {
          // ✅ Use login() — not setUser() — to populate BOTH user AND token
          login(user, token);
          console.log('[App Init] Auth restored for user:', user.id);
          
          // Register device for push notifications (skip on Expo Go)
          try {
            if (Constants.appOwnership !== 'expo') {
              const { registerDevice } = await import('../src/features/auth/services/auth');
              const expoToken = (await Notifications.getExpoPushTokenAsync()).data;
              await registerDevice({
                expo_push_token: expoToken,
                device_type: Platform.OS === 'ios' ? 'ios' : 'android',
                device_name: Platform.OS === 'ios' ? 'iPhone' : 'Android Device'
              });
            } else {
              console.log('[Push Register] Skipping token registration on Expo Go.');
            }
          } catch (err) {
            console.warn('[Push Register Error]', err);
          }
          // Intentionally omitting router.replace() here
          // The visual splash screen handles actual screen redirection.
        } else {
          console.log('[App Init] Token invalid or expired — clearing auth');
          clearUser();
        }
      } catch (err) {
        console.error('[App Init]', err);
        clearUser();
      } finally {
        if (fontsLoaded) {
          SplashScreen.hideAsync();
        }
      }
    }

    if (fontsLoaded) {
      initializeApp();
    }
  }, [fontsLoaded]);

  // Handle Social Auth Callback (deep link fallback for Android)
  useEffect(() => {
    const processAuthCallback = async (url: string) => {
      if (!url || !url.includes('auth/callback')) return;
      
      console.log('[Deep Link] OAuth callback URL received:', url);

      const { queryParams } = Linking.parse(url);
      const token = (
        queryParams?.token ||
        queryParams?.accessToken ||
        queryParams?.access_token
      ) as string | undefined;
      const refreshToken = (
        queryParams?.refreshToken ||
        queryParams?.refresh_token
      ) as string | undefined;

      if (!token) {
        console.warn('[Deep Link] No token found in callback URL');
        return;
      }

      console.log('[Deep Link] Token extracted:', token.slice(0, 20) + '…');

      try {
        const { saveAuthTokens } = await import('../src/core/services/api');
        const { checkAuthStatus: verifyAuth } = await import('../src/features/auth/services/auth');
        // Store token first so apiCall can use it
        await saveAuthTokens(token, refreshToken);
        const user = await verifyAuth();
        if (user) {
          // ✅ Use login() to populate BOTH user AND token in the store
          login(user, token);
          console.log('[Deep Link] Auth complete for user:', user.id);
          router.replace('/(app)');
        } else {
          console.warn('[Deep Link] Could not fetch user profile after token save');
        }
      } catch (err) {
        console.error('[Deep Link Auth Error]', err);
      }
    };

    const handleDeepLink = async (event: { url: string }) => {
      await processAuthCallback(event.url);
    };

    // Check if app was launched from a deep link (cold start)
    Linking.getInitialURL().then((initialUrl) => {
      if (initialUrl) {
        console.log('[Deep Link] Initial URL on cold start:', initialUrl);
        void processAuthCallback(initialUrl);
      }
    });

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, []);

  // Global Session Expiration Listener (Step 2.10)
  useEffect(() => {
    const unsubscribe = useAuthStore.subscribe((state, prevState) => {
      if (prevState.isAuthenticated && !state.isAuthenticated && !state.isLoading) {
        router.replace('/(auth)/login');
      }
    });
    return unsubscribe;
  }, []);

  // Push notification tap listener
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const screen = response.notification.request.content.data?.screen;
      if (screen) {
        navigationRouter.push(`/(app)/${screen}`);
      }
    });
    return () => subscription.remove();
  }, [navigationRouter]);

  // Render the stack immediately to let Expo Router match the path, 
  // relying on SplashScreen.preventAutoHideAsync() to hide the view until fonts load.

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
