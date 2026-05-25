import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  Switch, Alert, ActivityIndicator, Platform, Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing } from '@/constants/Spacing';
import { useAuthStore } from '@/store/authStore';
import { useDarkModeTheme, useTheme } from '@/context/ThemeContext';
import apiClient from '@/api/axiosConfig';
import { useTranslation } from '@/context/LanguageContext';
import { getUserData } from '@/features/auth/services/user';
import { logout } from '@/features/auth/services/auth';
import * as Sharing from 'expo-sharing';

const SETTINGS_KEY = 'saathi_settings';

const LANGUAGES = [
  { code: 'en', label: '🇬🇧 English' },
  { code: 'hi', label: '🇮🇳 हिन्दी' },
  { code: 'od', label: '🇮🇳 ଓଡ଼ିଆ' },
];

interface SettingsState {
  autoSync: boolean;
}

function SectionCard({ title, subtitle, icon, color, children, theme }: {
  title: string; subtitle?: string; icon: string; color: string; children: React.ReactNode; theme: any;
}) {
  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIconBg, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon as any} size={18} color={color} />
        </View>
        <View style={styles.cardHeaderText}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{title}</Text>
          {subtitle ? <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text> : null}
        </View>
      </View>
      {children}
    </View>
  );
}

function ToggleRow({ label, description, value, onToggle, theme, isDark }: {
  label: string; description?: string; value: boolean; onToggle: (v: boolean) => void; theme: any; isDark?: boolean;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={[styles.toggleLabel, { color: theme.textPrimary }]}>{label}</Text>
        {description ? <Text style={[styles.toggleDesc, { color: theme.textSecondary }]}>{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: theme.border, true: theme.primary + '70' }}
        thumbColor={value ? theme.primary : isDark ? theme.textMuted : '#f4f3f4'}
      />
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { clearUser } = useAuthStore();
  const { setMode, isDarkMode } = useTheme();
  const { theme, isDark } = useDarkModeTheme();
  const { t, locale, changeLanguage } = useTranslation();
  const backScale = useRef(new Animated.Value(1)).current;
  
  const [settings, setSettings] = useState<SettingsState>({
    autoSync: true,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY).then(val => {
      if (val) {
        try { 
          const parsed = JSON.parse(val);
          setSettings({
            autoSync: parsed.autoSync !== undefined ? parsed.autoSync : true,
          });
        } catch {}
      }
    });
  }, []);

  const saveSettings = (newSettings: SettingsState) => {
    setSettings(newSettings);
    AsyncStorage.getItem(SETTINGS_KEY).then(val => {
      let existing = { language: locale };
      if (val) {
        try { existing = JSON.parse(val); } catch {}
      }
      const combined = { ...existing, ...newSettings };
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(combined));
    });
  };

  const handleToggle = (key: keyof SettingsState, value: boolean) => {
    saveSettings({ ...settings, [key]: value });
  };

  const handleLanguageChange = (code: string) => {
    changeLanguage(code as any);
    setShowLangPicker(false);
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const data = await getUserData('json');
      const count = Object.keys(data).length;
      if (await Sharing.isAvailableAsync()) {
        Alert.alert(
          t('settings.dataSection.exportAlertTitle'),
          t('settings.dataSection.exportAlertDesc', { count })
        );
      } else {
        const jsonString = JSON.stringify(data, null, 2);
        const size = jsonString.length > 200 ? jsonString.substring(0, 200) + '...' : jsonString;
        Alert.alert(
          t('settings.dataSection.exportAlertTitle'),
          t('settings.dataSection.exportAlertFallback', { size })
        );
      }
    } catch (e: any) {
      Alert.alert(t('settings.dataSection.exportFailed'), e.message || t('settings.dataSection.exportFailed'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('settings.dangerZone.deleteAlertTitle'),
      t('settings.dangerZone.deleteAlertDesc'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.dangerZone.deleteBtn'),
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await apiClient.delete('/users/me');
              await logout();
              clearUser();
              router.replace('/(auth)/login');
            } catch (e: any) {
              Alert.alert(t('common.error'), e.message || 'Failed to delete account.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const selectedLang = LANGUAGES.find(l => l.code === locale);

  const animateBack = (toValue: number) => {
    Animated.spring(backScale, {
      toValue,
      useNativeDriver: true,
      speed: 22,
      bounciness: 6,
    }).start();
  };

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)');
  };

  const summaryItems = [
    { label: t('settings.summary.theme'), value: isDarkMode ? t('settings.summary.themeDark') : t('settings.summary.themeLight'), icon: isDarkMode ? 'moon' : 'sunny', color: theme.purple },
    { label: t('settings.summary.language'), value: selectedLang?.label?.replace(/^.*?\s/, '') || 'English', icon: 'language', color: theme.blue },
    { label: t('settings.summary.sync'), value: settings.autoSync ? t('settings.summary.syncOn') : t('settings.summary.syncOff'), icon: settings.autoSync ? 'cloud-done' : 'cloud-offline', color: settings.autoSync ? theme.primary : theme.textMuted },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 16, Platform.OS === 'ios' ? 60 : 40) }]}>
        <View style={styles.headerTop}>
          <Animated.View style={{ transform: [{ scale: backScale }] }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={handleBack}
              onPressIn={() => animateBack(0.94)}
              onPressOut={() => animateBack(1)}
              style={[
                styles.backButton,
                {
                  backgroundColor: isDark ? theme.surface : theme.surface,
                  borderColor: isDark ? theme.borderLight : 'transparent',
                },
              ]}
            >
              <Ionicons name="chevron-back" size={22} color={theme.textPrimary} />
            </Pressable>
          </Animated.View>
          <View style={styles.headerCopy}>
            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{t('settings.title')}</Text>
            <Text style={[styles.headerSub, { color: theme.textSecondary }]}>{t('settings.subtitle')}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.summaryCard, { backgroundColor: isDark ? theme.surface : theme.bg0, borderColor: theme.borderLight }]}>
          <View style={styles.summaryTop}>
            <View>
              <Text style={[styles.summaryEyebrow, { color: theme.primary }]}>{t('settings.summary.eyebrow')}</Text>
              <Text style={[styles.summaryTitle, { color: theme.textPrimary }]}>{t('settings.summary.title')}</Text>
            </View>
            <View style={[styles.summaryBadge, { backgroundColor: theme.primaryLight }]}>
              <Ionicons name="options-outline" size={18} color={theme.primary} />
            </View>
          </View>
          <View style={styles.summaryGrid}>
            {summaryItems.map(item => (
              <View key={item.label} style={[styles.summaryItem, { backgroundColor: isDark ? theme.bg1 : theme.surface, borderColor: theme.borderLight }]}>
                <Ionicons name={item.icon as any} size={16} color={item.color} />
                <View style={styles.summaryTextWrap}>
                  <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>{item.label}</Text>
                  <Text style={[styles.summaryValue, { color: theme.textPrimary }]} numberOfLines={1}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <SectionCard title={t('settings.appearance.title')} subtitle={t('settings.appearance.subtitle')} icon="moon-outline" color={theme.purple} theme={theme}>
          <ToggleRow
            label={t('settings.appearance.toggleLabel')}
            description={t('settings.appearance.toggleDesc')}
            value={isDarkMode}
            onToggle={(v) => setMode(v ? 'dark' : 'light')}
            theme={theme}
            isDark={isDark}
          />
        </SectionCard>

        <SectionCard title={t('settings.languageSection.title')} subtitle={t('settings.languageSection.subtitle')} icon="globe-outline" color={theme.blue} theme={theme}>
          <View style={styles.langSection}>
            <Text style={[styles.toggleLabel, { color: theme.textPrimary }]}>{t('settings.languageSection.label')}</Text>
            <Pressable style={[styles.langSelector, { backgroundColor: theme.background, borderColor: theme.border }]} onPress={() => setShowLangPicker(!showLangPicker)}>
              <Text style={[styles.langSelected, { color: theme.textPrimary }]}>{selectedLang?.label || '🇬🇧 English'}</Text>
              <Ionicons name={showLangPicker ? 'chevron-up' : 'chevron-down'} size={16} color={theme.textSecondary} />
            </Pressable>
            {showLangPicker && (
              <View style={[styles.langList, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                {LANGUAGES.map(lang => (
                  <Pressable
                    key={lang.code}
                    style={[
                      styles.langOption,
                      isDark && { borderBottomColor: theme.borderLight },
                      locale === lang.code && [styles.langOptionActive, { backgroundColor: theme.surfaceAlt }],
                    ]}
                    onPress={() => handleLanguageChange(lang.code)}
                  >
                    <Text style={[styles.langOptionText, { color: theme.textSecondary }, locale === lang.code && [styles.langOptionTextActive, { color: theme.primary }]]}>
                      {lang.label}
                    </Text>
                    {locale === lang.code && (
                      <Ionicons name="checkmark" size={16} color={theme.primary} />
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </SectionCard>

        <SectionCard title={t('settings.syncSection.title')} subtitle={t('settings.syncSection.subtitle')} icon="phone-portrait-outline" color={theme.primary} theme={theme}>
          <ToggleRow
            label={t('settings.syncSection.label')}
            description={t('settings.syncSection.desc')}
            value={settings.autoSync}
            onToggle={(v) => handleToggle('autoSync', v)}
            theme={theme}
            isDark={isDark}
          />
        </SectionCard>

        <SectionCard title={t('settings.dataSection.title')} subtitle={t('settings.dataSection.subtitle')} icon="server-outline" color={theme.amber} theme={theme}>
          <Pressable
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: isDark ? theme.bg1 : theme.background, borderColor: theme.border },
              pressed && { opacity: 0.78 },
              isExporting && { opacity: 0.6 },
            ]}
            onPress={handleExportData}
            disabled={isExporting}
          >
            <View style={[styles.actionIconShell, { backgroundColor: theme.blue + '18' }]}>
              {isExporting ? (
                <ActivityIndicator size="small" color={theme.blue} />
              ) : (
                <Ionicons name="download-outline" size={18} color={theme.blue} />
              )}
            </View>
            <View style={styles.actionCopy}>
              <Text style={[styles.actionBtnText, { color: theme.textPrimary }]}>
                {isExporting ? t('common.loading') : t('settings.dataSection.btnText')}
              </Text>
              <Text style={[styles.actionBtnSub, { color: theme.textSecondary }]}>{t('settings.dataSection.btnDesc')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
          </Pressable>
        </SectionCard>

        <View style={[styles.card, styles.dangerCard, { backgroundColor: isDark ? '#2D1A1A' : '#FFF5F5', borderColor: theme.error + '40' }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconBg, { backgroundColor: theme.error + '20' }]}>
              <Ionicons name="warning-outline" size={18} color={theme.error} />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={[styles.cardTitle, { color: theme.error }]}>{t('settings.dangerZone.title')}</Text>
              <Text style={[styles.cardSubtitle, { color: theme.error + 'AA' }]}>{t('settings.dangerZone.subtitle')}</Text>
            </View>
          </View>
          <Text style={[styles.dangerNote, { color: theme.error + 'AA' }]}>{t('settings.dangerZone.desc')}</Text>
          <View style={styles.dangerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.toggleLabel, { color: theme.error }]}>{t('settings.dangerZone.deleteLabel')}</Text>
              <Text style={[styles.toggleDesc, { color: theme.textSecondary }]}>{t('settings.dangerZone.deleteDesc')}</Text>
            </View>
            <Pressable
              style={[styles.deleteBtn, { backgroundColor: theme.error }, isDeleting && { opacity: 0.6 }]}
              onPress={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="trash-outline" size={16} color="#fff" />
              )}
              <Text style={styles.deleteBtnText}>{isDeleting ? t('common.loading') : t('settings.dangerZone.deleteBtn')}</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  headerCopy: { flex: 1 },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    ...Spacing.shadows.sm,
  },
  headerTitle: { fontFamily: 'Sora_800ExtraBold', fontSize: 26 },
  headerSub: { fontFamily: 'Sora_400Regular', fontSize: 13, marginTop: 4 },
  scroll: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md },

  summaryCard: {
    borderRadius: Spacing.radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    ...Spacing.shadows.sm,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  summaryEyebrow: {
    fontFamily: 'Sora_700Bold',
    fontSize: 10,
    letterSpacing: 0.8,
  },
  summaryTitle: {
    fontFamily: 'Sora_700Bold',
    fontSize: 18,
    marginTop: 3,
  },
  summaryBadge: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryItem: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
    minHeight: 72,
    justifyContent: 'space-between',
  },
  summaryTextWrap: { marginTop: 8 },
  summaryLabel: { fontFamily: 'Sora_500Medium', fontSize: 10 },
  summaryValue: { fontFamily: 'Sora_700Bold', fontSize: 12, marginTop: 2 },

  card: {
    borderRadius: Spacing.radius.xl,
    padding: Spacing.lg,
    ...Spacing.shadows.sm,
    marginBottom: Spacing.lg,
    borderWidth: 1,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: Spacing.md },
  cardIconBg: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  cardHeaderText: { flex: 1 },
  cardTitle: { fontFamily: 'Sora_700Bold', fontSize: 15 },
  cardSubtitle: { fontFamily: 'Sora_400Regular', fontSize: 11, lineHeight: 16, marginTop: 2 },

  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  toggleLabel: { fontFamily: 'Sora_600SemiBold', fontSize: 14, marginBottom: 2 },
  toggleDesc: { fontFamily: 'Sora_400Regular', fontSize: 12, lineHeight: 18 },

  langSection: { gap: 8 },
  langSelector: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderRadius: Spacing.radius.md,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1,
    marginTop: 8,
  },
  langSelected: { fontFamily: 'Sora_600SemiBold', fontSize: 14 },
  langList: {
    borderRadius: Spacing.radius.md,
    borderWidth: 1,
    marginTop: 4, overflow: 'hidden',
  },
  langOption: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1,
  },
  langOptionActive: {},
  langOptionText: { fontFamily: 'Sora_400Regular', fontSize: 14 },
  langOptionTextActive: { fontFamily: 'Sora_600SemiBold' },

  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: Spacing.radius.md,
    paddingHorizontal: 12, paddingVertical: 12,
    borderWidth: 1,
  },
  actionIconShell: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCopy: { flex: 1 },
  actionBtnText: { fontFamily: 'Sora_700Bold', fontSize: 14 },
  actionBtnSub: { fontFamily: 'Sora_400Regular', fontSize: 11, lineHeight: 16, marginTop: 2 },
  actionNote: { fontFamily: 'Sora_400Regular', fontSize: 11, marginTop: 8, paddingLeft: 4 },

  dangerCard: { borderWidth: 1 },
  dangerNote: { fontFamily: 'Sora_400Regular', fontSize: 12, marginBottom: Spacing.md },
  dangerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: Spacing.radius.md,
    paddingHorizontal: 14, paddingVertical: 9,
  },
  deleteBtnText: { fontFamily: 'Sora_700Bold', fontSize: 13, color: '#fff' },
});
