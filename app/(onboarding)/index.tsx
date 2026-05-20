import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDarkModeTheme } from '@/context/ThemeContext';
import { useTranslation } from '@/context/LanguageContext';
import { Spacing } from '@/constants/Spacing';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const { theme, isDark } = useDarkModeTheme();
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const SLIDES = [
    {
      id: '1',
      title: t('onboarding.slides.0.title'),
      highlight: t('onboarding.slides.0.highlight'),
      body: t('onboarding.slides.0.body'),
      badge: t('onboarding.slides.0.badge'),
      bg: theme.fillGreen,
      iconColor: theme.primary
    },
    {
      id: '2',
      title: t('onboarding.slides.1.title'),
      highlight: t('onboarding.slides.1.highlight'),
      body: t('onboarding.slides.1.body'),
      badge: t('onboarding.slides.1.badge'),
      bg: theme.fillAmber,
      iconColor: theme.amber
    },
    {
      id: '3',
      title: t('onboarding.slides.2.title'),
      highlight: t('onboarding.slides.2.highlight'),
      body: t('onboarding.slides.2.body'),
      badge: t('onboarding.slides.2.badge'),
      bg: theme.fillPurple,
      iconColor: theme.purple
    }
  ];

  const completeOnboarding = async () => {
    await AsyncStorage.multiSet([
      ['hasOnboarded', 'true'],
      ['saathi_has_onboarded', 'true'],
    ]);
    router.replace('/(auth)/login');
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  const handleContinue = () => {
    if (currentIndex < SLIDES.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: (currentIndex + 1) * width,
        animated: true,
      });
    } else {
      completeOnboarding();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Pressable style={styles.skipButton} onPress={completeOnboarding}>
        <Text style={[styles.skipText, { color: theme.textSecondary }]}>{t('common.skip')}</Text>
      </Pressable>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        bounces={false}
        style={styles.scrollView}
      >
        {SLIDES.map((slide, index) => (
          <View key={slide.id} style={styles.slide}>
            <View style={[styles.illustrationPanel, { backgroundColor: slide.bg }]}>
              <View style={[styles.badge, { backgroundColor: slide.iconColor }]}>
                <Text style={styles.badgeText}>{slide.badge}</Text>
              </View>
              <Text style={{ fontSize: 80, opacity: 0.8 }}>
                {index === 0 ? '🌡️' : index === 1 ? '🗣️' : '🧠'}
              </Text>
            </View>

            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: theme.textPrimary }]}>
                {slide.title}
                <Text style={{ color: theme.primary }}>{slide.highlight}</Text>
              </Text>
              <Text style={[styles.body, { color: theme.textSecondary }]}>{slide.body}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.indicators}>
          {SLIDES.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.dot, 
                { backgroundColor: theme.border },
                currentIndex === index ? [styles.dotActive, { backgroundColor: theme.primary }] : null
              ]} 
            />
          ))}
        </View>

        <Pressable 
          style={[styles.ctaButton, { backgroundColor: theme.primary, shadowColor: theme.primary }]} 
          onPress={handleContinue}
        >
          <Text style={[styles.ctaText, { color: '#FFFFFF' }]}>
            {currentIndex === SLIDES.length - 1 ? t('common.getStarted') : t('common.continue')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: Spacing.xl,
    zIndex: 10,
    padding: Spacing.sm,
  },
  skipText: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 14,
    letterSpacing: 0.2,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: width,
    flex: 1,
    alignItems: 'center',
    paddingTop: 120,
    paddingHorizontal: Spacing.xl,
  },
  illustrationPanel: {
    width: 260,
    height: 220,
    borderRadius: Spacing.radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: -10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  badgeText: {
    fontFamily: 'Sora_700Bold',
    fontSize: 10,
    color: '#FFF',
    letterSpacing: 0.5,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Sora_800ExtraBold',
    fontSize: 26,
    textAlign: 'center',
    letterSpacing: -0.52,
    marginBottom: Spacing.md,
  },
  body: {
    fontFamily: 'Sora_400Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22.4,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 50,
    paddingTop: 20,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
  },
  ctaButton: {
    height: 54,
    borderRadius: Spacing.radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  ctaText: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 16,
    letterSpacing: 0.2,
  }
});


