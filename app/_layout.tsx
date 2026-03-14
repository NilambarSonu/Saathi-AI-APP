import { useEffect } from 'react';
import { Stack, router, useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { 
  Sora_300Light, 
  Sora_400Regular, 
  Sora_500Medium, 
  Sora_600SemiBold, 
  Sora_700Bold, 
  Sora_800ExtraBold 
} from '@expo-google-fonts/sora';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '../store/authStore';
import { checkAuthStatus } from '../services/auth';
import * as Notifications from 'expo-notifications';

// Keep native splash visible until we're ready
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { setUser, clearUser, setLoading } = useAuthStore();
  const navigationRouter = useRouter();

  const [fontsLoaded] = useFonts({
    Sora_300Light,
    Sora_400Regular,
    Sora_500Medium,
    Sora_600SemiBold,
    Sora_700Bold,
    Sora_800ExtraBold,
  });

  useEffect(() => {
    async function initializeApp() {
      try {
        // Check if user has a valid saved session
        const user = await checkAuthStatus();
        
        if (user) {
          setUser(user);
          router.replace('/(app)/dashboard');
        } else {
          clearUser();
          // Check if first time launch
          const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
          const hasOnboarded = await AsyncStorage.getItem('saathi_has_onboarded');
          
          if (!hasOnboarded) {
            router.replace('/(onboarding)');
          } else {
            router.replace('/(auth)/login');
          }
        }
      } catch (err) {
        console.error('[App Init]', err);
        clearUser();
        router.replace('/(auth)/login');
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

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="splash" options={{ animation: 'fade' }} />
        <Stack.Screen name="(onboarding)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(app)" options={{ animation: 'fade' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
