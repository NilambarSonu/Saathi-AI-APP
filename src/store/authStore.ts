/**
 * authStore.ts — Paste this into your APK project at: store/authStore.ts
 *
 * KEY FIXES vs old version:
 *  1. TOKEN_KEY = 'saathi_auth_token' — must match axiosConfig.ts
 *  2. Guards against saving undefined tokens (checks res.ok first)
 *  3. Correct error messages shown to the user
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tokenCache } from '@/utils/tokenCache';
import { saveAuthTokens, clearAuthTokens, getStoredAccessToken } from '@/services/api';
import apiClient, { invalidateCache } from '@/api/axiosConfig';

const API_BASE_URL = 'https://www.saathiai.org';
const TOKEN_KEY   = 'saathi_auth_token';   // ← matches axiosConfig.ts TOKEN_KEY
const REFRESH_KEY = 'saathi_refresh_token';
const USER_CACHE_KEY = 'saathi_user_cache'; // ← persists user profile locally

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  location: string | null;
  provider: string;
  profilePicture: string | null;
  preferredLanguage: string;
  createdAt: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  loginWithOAuth: (provider: 'google' | 'facebook' | 'x') => Promise<void>;
  handleOAuthCallback: (url: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setSession: (user: any, token: string, refreshToken?: string | null) => Promise<void>;
  /** Merge/update the in-memory user object without affecting auth tokens */
  setUser: (user: AuthUser | null) => void;
  /** Clear user state (alias for a soft client-side logout) */
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Listen for unrecoverable 401s from the API to auto-logout
  tokenCache.onAuthFailure(() => {
    if (__DEV__) console.log('[AuthStore] Auto-logout triggered by API 401');
    get().logout();
  });

  return {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  // ─── Restore session on app start ───────────────────────────────────────────
  initialize: async () => {
    set({ isLoading: true });
    try {
      const token = await getStoredAccessToken();
      if (!token) {
        set({ isInitialized: true, isLoading: false });
        if (__DEV__) console.log('[AuthStore] Rehydrated - no token found');
        return;
      }

      // Warm up tokenCache with access and refresh tokens so axiosConfig is ready
      const refreshToken = await AsyncStorage.getItem(REFRESH_KEY);
      tokenCache.set(token, refreshToken);

      // Load locally-cached user profile first (instant, no network)
      let localUser: AuthUser | null = null;
      try {
        const cached = await AsyncStorage.getItem(USER_CACHE_KEY);
        if (cached) localUser = JSON.parse(cached);
      } catch { /* ignore */ }

      // ✅ True Offline-Safe Rehydration: Always restore session optimistically if a token is recovered from disk!
      // If the cached user profile is missing or corrupted, load a safe template profile instead of forcing logout.
      const restoredUser: AuthUser = localUser || {
        id: '',
        username: 'Farmer',
        email: '',
        phone: null,
        location: null,
        provider: 'local',
        profilePicture: null,
        preferredLanguage: 'en',
        createdAt: '',
      };

      set({ token, user: restoredUser, isAuthenticated: true, isInitialized: true, isLoading: false });
      if (__DEV__) console.log('[AuthStore] Restored session optimistically for', restoredUser.username);

      // Silent background network verification
      (async () => {
        try {
          const response = await apiClient.get('/user');
          const data = response.data;
          const currentToken = await getStoredAccessToken() || token;
          const currentRefreshToken = await AsyncStorage.getItem(REFRESH_KEY) || refreshToken;
          tokenCache.set(currentToken, currentRefreshToken);

          const serverUser = mapUser(data.user ?? data);
          const mergedUser: AuthUser = {
            ...serverUser,
            username: serverUser.username || restoredUser.username || '',
            location: serverUser.location || restoredUser.location || null,
            profilePicture: serverUser.profilePicture || restoredUser.profilePicture || null,
          };
          set({ user: mergedUser });
          await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(mergedUser)).catch(() => {});
          if (__DEV__) console.log('[AuthStore] Background session verification completed successfully');
        } catch (err: any) {
          const status = err.response?.status;
          if (status === 401 || status === 403) {
            if (__DEV__) console.warn('[AuthStore] Background session check invalid - logging out');
            await clearAuthTokens();
            tokenCache.clear();
            await AsyncStorage.removeItem(USER_CACHE_KEY).catch(() => {});
            set({ token: null, user: null, isAuthenticated: false });
          }
        }
      })();
      return;
    } catch (e) {
      set({ isInitialized: true, isLoading: false, isAuthenticated: false });
      if (__DEV__) console.log('[AuthStore] Unexpected error during init', e);
    }
  },

  // ─── Email / password login ──────────────────────────────────────────────────
  login: async (usernameOrEmail, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-type': 'mobile',
        },
        body: JSON.stringify({ 
          usernameOrEmail: usernameOrEmail.toLowerCase().trim(),
          password, 
          client: 'mobile' 
        }),
      });

      const data = await res.json();

      // ✅ Always check res.ok BEFORE reading data.token
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Login failed. Please check your credentials.');
      }

      if (!data.token) {
        throw new Error('Server did not return an access token. Please try again.');
      }

      const mappedUser = mapUser(data.user);

      // ✅ Fire and forget persistence! Don't block the UI thread waiting for SecureStore
      Promise.all([
        saveAuthTokens(data.token, data.refreshToken || undefined),
        AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(mappedUser))
      ]).catch(e => {
        if (__DEV__) console.error('[Storage] login persistence failed:', e);
      });

      tokenCache.set(data.token, data.refreshToken);
      invalidateCache();

      if (__DEV__) console.log('[AuthStore] Login successful for', data.user?.username);

      set({
        token: data.token,
        user: mappedUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  // ─── Social OAuth ─────────────────────────────────────────────────────────────
  loginWithOAuth: async (provider) => {
    const { Linking } = await import('react-native');
    const path = provider === 'x' ? 'x' : provider;
    const url = `${API_BASE_URL}/api/auth/${path}?redirect_uri=${encodeURIComponent('saathiai://oauth-callback')}`;
    await Linking.openURL(url);
  },

  // ─── Handle deep link after OAuth ─────────────────────────────────────────────
  handleOAuthCallback: async (url: string) => {
    if (!url.includes('oauth-callback')) return;

    set({ isLoading: true, error: null });
    try {
      const queryStart = url.indexOf('?');
      if (queryStart === -1) throw new Error('Invalid OAuth callback URL');
      const params = new URLSearchParams(url.slice(queryStart + 1));

      const token = params.get('token');
      const userId = params.get('userId');

      if (!token || !userId) throw new Error('Missing token or userId in OAuth callback');

      await saveAuthTokens(token);
      tokenCache.set(token);

      const response = await apiClient.get('/user', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = response.data;
      const user = data.user ?? data;
      set({ token, user: mapUser(user), isAuthenticated: true, isLoading: false, error: null });
      if (__DEV__) console.log('[AuthStore] OAuth login successful for', user?.username);
    } catch (err: any) {
      await clearAuthTokens();
      tokenCache.clear();
      set({ isLoading: false, error: `Social login failed: ${err.message}`, user: null, token: null, isAuthenticated: false });
    }
  },

  // ─── Logout ──────────────────────────────────────────────────────────────────
  logout: async () => {
    await clearAuthTokens();
    tokenCache.clear();
    await AsyncStorage.removeItem(USER_CACHE_KEY).catch(() => {});
    set({ user: null, token: null, isAuthenticated: false, error: null });
    if (__DEV__) console.log('[AuthStore] Logged out');
  },

  clearError: () => set({ error: null }),

  setSession: async (user, token, refreshToken) => {
    const mappedUser = mapUser(user);
    // ✅ Fire and forget
    Promise.all([
      saveAuthTokens(token, refreshToken || undefined),
      AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(mappedUser))
    ]).catch(e => {
      if (__DEV__) console.error('[AuthStore] setSession storage failed:', e);
    });
    tokenCache.set(token, refreshToken || null);
    set({ token, user: mappedUser, isAuthenticated: true, isInitialized: true, isLoading: false, error: null });
  },

  setUser: (user) => {
    set({ user });
    // Persist locally so name/location survive app restart
    if (user) {
      AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(user)).catch(() => {});
    }
  },

  clearUser: () => {
    AsyncStorage.removeItem(USER_CACHE_KEY).catch(() => {});
    set({ user: null, token: null, isAuthenticated: false });
  },
};
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function mapUser(raw: any): AuthUser {
  return {
    id: raw.id,
    username: raw.username,
    email: raw.email,
    phone: raw.phone ?? null,
    location: raw.location ?? null,
    provider: raw.provider ?? 'local',
    profilePicture: raw.profilePicture ?? raw.profile_picture ?? null,
    preferredLanguage: raw.preferredLanguage ?? raw.preferred_language ?? 'en',
    createdAt: raw.createdAt ?? raw.created_at ?? '',
  };
}
