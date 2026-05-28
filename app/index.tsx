import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  withSequence,
  withDelay,
  withRepeat,
  Easing,
  interpolate,
  SharedValue,
  FadeInUp
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useDarkModeTheme } from '@/context/ThemeContext';
import { useAuthStore } from '@/store/authStore';

const { width, height } = Dimensions.get('window');

// Premium 5-Stage Farmer-Friendly Intro Animation
export default function SplashScreen() {
  const router = useRouter();
  const { isDark } = useDarkModeTheme();

  // Animations
  const bgOpacity = useSharedValue(0); // Stage 1
  const logoOpacity = useSharedValue(0); // Stage 2
  const logoScale = useSharedValue(0.85); // Stage 2
  const logoFloat = useSharedValue(0); // Stage 2 (Floating)
  const pulseScale = useSharedValue(1); // Stage 3
  const pulseOpacity = useSharedValue(0); // Stage 3
  const particle1TranslateY = useSharedValue(0); // Stage 3
  const particle2TranslateY = useSharedValue(0); // Stage 3
  const particle3TranslateY = useSharedValue(0); // Stage 3
  const particleOpacity = useSharedValue(0); // Stage 3
  const glowLinesOpacity = useSharedValue(0); // Stage 4
  const finalCompressScale = useSharedValue(1); // Stage 5

  useEffect(() => {
    // STAGE 1: Earth Glow (0ms - 2000ms)
    bgOpacity.value = withTiming(1, { duration: 2000, easing: Easing.out(Easing.ease) });

    // STAGE 2: Logo Appear (1200ms - 3200ms)
    logoOpacity.value = withDelay(1200, withTiming(1, { duration: 2000, easing: Easing.out(Easing.cubic) }));
    logoScale.value = withDelay(1200, withSpring(1, { damping: 18, stiffness: 45 }));
    // Subtle floating animation
    logoFloat.value = withDelay(2000, withRepeat(
      withSequence(
        withTiming(-5, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(5, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    ));

    // STAGE 3: Organic Growth (3000ms - 6000ms)
    // Breathing pulse
    pulseScale.value = withDelay(3000, withRepeat(
      withSequence(
        withTiming(1.3, { duration: 3000, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 0 })
      ),
      -1,
      false
    ));
    pulseOpacity.value = withDelay(3000, withRepeat(
      withSequence(
        withTiming(0.2, { duration: 0 }),
        withTiming(0, { duration: 3000, easing: Easing.out(Easing.ease) })
      ),
      -1,
      false
    ));
    
    // Tiny glowing particles moving upward
    particleOpacity.value = withDelay(3000, withTiming(0.6, { duration: 1500 }));
    particle1TranslateY.value = withDelay(3000, withRepeat(withTiming(-60, { duration: 4000, easing: Easing.out(Easing.linear) }), -1, false));
    particle2TranslateY.value = withDelay(3400, withRepeat(withTiming(-80, { duration: 4500, easing: Easing.out(Easing.linear) }), -1, false));
    particle3TranslateY.value = withDelay(3800, withRepeat(withTiming(-50, { duration: 3500, easing: Easing.out(Easing.linear) }), -1, false));

    // STAGE 4: AI Activation (4500ms - 6500ms)
    glowLinesOpacity.value = withDelay(4500, withTiming(1, { duration: 1500, easing: Easing.out(Easing.ease) }));

    // STAGE 5: Dashboard Transition (7000ms - 7800ms)
    finalCompressScale.value = withDelay(7000, withTiming(0.95, { duration: 800, easing: Easing.inOut(Easing.ease) }));
    
    // Navigate at 7.5 seconds
    let timeoutFinished = false;
    
    const navigationTimer = setTimeout(() => {
      timeoutFinished = true;
      checkAndNavigate();
    }, 7500);

    const checkAndNavigate = async () => {
      // If the 7.5s timeout hasn't finished, wait.
      if (!timeoutFinished) return;
      
      // If auth is still loading/initializing from SecureStore, wait.
      const state = useAuthStore.getState();
      if (!state.isInitialized) return;

      const hasOnboarded = await AsyncStorage.getItem('saathi_has_onboarded');
      const legacyHasOnboarded = await AsyncStorage.getItem('hasOnboarded');
      const isOnboarded = hasOnboarded === 'true' || legacyHasOnboarded === 'true';
      
      if (!isOnboarded) {
        router.replace('/(onboarding)');
      } else if (!state.isAuthenticated) {
        router.replace('/(auth)/login');
      } else {
        router.replace('/(app)');
      }
    };

    // Subscribe to auth state changes so we navigate as soon as initialization finishes
    const unsubscribe = useAuthStore.subscribe((state, prevState) => {
      if (state.isInitialized && !prevState.isInitialized) {
        checkAndNavigate();
      }
    });

    return () => {
      clearTimeout(navigationTimer);
      unsubscribe();
    };
  }, []);

  const bgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value * finalCompressScale.value },
      { translateY: logoFloat.value }
    ],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
    transform: [{ scale: pulseScale.value }],
  }));

  const glowLinesStyle = useAnimatedStyle(() => ({
    opacity: glowLinesOpacity.value,
    transform: [{ scale: finalCompressScale.value }],
  }));

  const createParticleStyle = (translateYValue: SharedValue<number>, initialX: number) => {
    return useAnimatedStyle(() => {
      const progress = Math.abs(translateYValue.value / 80);
      const opac = interpolate(progress, [0, 0.5, 1], [0, particleOpacity.value, 0]);
      return {
        opacity: opac,
        transform: [
          { translateX: initialX },
          { translateY: translateYValue.value }
        ]
      };
    });
  };

  return (
    <View style={styles.container}>
      {/* Warm Premium Light Brown Theme (Earth Glow) */}
      <Animated.View style={[StyleSheet.absoluteFill, bgStyle]}>
        <LinearGradient
          colors={isDark ? ['#1A1612', '#2A2218', '#382D20'] : ['#F6F1E7', '#EADBC8', '#D6C2A8']}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Floating Particles (Organic Growth) */}
      <View style={styles.particlesContainer}>
        <Animated.View style={[styles.particle, createParticleStyle(particle1TranslateY, -40)]} />
        <Animated.View style={[styles.particle, createParticleStyle(particle2TranslateY, 30)]} />
        <Animated.View style={[styles.particle, createParticleStyle(particle3TranslateY, -10)]} />
      </View>

      {/* Center Logo Group */}
      <View style={styles.logoContainer}>
        {/* Breathing Pulse */}
        <Animated.View style={[styles.pulseRing, pulseStyle, isDark && styles.pulseRingDark]} />
        
        {/* Elegant Glowing Lines (AI Activation) */}
        <Animated.View style={[styles.glowLines, glowLinesStyle, isDark && styles.glowLinesDark]} />

        {/* In-app Logo */}
        <Animated.View style={logoStyle}>
          <Image 
            source={require('../assets/images/Apk_Logo_Transparent.png')} 
            style={styles.logoImage} 
            resizeMode="contain" 
          />
        </Animated.View>
      </View>

      {/* Tagline */}
      <View style={styles.taglineContainer}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
          {["Saathi", "AI", "The", "Organic", "Intelligence", "Platform"].map((word, i) => (
            <Animated.Text
              key={i}
              entering={FadeInUp.delay(5000 + i * 250).duration(800)}
              style={[styles.tagline, isDark && styles.taglineDark, { marginRight: 6 }]}
            >
              {word}
            </Animated.Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6F1E7', // Fallback color
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  particle: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#7BCB5B', // Accent green
    position: 'absolute',
    shadowColor: '#6FAE4F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  logoImage: {
    width: 140,
    height: 140,
    // Soft shadow for premium feel
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  pulseRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#C8AE88',
  },
  pulseRingDark: {
    backgroundColor: '#524536',
  },
  glowLines: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 1.5,
    borderColor: 'rgba(123, 203, 91, 0.4)', // Subtle glowing green lines
    shadowColor: '#7BCB5B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  glowLinesDark: {
    borderColor: 'rgba(123, 203, 91, 0.2)',
  },
  taglineContainer: {
    position: 'absolute',
    bottom: height * 0.15,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 30, // Safe horizontal padding
    zIndex: 2,
  },
  tagline: {
    fontSize: 16,
    fontFamily: 'Sora_500Medium',
    color: '#382D20', // Soft dark warm brown
    letterSpacing: 1.3,
    textAlign: 'center',
  },
  taglineDark: {
    color: '#EADBC8',
  },
});
