import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { locales, LocaleType } from '../locales';
import { useAuthStore } from '../store/authStore';

const SETTINGS_KEY = 'saathi_settings';

interface LanguageContextProps {
  locale: LocaleType;
  changeLanguage: (code: LocaleType) => Promise<void>;
  t: (key: string, variables?: Record<string, string | number>) => any;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<LocaleType>('en');
  const user = useAuthStore(state => state.user);
  const setUser = useAuthStore(state => state.setUser);

  // 1. Initial hydration from local storage
  useEffect(() => {
    const hydrateLanguage = async () => {
      try {
        const val = await AsyncStorage.getItem(SETTINGS_KEY);
        if (val) {
          const parsed = JSON.parse(val);
          if (parsed && parsed.language) {
            const storedLang = parsed.language as LocaleType;
            if (['en', 'hi', 'od'].includes(storedLang)) {
              setLocale(storedLang);
              return;
            }
          }
        }
        
        // Fallback: If no local storage setting exists but user is authenticated, sync with user profile
        if (user && user.preferredLanguage && ['en', 'hi', 'od'].includes(user.preferredLanguage)) {
          setLocale(user.preferredLanguage as LocaleType);
        }
      } catch (e) {
        console.warn('[LanguageContext] Failed to hydrate language selection:', e);
      }
    };

    hydrateLanguage();
  }, [user?.preferredLanguage]);

  // 2. State & Persistence update
  const changeLanguage = async (code: LocaleType) => {
    try {
      setLocale(code);

      // Save preference inside saathi_settings local storage, preserving other keys like autoSync
      const val = await AsyncStorage.getItem(SETTINGS_KEY);
      let existingSettings = { autoSync: true };
      if (val) {
        try {
          existingSettings = JSON.parse(val);
        } catch {}
      }
      
      const newSettings = {
        ...existingSettings,
        language: code,
      };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));

      // Sync selection with useAuthStore's user profile preferredLanguage
      if (user) {
        setUser({
          ...user,
          preferredLanguage: code,
        });
      }
    } catch (e) {
      console.error('[LanguageContext] Failed to save language selection:', e);
    }
  };

  // 3. Translation resolver with nested pathing & variable interpolation
  const t = (key: string, variables?: Record<string, string | number>): any => {
    const translations = locales[locale] || locales.en;
    
    // Resolve nested object pathing like "dashboard.speedTesting.title"
    const resolvedValue = key.split('.').reduce((acc: any, part) => {
      return acc && acc[part];
    }, translations);

    // If key not found or resolved value is missing, return fallback
    if (resolvedValue === undefined) {
      // Fallback to English dictionary just in case it's missing in regional translations
      const fallbackValue = key.split('.').reduce((acc: any, part) => {
        return acc && acc[part];
      }, locales.en);
      
      if (typeof fallbackValue === 'string') {
        return interpolate(fallbackValue, variables);
      }
      if (fallbackValue !== undefined) {
        return fallbackValue;
      }
      return key;
    }

    if (typeof resolvedValue === 'string') {
      return interpolate(resolvedValue, variables);
    }
    
    return resolvedValue;
  };

  const interpolate = (text: string, variables?: Record<string, string | number>): string => {
    if (!variables) return text;
    let interpolated = text;
    Object.entries(variables).forEach(([k, v]) => {
      interpolated = interpolated.replace(new RegExp(`{${k}}`, 'g'), String(v));
    });
    return interpolated;
  };

  return (
    <LanguageContext.Provider value={{ locale, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
