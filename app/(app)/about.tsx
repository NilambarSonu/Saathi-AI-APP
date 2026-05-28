import React, { useMemo, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDarkModeTheme } from '@/context/ThemeContext';
import { useTranslation } from '@/context/LanguageContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type FeatureItem = {
  icon: IconName;
  title: string;
  body: string;
  color: string;
  tint: string;
};



export default function AboutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useDarkModeTheme();
  const { t } = useTranslation();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const featureItems = useMemo(() => {
    const rawFeatures = [
      {
        icon: 'leaf-outline' as IconName,
        title: t('about.ecosystem.features.soilAnalysis.title'),
        body: t('about.ecosystem.features.soilAnalysis.body'),
        color: '#10B981',
      },
      {
        icon: 'sparkles-outline' as IconName,
        title: t('about.ecosystem.features.aiGuidance.title'),
        body: t('about.ecosystem.features.aiGuidance.body'),
        color: '#8B5CF6',
      },
      {
        icon: 'map-outline' as IconName,
        title: t('about.ecosystem.features.fieldMapping.title'),
        body: t('about.ecosystem.features.fieldMapping.body'),
        color: '#3B82F6',
      },
      {
        icon: 'chatbubble-ellipses-outline' as IconName,
        title: t('about.ecosystem.features.langSupport.title'),
        body: t('about.ecosystem.features.langSupport.body'),
        color: '#F59E0B',
      },
      {
        icon: 'hardware-chip-outline' as IconName,
        title: t('about.ecosystem.features.deviceIntegration.title'),
        body: t('about.ecosystem.features.deviceIntegration.body'),
        color: '#EF4444',
      },
      {
        icon: 'bar-chart-outline' as IconName,
        title: t('about.ecosystem.features.smartRecommendations.title'),
        body: t('about.ecosystem.features.smartRecommendations.body'),
        color: '#0EA5E9',
      },
    ];
    return rawFeatures.map(item => ({
      ...item,
      tint: isDark ? `${item.color}24` : `${item.color}14`,
    }));
  }, [t, isDark]);

  const impactItems = useMemo(() => [
    { value: '< 60s', label: t('about.impact.insight'), icon: 'timer-outline' as IconName, color: '#10B981' },
    { value: '10+', label: t('about.impact.langReady'), icon: 'language-outline' as IconName, color: '#3B82F6' },
    { value: '336x', label: t('about.impact.labWait'), icon: 'flash-outline' as IconName, color: '#F59E0B' },
    { value: 'AI', label: t('about.impact.recEngine'), icon: 'sparkles-outline' as IconName, color: '#8B5CF6' },
  ], [t]);

  const techItems = useMemo(() => [
    {
      title: t('about.stack.items.aiPowered.title'),
      body: t('about.stack.items.aiPowered.body'),
      icon: 'hardware-chip-outline' as IconName,
      color: '#8B5CF6',
      capsuleColors: ['#8B5CF6', '#5B21B6'] as [string, string],
      gradientDark: ['rgba(139, 92, 246, 0.12)', 'rgba(139, 92, 246, 0.03)'] as [string, string],
      gradientLight: ['rgba(250, 248, 255, 0.95)', 'rgba(243, 239, 254, 0.85)'] as [string, string],
      borderColorDark: 'rgba(139, 92, 246, 0.20)',
      borderColorLight: 'rgba(139, 92, 246, 0.10)',
    },
    {
      title: t('about.stack.items.smartSensors.title'),
      body: t('about.stack.items.smartSensors.body'),
      icon: 'radio-outline' as IconName,
      color: '#10B981',
      capsuleColors: ['#10B981', '#06B6D4'] as [string, string],
      gradientDark: ['rgba(16, 185, 129, 0.12)', 'rgba(16, 185, 129, 0.03)'] as [string, string],
      gradientLight: ['rgba(244, 254, 248, 0.95)', 'rgba(230, 252, 238, 0.85)'] as [string, string],
      borderColorDark: 'rgba(16, 185, 129, 0.20)',
      borderColorLight: 'rgba(16, 185, 129, 0.10)',
    },
    {
      title: t('about.stack.items.cloudAnalytics.title'),
      body: t('about.stack.items.cloudAnalytics.body'),
      icon: 'cloud-outline' as IconName,
      color: '#3B82F6',
      capsuleColors: ['#3B82F6', '#1D4ED8'] as [string, string],
      gradientDark: ['rgba(59, 130, 246, 0.12)', 'rgba(59, 130, 246, 0.03)'] as [string, string],
      gradientLight: ['rgba(244, 249, 255, 0.95)', 'rgba(230, 241, 254, 0.85)'] as [string, string],
      borderColorDark: 'rgba(59, 130, 246, 0.20)',
      borderColorLight: 'rgba(59, 130, 246, 0.10)',
    },
    {
      title: t('about.stack.items.realtime.title'),
      body: t('about.stack.items.realtime.body'),
      icon: 'pulse-outline' as IconName,
      color: '#F97316',
      capsuleColors: ['#F97316', '#F59E0B'] as [string, string],
      gradientDark: ['rgba(249, 115, 22, 0.12)', 'rgba(249, 115, 22, 0.03)'] as [string, string],
      gradientLight: ['rgba(255, 250, 244, 0.95)', 'rgba(255, 242, 225, 0.85)'] as [string, string],
      borderColorDark: 'rgba(249, 115, 22, 0.20)',
      borderColorLight: 'rgba(249, 115, 22, 0.10)',
    },
  ], [t]);

  const devicePoints = useMemo(() => [
    t('about.scanner.points.0'),
    t('about.scanner.points.1'),
    t('about.scanner.points.2'),
  ], [t]);

  const teamItems = useMemo(() => [
    {
      name: t('about.community.team.nilambar.name'),
      role: t('about.community.team.nilambar.role'),
      college: t('about.community.team.nilambar.college'),
      image: require('../../assets/images/founder.png'),
      accent: '#38BDF8',
      gradientDark: ['rgba(56, 189, 248, 0.20)', 'rgba(16, 22, 17, 0.90)', 'rgba(8, 47, 73, 0.35)'] as [string, string, string],
      gradientLight: ['rgba(224, 242, 254, 0.75)', 'rgba(255, 255, 255, 0.94)', 'rgba(186, 230, 253, 0.40)'] as [string, string, string],
      borderDark: ['#00F2FE', '#8B5CF6', '#00F2FE'] as [string, string, string],
      borderLight: ['#38BDF8', '#A855F7', '#38BDF8'] as [string, string, string],
    },
    {
      name: t('about.community.team.sanatan.name'),
      role: t('about.community.team.sanatan.role'),
      college: t('about.community.team.sanatan.college'),
      image: require('../../assets/images/co-founder.png'),
      accent: '#22C55E',
      gradientDark: ['rgba(34, 197, 94, 0.18)', 'rgba(16, 22, 17, 0.90)', 'rgba(6, 78, 59, 0.35)'] as [string, string, string],
      gradientLight: ['rgba(220, 252, 231, 0.75)', 'rgba(255, 255, 255, 0.94)', 'rgba(187, 247, 208, 0.40)'] as [string, string, string],
      borderDark: ['#10B981', '#A3E635', '#10B981'] as [string, string, string],
      borderLight: ['#22C55E', '#84CC16', '#22C55E'] as [string, string, string],
    },
  ], [t]);

  const testimonials = useMemo(() => [
    {
      name: t('about.community.testimonials.mahendra.name'),
      initials: 'MB',
      subtitle: t('about.community.testimonials.mahendra.subtitle'),
      review: t('about.community.testimonials.mahendra.review'),
      icon: 'leaf-outline' as IconName,
      color: '#10B981',
      gradientDark: ['rgba(20, 36, 26, 0.85)', 'rgba(16, 22, 17, 0.95)'] as [string, string],
      gradientLight: ['#F3F9F5', '#FCFAF5'] as [string, string],
      borderColorDark: 'rgba(16, 185, 129, 0.22)',
      borderColorLight: 'rgba(16, 185, 129, 0.12)',
    },
    {
      name: t('about.community.testimonials.ramamani.name'),
      initials: 'RB',
      subtitle: t('about.community.testimonials.ramamani.subtitle'),
      review: t('about.community.testimonials.ramamani.review'),
      icon: 'sunny-outline' as IconName,
      color: '#D97706',
      gradientDark: ['rgba(40, 28, 16, 0.85)', 'rgba(22, 18, 14, 0.95)'] as [string, string],
      gradientLight: ['#FCF7EE', '#FCFAF5'] as [string, string],
      borderColorDark: 'rgba(217, 119, 6, 0.22)',
      borderColorLight: 'rgba(217, 119, 6, 0.12)',
    },
  ], [t]);

  const topPad = insets.top || (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0);

const handleSend = async () => {
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      Alert.alert(t('missingFields'), t('fillAllFields'));
      return;
    }

    if (trimmedName.length > 100) {
      Alert.alert(t('missingFields'), t('nameTooLong'));
      return;
    }

    if (trimmedEmail.length > 255) {
      Alert.alert(t('invalidEmail'), t('emailTooLong'));
      return;
    }

    if (!trimmedEmail.includes('@') || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      Alert.alert(t('invalidEmail'), t('enterValidEmail'));
      return;
    }

    if (trimmedMessage.length > 5000) {
      Alert.alert(t('missingFields'), t('messageTooLong'));
      return;
    }

    setSending(true);
    try {
      const response = await axios.post(
        'https://www.saathiai.org/api/contact',
        {
          name: trimmedName,
          email: trimmedEmail,
          message: trimmedMessage,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      if (response.status === 200 && response.data?.success) {
        setSending(false);
        setSendSuccess(true);
        setTimeout(() => {
          setSendSuccess(false);
          setFullName('');
          setEmail('');
          setMessage('');
        }, 3000);
      } else {
        const errorMsg = response.data?.error || t('error');
        Alert.alert(t('error'), errorMsg);
      }
    } catch (e: any) {
      let errorMsg = t('error');
      if (e.response?.data?.error) {
        errorMsg = e.response.data.error;
      } else if (e.message) {
        errorMsg = e.message;
      }
      Alert.alert(t('error'), errorMsg);
    } finally {
      setSending(false);
    }
  };



  return (
    <View style={[styles.root, { backgroundColor: theme.background, paddingTop: topPad }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.navbar, { backgroundColor: isDark ? 'rgba(24,33,27,0.92)' : theme.surface, borderBottomColor: theme.sep2 }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.navButton, { backgroundColor: theme.primaryLight }]} hitSlop={12}>
          <Ionicons name="chevron-back" size={22} color={theme.primary} />
        </TouchableOpacity>
        <View style={styles.navBrand}>
          <Image source={require('../../assets/images/app-logo.png')} style={styles.navLogo} />
          <Text style={[styles.navTitle, { color: theme.textPrimary }]}>{t('about.navTitle')}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <LinearGradient
          colors={isDark ? ['#1C2521', '#111714'] : ['#ECFDF5', '#FFF7ED']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.hero,
            {
              borderColor: isDark ? 'rgba(52, 211, 153, 0.18)' : 'rgba(26,123,60,0.12)',
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: isDark ? 0.38 : 0.06,
              shadowRadius: isDark ? 22 : 12,
              elevation: isDark ? 8 : 3,
            }
          ]}
        >
          <View style={[styles.heroOrb, styles.heroOrbOne, { backgroundColor: isDark ? 'rgba(52,211,153,0.08)' : 'rgba(16,185,129,0.18)' }]} />
          <View style={[styles.heroOrb, styles.heroOrbTwo, { backgroundColor: isDark ? 'rgba(251,191,36,0.05)' : 'rgba(245,158,11,0.18)' }]} />
          <View style={styles.heroTop}>
            <View style={[
              styles.heroLogoShell,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
                borderColor: isDark ? 'rgba(52, 211, 153, 0.15)' : 'rgba(0,0,0,0.05)',
                borderWidth: isDark ? 1 : 0
              }
            ]}>
              <Image source={require('../../assets/images/app-logo.png')} style={styles.heroLogo} />
            </View>
            <View style={[styles.heroChip, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.72)', borderColor: isDark ? theme.sep2 : 'rgba(255,255,255,0.9)' }]}>
              <Ionicons name="shield-checkmark-outline" size={14} color={isDark ? '#34D399' : theme.primary} />
              <Text style={[styles.heroChipText, { color: theme.textPrimary }]}>{t('about.hero.chipText')}</Text>
            </View>
          </View>
          <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>{t('about.hero.title')}</Text>
          <Text style={[styles.heroBody, { color: theme.textSecondary }]}>{t('about.hero.body')}</Text>
          <View style={styles.heroMiniRow}>
            {[
              ['leaf-outline', t('about.hero.growth')],
              ['sparkles-outline', t('about.hero.ai')],
              ['earth-outline', t('about.hero.ruralReady')],
            ].map(([icon, label]) => (
              <View
                key={label}
                style={[
                  styles.heroMini,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.74)',
                    borderWidth: isDark ? 1 : 0,
                    borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'transparent',
                  }
                ]}
              >
                <Ionicons name={icon as IconName} size={15} color={isDark ? '#34D399' : theme.primary} />
                <Text style={[styles.heroMiniText, { color: theme.textPrimary }]}>{label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        <SectionHeader eyebrow={t('about.mission.eyebrow')} title={t('about.mission.title')} theme={theme} />
        <View style={[styles.missionCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
          <View style={[styles.missionIcon, { backgroundColor: theme.primaryLight }]}>
            <Ionicons name="heart-outline" size={24} color={theme.primary} />
          </View>
          <Text style={[styles.missionTitle, { color: theme.textPrimary }]}>{t('about.mission.cardTitle')}</Text>
          <Text style={[styles.missionBody, { color: theme.textSecondary }]}>{t('about.mission.cardBody')}</Text>
          <View style={styles.keywordRow}>
            {[t('about.mission.keywords.soilFirst'), t('about.mission.keywords.local'), t('about.mission.keywords.fast'), t('about.mission.keywords.human')].map(word => (
              <View key={word} style={[styles.keywordPill, { backgroundColor: isDark ? theme.bg1 : theme.primaryLight }]}>
                <Text style={[styles.keywordText, { color: theme.primary }]}>{word}</Text>
              </View>
            ))}
          </View>
        </View>

        <SectionHeader eyebrow={t('about.ecosystem.eyebrow')} title={t('about.ecosystem.title')} theme={theme} />
        <View style={styles.featureGrid}>
          {featureItems.map(item => (
            <View key={item.title} style={[styles.featureCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
              <View style={[styles.featureIcon, { backgroundColor: item.tint }]}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <Text style={[styles.featureTitle, { color: theme.textPrimary }]}>{item.title}</Text>
              <Text style={[styles.featureBody, { color: theme.textSecondary }]}>{item.body}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionGap} />

        <LinearGradient
          colors={isDark ? ['#202B24', '#121A14'] : ['#FFF7ED', '#ECFDF5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.deviceCard, { borderColor: isDark ? 'rgba(251,191,36,0.18)' : 'rgba(245,158,11,0.20)' }]}
        >
          <View style={styles.deviceCopy}>
            <View style={[styles.deviceTag, { backgroundColor: isDark ? 'rgba(251,191,36,0.14)' : '#FEF3C7' }]}>
              <Ionicons name="flash-outline" size={14} color={theme.amber} />
              <Text style={[styles.deviceTagText, { color: isDark ? '#FCD34D' : '#B45309' }]}>{t('about.scanner.tag')}</Text>
            </View>
            <Text style={[styles.deviceTitle, { color: theme.textPrimary }]}>{t('about.scanner.title')}</Text>
            <Text style={[styles.deviceBody, { color: theme.textSecondary }]}>{t('about.scanner.body')}</Text>
          </View>
          <Image source={require('../../assets/images/Agni_Device.png')} style={styles.deviceImage} resizeMode="contain" />
          <View style={styles.devicePoints}>
            {devicePoints.map(point => (
              <View key={point} style={styles.devicePoint}>
                <View style={[styles.devicePointIcon, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name="checkmark" size={13} color={theme.primary} />
                </View>
                <Text style={[styles.devicePointText, { color: theme.textSecondary }]}>{point}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        <View style={styles.sectionGap} />

        <View style={styles.impactGrid}>
          {impactItems.map(item => (
            <View key={item.label} style={[styles.impactCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
              <View style={[styles.impactIcon, { backgroundColor: `${item.color}${isDark ? '22' : '14'}` }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={[styles.impactValue, { color: item.color }]}>{item.value}</Text>
              <Text style={[styles.impactLabel, { color: theme.textSecondary }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionGap} />

        <View style={[styles.farmerCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
          <LinearGradient
            colors={isDark ? ['rgba(16,185,129,0.16)', 'rgba(245,158,11,0.08)'] : ['#ECFDF5', '#FFFBEB']}
            style={styles.farmerIllustration}
          >
            <Ionicons name="people-outline" size={34} color={theme.primary} />
            <Ionicons name="chatbubbles-outline" size={30} color={theme.amber} />
            <Ionicons name="leaf-outline" size={34} color={theme.success} />
          </LinearGradient>
          <Text style={[styles.farmerTitle, { color: theme.textPrimary }]}>{t('about.farmerCard.title')}</Text>
          <Text style={[styles.farmerBody, { color: theme.textSecondary }]}>{t('about.farmerCard.body')}</Text>
        </View>

        <SectionHeader eyebrow={t('about.stack.eyebrow')} title={t('about.stack.title')} theme={theme} />
        <View style={styles.techGrid}>
          {techItems.map(item => (
            <LinearGradient
              key={item.title}
              colors={isDark ? item.gradientDark : item.gradientLight}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.techCard,
                {
                  borderColor: isDark ? item.borderColorDark : item.borderColorLight,
                  shadowColor: item.color,
                  shadowOpacity: isDark ? 0.05 : 0.03,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: isDark ? 0 : 2,
                  backgroundColor: isDark ? '#141A16' : '#FFFFFF',
                }
              ]}
            >
              {/* Left Side: Vibrant colored background capsule with white icon */}
              <LinearGradient
                colors={item.capsuleColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.techIconCapsule,
                  {
                    shadowColor: item.color,
                    shadowOpacity: isDark ? 0.35 : 0.22,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 2 },
                  }
                ]}
              >
                <Ionicons name={item.icon} size={18} color="#FFFFFF" />
              </LinearGradient>

              {/* Right Side: Perfectly vertical-aligned stacked text column */}
              <View style={styles.techContent}>
                <Text style={[styles.techTitle, { color: theme.textPrimary }]}>{item.title}</Text>
                <Text style={[styles.techBody, { color: theme.textSecondary }]}>{item.body}</Text>
              </View>
            </LinearGradient>
          ))}
        </View>

        <SectionHeader eyebrow={t('about.community.eyebrow')} title={t('about.community.title')} theme={theme} />
        <View style={styles.testimonialWrap}>
          {testimonials.map(item => (
            <LinearGradient
              key={item.name}
              colors={isDark ? item.gradientDark : item.gradientLight}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.testimonialCard,
                {
                  borderColor: isDark ? item.borderColorDark : item.borderColorLight,
                  shadowColor: item.color,
                  shadowOpacity: isDark ? 0.06 : 0.04,
                  shadowRadius: 14,
                  shadowOffset: { width: 0, height: 5 },
                  elevation: isDark ? 0 : 2,
                  backgroundColor: isDark ? '#141A16' : '#FFFFFF',
                }
              ]}
            >
              {/* Background double-quote watermark */}
              <MaterialCommunityIcons
                name="format-quote-close"
                size={76}
                color={item.color}
                style={[styles.testimonialWatermark, { opacity: isDark ? 0.06 : 0.09 }]}
              />

              <View style={styles.testimonialHeader}>
                {/* Left: Avatar circle with initials */}
                <View style={[styles.testimonialAvatarShell, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF', borderColor: `${item.color}25` }]}>
                  <LinearGradient
                    colors={isDark ? [`${item.color}35`, 'transparent'] : [`${item.color}15`, `${item.color}05`]}
                    style={styles.avatarGradient}
                  >
                    <Text style={[styles.avatarInitials, { color: item.color }]}>{item.initials}</Text>
                  </LinearGradient>
                </View>

                {/* Middle: Identity Meta Info */}
                <View style={styles.testimonialMeta}>
                  <View style={styles.nameVerifiedRow}>
                    <Text style={[styles.testimonialName, { color: theme.textPrimary }]}>{item.name}</Text>
                    <Ionicons name="checkmark-circle" size={12} color="#10B981" style={styles.verifiedIcon} />
                  </View>
                  <View style={styles.subtitleRow}>
                    <Ionicons name="location" size={10} color={item.color} style={{ marginRight: 2 }} />
                    <Text style={[styles.testimonialSubtitle, { color: theme.textSecondary }]}>{item.subtitle}</Text>
                  </View>
                </View>

                {/* Right: Star ratings compact */}
                <View style={styles.starsContainer}>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Ionicons key={star} name="star" size={11} color="#FBBF24" />
                    ))}
                  </View>
                  <Text style={[styles.verifiedText, { color: theme.textMuted }]}>{t('about.community.testimonials.mahendra.verified')}</Text>
                </View>
              </View>

              {/* Bottom: Farmer Review Text with nested stylized quotes */}
              <Text style={[styles.testimonialText, { color: theme.textSecondary }]}>
                <Text style={[styles.stylizedQuote, { color: item.color }]}>“</Text>
                {item.review}
                <Text style={[styles.stylizedQuote, { color: item.color }]}>”</Text>
              </Text>
            </LinearGradient>
          ))}
        </View>

        <View style={styles.buildersDivider}>
          <View style={[styles.subDividerLine, { backgroundColor: theme.sep2 }]} />
          <Text style={[styles.buildersSubheading, { color: theme.textSecondary }]}>{t('about.community.meetBuilders')}</Text>
        </View>

        <View style={styles.teamWrap}>
          {teamItems.map(member => (
            <TouchableOpacity key={member.name} activeOpacity={0.86} style={[styles.teamCardShadow, { shadowColor: member.accent }]}>
              {/* Outer Border Gradient Container */}
              <LinearGradient
                colors={isDark ? member.borderDark : member.borderLight}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.teamCardBorder}
              >
                {/* Inner Card Gradient Content */}
                <LinearGradient
                  colors={isDark ? member.gradientDark : member.gradientLight}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.teamCardInner}
                >
                  {/* Modern ambient radial glow behind the avatar */}
                  <View style={[styles.avatarGlowBg, { backgroundColor: member.accent }]} />
                  
                  {/* Floating transparent avatar */}
                  <Image source={member.image} style={styles.teamAvatar} resizeMode="contain" />
                  
                  <Text style={[styles.teamName, { color: theme.textPrimary }]}>{member.name}</Text>
                  
                  <View style={[
                    styles.roleBadge, 
                    { 
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.65)', 
                      borderColor: isDark ? `${member.accent}33` : `${member.accent}26`,
                      borderWidth: 1
                    }
                  ]}>
                    <Text style={[styles.roleText, { color: isDark ? member.accent : theme.primary }]}>{member.role}</Text>
                  </View>
                  
                  <View style={[
                    styles.collegeBadge, 
                    { 
                      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.45)', 
                      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.25)',
                      borderWidth: 1
                    }
                  ]}>
                    <Ionicons name="school-outline" size={13} color={member.accent} />
                    <Text style={[styles.collegeText, { color: theme.textSecondary }]}>{member.college}</Text>
                  </View>
                </LinearGradient>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <SectionHeader eyebrow={t('about.connect.eyebrow')} title={t('about.connect.title')} theme={theme} />
        <View style={[styles.contactCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
          <ContactRow icon="location-outline" color={theme.blue} text={t('about.connect.address')} theme={theme} />
          <TouchableOpacity onPress={() => Linking.openURL('tel:+917205095602')} activeOpacity={0.75}>
            <ContactRow icon="call-outline" color={theme.primary} text="+91 7205095602" theme={theme} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('mailto:saathi.ai.innovation@gmail.com')} activeOpacity={0.75}>
            <ContactRow icon="mail-outline" color={theme.amber} text="saathi.ai.innovation@gmail.com" theme={theme} />
          </TouchableOpacity>

          <TextInput
            style={[styles.input, { backgroundColor: isDark ? theme.bg1 : theme.bg0, borderColor: theme.border, color: theme.textPrimary }]}
            placeholder={t('Enter Your Name')}
            placeholderTextColor={theme.textMuted}
            value={fullName}
            onChangeText={setFullName}
          />
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? theme.bg1 : theme.bg0, borderColor: theme.border, color: theme.textPrimary }]}
            placeholder={t('Enter Your Email')}
            placeholderTextColor={theme.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={[styles.textarea, { backgroundColor: isDark ? theme.bg1 : theme.bg0, borderColor: theme.border, color: theme.textPrimary }]}
            placeholder={t('Enter Your Message')}
            placeholderTextColor={theme.textMuted}
            multiline
            textAlignVertical="top"
            value={message}
            onChangeText={setMessage}
          />
          <PremiumSendButton 
            onPress={handleSend} 
            sending={sending} 
            success={sendSuccess}
            text={t('Send Message')} 
            theme={theme} 
          />
        </View>

        <View style={[styles.footer, { borderColor: theme.cardBorder }]}>
          <Image source={require('../../assets/images/app-logo.png')} style={styles.footerLogo} />
          <Text style={[styles.footerTitle, { color: theme.textPrimary }]}>{t('about.navTitle')}</Text>
          <Text style={[styles.footerText, { color: theme.textMuted }]}>{t('about.footer.copyright')}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function SectionHeader({ eyebrow, title, theme }: { eyebrow: string; title: string; theme: any }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.eyebrow, { color: theme.primary }]}>{eyebrow}</Text>
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{title}</Text>
    </View>
  );
}

function ContactRow({ icon, color, text, theme }: { icon: IconName; color: string; text: string; theme: any }) {
  return (
    <View style={styles.contactRow}>
      <View style={[styles.contactIcon, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={17} color={color} />
      </View>
      <Text style={[styles.contactText, { color: theme.textSecondary }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBrand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navLogo: { width: 22, height: 22 },
  navTitle: { fontFamily: 'Sora_700Bold', fontSize: 17 },
  scroll: { paddingBottom: 56 },

  hero: {
    margin: 16,
    padding: 22,
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: 292,
  },
  heroOrb: { position: 'absolute', borderRadius: 999 },
  heroOrbOne: { width: 150, height: 150, top: -52, right: -36 },
  heroOrbTwo: { width: 120, height: 120, bottom: -44, left: -38 },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  heroLogoShell: {
    width: 64,
    height: 64,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 5,
  },
  heroLogo: { width: 34, height: 34 },
  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 8,
    flexShrink: 1,
  },
  heroChipText: { fontFamily: 'Sora_600SemiBold', fontSize: 10 },
  heroTitle: { fontFamily: 'Sora_800ExtraBold', fontSize: 31, lineHeight: 39, marginTop: 28 },
  heroBody: { fontFamily: 'Sora_400Regular', fontSize: 14, lineHeight: 22, marginTop: 12 },
  heroMiniRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 20 },
  heroMini: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 8 },
  heroMiniText: { fontFamily: 'Sora_600SemiBold', fontSize: 11 },

  sectionHeader: { paddingHorizontal: 18, paddingTop: 32, paddingBottom: 12 },
  eyebrow: { fontFamily: 'Sora_800ExtraBold', fontSize: 10.5, letterSpacing: 2.0, textTransform: 'uppercase' },
  sectionTitle: { fontFamily: 'Sora_800ExtraBold', fontSize: 22, lineHeight: 29, marginTop: 5 },
  sectionGap: { height: 28 },
  buildersDivider: {
    alignItems: 'center',
    marginTop: 36,
    marginBottom: 20,
  },
  subDividerLine: {
    width: '80%',
    height: 1,
    marginBottom: 16,
    opacity: 0.2,
  },
  buildersSubheading: {
    fontFamily: 'Sora_800ExtraBold',
    fontSize: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  missionCard: {
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  missionIcon: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  missionTitle: { fontFamily: 'Sora_800ExtraBold', fontSize: 19, lineHeight: 26, marginTop: 14 },
  missionBody: { fontFamily: 'Sora_400Regular', fontSize: 14, lineHeight: 22, marginTop: 9 },
  keywordRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  keywordPill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  keywordText: { fontFamily: 'Sora_700Bold', fontSize: 11 },

  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 16 },
  featureCard: {
    width: '48.2%',
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    minHeight: 184,
  },
  featureIcon: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginBottom: 13 },
  featureTitle: { fontFamily: 'Sora_800ExtraBold', fontSize: 14, lineHeight: 19 },
  featureBody: { fontFamily: 'Sora_400Regular', fontSize: 12, lineHeight: 18, marginTop: 7 },

  deviceCard: {
    marginHorizontal: 16,
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  deviceCopy: { width: '68%', zIndex: 2 },
  deviceTag: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 },
  deviceTagText: { fontFamily: 'Sora_700Bold', fontSize: 10 },
  deviceTitle: { fontFamily: 'Sora_800ExtraBold', fontSize: 24, marginTop: 14 },
  deviceBody: { fontFamily: 'Sora_400Regular', fontSize: 13, lineHeight: 20, marginTop: 8 },
  deviceImage: { position: 'absolute', right: -8, top: 28, width: 142, height: 190 },
  devicePoints: { marginTop: 28, gap: 10 },
  devicePoint: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  devicePointIcon: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  devicePointText: { flex: 1, fontFamily: 'Sora_500Medium', fontSize: 12, lineHeight: 18 },

  impactGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 16 },
  impactCard: { width: '48.2%', borderWidth: 1, borderRadius: 22, padding: 15, minHeight: 132 },
  impactIcon: { width: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  impactValue: { fontFamily: 'Sora_800ExtraBold', fontSize: 25, marginTop: 12 },
  impactLabel: { fontFamily: 'Sora_500Medium', fontSize: 12, lineHeight: 18, marginTop: 2 },

  farmerCard: { marginHorizontal: 16, borderWidth: 1, borderRadius: 24, padding: 18 },
  farmerIllustration: {
    height: 94,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  farmerTitle: { fontFamily: 'Sora_800ExtraBold', fontSize: 18, lineHeight: 25 },
  farmerBody: { fontFamily: 'Sora_400Regular', fontSize: 14, lineHeight: 22, marginTop: 9 },

  teamWrap: { paddingHorizontal: 16, gap: 16 },
  teamCardShadow: {
    borderRadius: 28,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 6,
  },
  teamCardBorder: {
    borderRadius: 28,
    padding: 1.6,
  },
  teamCardInner: {
    borderRadius: 26.5,
    padding: 16,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  avatarGlowBg: {
    position: 'absolute',
    top: 26,
    width: 90,
    height: 90,
    borderRadius: 45,
    opacity: 0.12,
    zIndex: 1,
    alignSelf: 'center',
  },
  teamAvatar: { 
    width: 110, 
    height: 110, 
    marginBottom: 8,
    zIndex: 2,
  },
  teamName: { 
    fontFamily: 'Sora_800ExtraBold', 
    fontSize: 18, 
    textAlign: 'center',
    letterSpacing: 0.3,
    zIndex: 2,
  },
  roleBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4.5,
    marginTop: 5,
    maxWidth: '94%',
    zIndex: 2,
  },
  roleText: { 
    fontFamily: 'Sora_800ExtraBold', 
    fontSize: 11, 
    lineHeight: 16, 
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  collegeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 5,
    zIndex: 2,
  },
  collegeText: { 
    fontFamily: 'Sora_600SemiBold', 
    fontSize: 9.5, 
    textAlign: 'center', 
    flexShrink: 1 
  },

  testimonialWrap: { paddingHorizontal: 16, gap: 10 },
  testimonialCard: {
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 12,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#1B3B2B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    marginBottom: 2,
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    zIndex: 2,
  },
  testimonialAvatarShell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontFamily: 'Sora_800ExtraBold',
    fontSize: 12.5,
    letterSpacing: -0.2,
  },
  testimonialMeta: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  nameVerifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedIcon: {
    marginTop: -1,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0.5,
  },
  testimonialName: {
    fontFamily: 'Sora_800ExtraBold',
    fontSize: 13.5,
    letterSpacing: 0.1,
  },
  testimonialSubtitle: {
    fontFamily: 'Sora_500Medium',
    fontSize: 10.5,
    lineHeight: 20,
  },
  premiumSendBtn: {
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  premiumSendContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  starsContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 1.5,
    alignItems: 'center',
  },
  verifiedText: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 8.5,
    marginTop: 2,
    letterSpacing: 0.1,
  },
  testimonialText: {
    fontFamily: 'Sora_500Medium',
    fontSize: 12.5,
    lineHeight: 18.5,
    fontStyle: 'italic',
    zIndex: 2,
    paddingLeft: 2,
    letterSpacing: -0.1,
  },
  stylizedQuote: {
    fontFamily: 'Sora_800ExtraBold',
    fontSize: 16,
    lineHeight: 16,
  },
  testimonialWatermark: {
    position: 'absolute',
    right: -10,
    bottom: -16,
    zIndex: 1,
  },

  techGrid: { paddingHorizontal: 16, gap: 10 },
  techCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 14, 
    borderWidth: 1, 
    borderRadius: 20, 
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    marginBottom: 2,
  },
  techIconCapsule: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  techContent: {
    flex: 1,
    justifyContent: 'center',
  },
  techTitle: { 
    fontFamily: 'Sora_800ExtraBold', 
    fontSize: 14,
    letterSpacing: 0.1,
  },
  techBody: { 
    fontFamily: 'Sora_500Medium', 
    fontSize: 11.5, 
    lineHeight: 17, 
    marginTop: 2.5,
  },

  contactCard: { marginHorizontal: 16, borderWidth: 1, borderRadius: 24, padding: 16 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  contactIcon: { width: 34, height: 34, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  contactText: { flex: 1, fontFamily: 'Sora_500Medium', fontSize: 12, lineHeight: 18 },
  input: { borderWidth: 1, borderRadius: 15, paddingHorizontal: 14, paddingVertical: 12, fontFamily: 'Sora_400Regular', fontSize: 14, marginTop: 10 },
  textarea: { borderWidth: 1, borderRadius: 15, paddingHorizontal: 14, paddingVertical: 12, fontFamily: 'Sora_400Regular', fontSize: 14, minHeight: 110, marginTop: 10 },
  sendButton: { borderRadius: 16, paddingVertical: 15, alignItems: 'center', justifyContent: 'center', marginTop: 14 },
  sendButtonText: { fontFamily: 'Sora_800ExtraBold', fontSize: 15, color: '#FFFFFF' },

  footer: { marginHorizontal: 16, marginTop: 18, borderWidth: 1, borderRadius: 24, padding: 20, alignItems: 'center' },
  footerLogo: { width: 36, height: 36, marginBottom: 8 },
  footerTitle: { fontFamily: 'Sora_800ExtraBold', fontSize: 17 },
  footerText: { fontFamily: 'Sora_400Regular', fontSize: 12, marginTop: 5, textAlign: 'center' },
});

function PremiumSendButton({ onPress, sending, success, disabled, text, theme }: any) {
  const scale = React.useRef(new Animated.Value(1)).current;
  const gradientTranslateX = React.useRef(new Animated.Value(-300)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (sending) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(gradientTranslateX, { toValue: 300, duration: 1200, useNativeDriver: true }),
          Animated.timing(gradientTranslateX, { toValue: -300, duration: 0, useNativeDriver: true })
        ])
      ).start();
    } else {
      gradientTranslateX.setValue(-300);
      gradientTranslateX.stopAnimation();
    }
  }, [sending]);

  useEffect(() => {
    if (success) {
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 300, useNativeDriver: true })
      ]).start();
    }
  }, [success]);

  const handlePressIn = () => {
    if (!disabled && !sending && !success) {
      Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
    }
  };
  const handlePressOut = () => {
    if (!disabled && !sending && !success) {
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5, tension: 40 }).start();
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: Animated.multiply(scale, pulseAnim) }], width: '100%', marginTop: 8 }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || sending || success}
        style={[
          styles.premiumSendBtn,
          { backgroundColor: success ? theme.success || '#10B981' : theme.primary },
          disabled && !sending && !success && { opacity: 0.6 }
        ]}
      >
        <View style={styles.premiumSendContent}>
          {success ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.sendButtonText}>Message Sent!</Text>
            </View>
          ) : sending ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.sendButtonText}>Sending...</Text>
            </View>
          ) : (
            <Text style={styles.sendButtonText}>{text}</Text>
          )}
        </View>

        {sending && (
          <Animated.View style={[StyleSheet.absoluteFillObject, { transform: [{ translateX: gradientTranslateX }], opacity: 0.5 }]}>
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.3)', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFillObject} />
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  );
}
