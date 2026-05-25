import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  withSequence,
  withDelay,
  withRepeat
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { useDarkModeTheme } from '@/context/ThemeContext';
import { useAuthStore } from '@/store/authStore';

export default function SplashScreen() {
  const router = useRouter();
  const { theme, isDark } = useDarkModeTheme();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);

  // Core Entrance Animations
  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const taglineOpacity = useSharedValue(0);
  const dot1Opacity = useSharedValue(0.3);
  const dot2Opacity = useSharedValue(0.3);
  const dot3Opacity = useSharedValue(0.3);

  // Concentric Scanning Waves Animations
  const wave1Scale = useSharedValue(0.8);
  const wave1Opacity = useSharedValue(0);
  const wave2Scale = useSharedValue(0.8);
  const wave2Opacity = useSharedValue(0);
  const wave3Scale = useSharedValue(0.8);
  const wave3Opacity = useSharedValue(0);

  useEffect(() => {
    // 1. Logo Entrance (Smooth premium spring and fade)
    logoScale.value = withDelay(100, withSpring(1, { damping: 13, stiffness: 80 }));
    logoOpacity.value = withDelay(100, withTiming(1, { duration: 600 }));

    // 2. Radiating Waves Loops (Scanning soil intelligence effect)
    // Wave 1
    wave1Scale.value = withRepeat(
      withSequence(withTiming(0.8, { duration: 0 }), withTiming(2.6, { duration: 2400 })),
      -1,
      false
    );
    wave1Opacity.value = withRepeat(
      withSequence(withTiming(0.4, { duration: 0 }), withTiming(0, { duration: 2400 })),
      -1,
      false
    );

    // Wave 2 (delayed by 800ms)
    const wave2Timer = setTimeout(() => {
      wave2Scale.value = withRepeat(
        withSequence(withTiming(0.8, { duration: 0 }), withTiming(2.6, { duration: 2400 })),
        -1,
        false
      );
      wave2Opacity.value = withRepeat(
        withSequence(withTiming(0.4, { duration: 0 }), withTiming(0, { duration: 2400 })),
        -1,
        false
      );
    }, 800);

    // Wave 3 (delayed by 1600ms)
    const wave3Timer = setTimeout(() => {
      wave3Scale.value = withRepeat(
        withSequence(withTiming(0.8, { duration: 0 }), withTiming(2.6, { duration: 2400 })),
        -1,
        false
      );
      wave3Opacity.value = withRepeat(
        withSequence(withTiming(0.4, { duration: 0 }), withTiming(0, { duration: 2400 })),
        -1,
        false
      );
    }, 1600);

    // 3. Title Entrance
    titleOpacity.value = withDelay(600, withTiming(1, { duration: 450 }));
    titleTranslateY.value = withDelay(600, withTiming(0, { duration: 450 }));

    // 4. Tagline Entrance
    taglineOpacity.value = withDelay(950, withTiming(1, { duration: 450 }));

    // 5. Loading dots sequential pulse (Starts at 1200ms)
    const loaderTimer = setTimeout(() => {
      dot1Opacity.value = withRepeat(withSequence(withTiming(1, { duration: 600 }), withTiming(0.3, { duration: 600 })), -1, true);
      const d2 = setTimeout(() => {
        dot2Opacity.value = withRepeat(withSequence(withTiming(1, { duration: 600 }), withTiming(0.3, { duration: 600 })), -1, true);
      }, 200);
      const d3 = setTimeout(() => {
        dot3Opacity.value = withRepeat(withSequence(withTiming(1, { duration: 600 }), withTiming(0.3, { duration: 600 })), -1, true);
      }, 400);

      return () => {
        clearTimeout(d2);
        clearTimeout(d3);
      };
    }, 1200);

    // 6. Navigate exactly at 2.2 seconds based on authentication state
    const navigationTimer = setTimeout(async () => {
      const hasOnboarded = await AsyncStorage.getItem('saathi_has_onboarded');
      const legacyHasOnboarded = await AsyncStorage.getItem('hasOnboarded');
      const isOnboarded = hasOnboarded === 'true' || legacyHasOnboarded === 'true';
      
      if (!isOnboarded) {
        router.replace('/(onboarding)');
      } else if (!isAuthenticated) {
        router.replace('/(auth)/login');
      } else {
        router.replace('/(app)');
      }
    }, 2200);

    return () => {
      clearTimeout(wave2Timer);
      clearTimeout(wave3Timer);
      clearTimeout(loaderTimer);
      clearTimeout(navigationTimer);
    };
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }]
  }));

  const wave1Style = useAnimatedStyle(() => ({
    transform: [{ scale: wave1Scale.value }],
    opacity: wave1Opacity.value,
  }));

  const wave2Style = useAnimatedStyle(() => ({
    transform: [{ scale: wave2Scale.value }],
    opacity: wave2Opacity.value,
  }));

  const wave3Style = useAnimatedStyle(() => ({
    transform: [{ scale: wave3Scale.value }],
    opacity: wave3Opacity.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }]
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value
  }));

  const waveBorderColor = isDark ? 'rgba(34, 197, 94, 0.25)' : 'rgba(255, 255, 255, 0.25)';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Theme-aware solid base color backdrop */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? theme.bg0 : theme.primaryDark }]} />
      
      {/* Radiating Waves (Background soil scanning animation) */}
      <View style={styles.wavesWrapper}>
        <Animated.View style={[styles.wave, wave1Style, { borderColor: waveBorderColor }]} />
        <Animated.View style={[styles.wave, wave2Style, { borderColor: waveBorderColor }]} />
        <Animated.View style={[styles.wave, wave3Style, { borderColor: waveBorderColor }]} />
      </View>

      {/* Glassmorphic Logo Container */}
      <Animated.View style={[
        styles.logoBox, 
        logoStyle, 
        { 
          backgroundColor: isDark ? 'rgba(34, 197, 94, 0.08)' : 'rgba(255, 255, 255, 0.12)', 
          borderColor: isDark ? 'rgba(34, 197, 94, 0.18)' : 'rgba(255, 255, 255, 0.25)' 
        }
      ]}>
        <Image 
          source={require('../assets/images/app-logo.png')} 
          style={styles.logoImage} 
          resizeMode="contain" 
        />
      </Animated.View>

      {/* Text Elements */}
      <Animated.View style={[styles.textContainer, titleStyle]}>
        <Text style={[styles.title, { color: isDark ? theme.textPrimary : '#FFF' }]}>Saathi AI</Text>
      </Animated.View>

      <Animated.View style={[styles.textContainer, taglineStyle]}>
        <Text style={[styles.tagline, { color: isDark ? theme.textSecondary : 'rgba(255, 255, 255, 0.65)' }]}>The Organic Intelligence Platform</Text>
      </Animated.View>

      {/* Sequential Loading Indicator */}
      <View style={styles.loaderContainer}>
        <Animated.View style={[styles.dot, { opacity: dot1Opacity, backgroundColor: isDark ? theme.primary : 'rgba(255, 255, 255, 0.8)' }]} />
        <Animated.View style={[styles.dot, { opacity: dot2Opacity, backgroundColor: isDark ? theme.primary : 'rgba(255, 255, 255, 0.8)' }]} />
        <Animated.View style={[styles.dot, { opacity: dot3Opacity, backgroundColor: isDark ? theme.primary : 'rgba(255, 255, 255, 0.8)' }]} />
      </View>

      {/* Footer Branding */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: isDark ? theme.textMuted : 'rgba(255, 255, 255, 0.4)' }]}>Mitti-AI Innovations · Est. 2024</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryDeep,
  },
  wavesWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 200,
    zIndex: 0,
  },
  wave: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
  },
  logoBox: {
    width: 130,
    height: 130,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 24,
  },
  textContainer: {
    alignItems: 'center',
    zIndex: 10,
  },
  title: {
    fontFamily: 'Sora_800ExtraBold',
    fontSize: 32,
    color: '#FFF',
    letterSpacing: -0.64,
  },
  tagline: {
    fontFamily: 'Sora_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 4,
  },
  loaderContainer: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 8,
    zIndex: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    zIndex: 10,
  },
  footerText: {
    fontFamily: 'Sora_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.88,
  }
});
