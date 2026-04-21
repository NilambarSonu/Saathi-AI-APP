import { useEffect, useRef } from 'react';
import { Stack, router, useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
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

  // Diagnostic: confirm which scheme is active in this environment
  console.log('[Deep Link] App scheme (createURL test):', Linking.createURL('auth/callback'));

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
        const { getStoredAccessToken } = await import('../src/core/services/api');
        const token = await getStoredAccessToken();
        console.log("TOKEN:", token);

        if (token) {
          useAuthStore.setState({ isAuthenticated: true, token });
          
          try {
            const { apiCall } = await import('../src/core/services/api');
            const data = await apiCall('/user');
            console.log("USER DATA:", data);
            
            const user = data.user || data;
            if (user && (user.id || user._id)) {
              useAuthStore.getState().setUser({
                id: user.id || user._id,
                name: user.username || user.name,
                email: user.email,
                avatar: user.profile_picture || user.avatar_url
              });
            }
          } catch (e) {
            console.log("Failed to load user profile on startup:", e);
          }
          
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
        } else {
          useAuthStore.setState({ isAuthenticated: false });
        }
      } catch (err) {
        console.error('[App Init]', err);
        useAuthStore.setState({ isAuthenticated: false });
      } finally {
        useAuthStore.setState({ isLoading: false });
        if (fontsLoaded) {
          SplashScreen.hideAsync();
        }
      }
    }

    if (fontsLoaded) {
      initializeApp();
    }
  }, [fontsLoaded]);

  // ── OAuth deep-link handler ─────────────────────────────────────────────────
  const handledUrls = useRef<Set<string>>(new Set());

  const processAuthCallback = async (url: string) => {
    console.log('[OAuth] processAuthCallback START, URL:', url);
    try {
      // Regex-based parsing — works with ANY URL scheme, no new URL() needed
      const tokenMatch = url.match(/[?&]token=([^&#]+)/);
      const userIdMatch = url.match(/[?&]userId=([^&#]+)/);
      const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;
      const userId = userIdMatch ? decodeURIComponent(userIdMatch[1]) : null;

      console.log('[OAuth] Token found:', !!token, '| length:', token?.length ?? 0);
      console.log('[OAuth] Token preview:', token?.substring(0, 30));
      console.log('[OAuth] UserId:', userId);

      if (!token || token.length < 20) {
        console.error('[OAuth] Token missing or invalid');
        Alert.alert('Login Failed', 'No token received. Please try again.');
        return;
      }
      if (!userId) {
        console.error('[OAuth] UserId missing');
        Alert.alert('Login Failed', 'User ID missing. Please try again.');
        return;
      }

      await SecureStore.setItemAsync('auth_token', token);
      await SecureStore.setItemAsync('user_id', userId);
      console.log('[OAuth] SecureStore saved');

      const authHeader = 'Bearer ' + token;
      console.log('[OAuth] Sending Authorization header, first 40 chars:', authHeader.substring(0, 40));

      const response = await fetch('https://saathiai.org/api/user', {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
          'x-client-type': 'mobile',
        },
      });

      console.log('[OAuth] /api/user response status:', response.status);

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        console.error('[OAuth] API error:', JSON.stringify(errBody));
        throw new Error(errBody.error ?? 'HTTP ' + response.status);
      }

      const data = await response.json();
      console.log('[OAuth] User received:', data?.user?.username ?? data?.username);
      const user = data.user ?? data;

      if (!user?.id) {
        throw new Error('User data invalid in response');
      }

      useAuthStore.getState().login(
        {
          id: user.id,
          name: user.username || user.name,
          email: user.email,
          avatar: user.profile_picture || user.avatar_url,
        },
        token
      );

      console.log('[OAuth] SUCCESS — logged in as:', user.username, user.email);
      router.replace('/(app)');

    } catch (error: any) {
      console.error('[Deep Link Auth Error]', error?.message ?? String(error));
      await SecureStore.deleteItemAsync('auth_token').catch(() => {});
      await SecureStore.deleteItemAsync('user_id').catch(() => {});
      Alert.alert('Login Failed', error?.message ?? 'OAuth failed. Try again.');
    }
  };

  // Foreground deep link — fires when app is already open
  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      console.log('[Deep Link] Received:', url);
      if (url.includes('auth/callback') && url.includes('token=')) {
        if (handledUrls.current.has(url)) return;
        handledUrls.current.add(url);
        processAuthCallback(url);
      }
    });
    return () => subscription.remove();
  }, []);

  // Cold-start deep link — fires when app was launched via deep link
  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (!url) return;
      console.log('[Deep Link] Initial URL:', url);
      if (url.includes('auth/callback') && url.includes('token=')) {
        if (handledUrls.current.has(url)) return;
        handledUrls.current.add(url);
        processAuthCallback(url);
      }
    });
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
