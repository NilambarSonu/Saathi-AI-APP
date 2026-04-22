import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { tokenCache } from '@/utils/tokenCache';

export const BASE_URL = 'https://saathiai.org';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── REQUEST INTERCEPTOR ─────────────────────────────────────────────────────
// Priority order for the access token:
//  1. In-memory tokenCache  (fastest — set by authStore on login/rehydration)
//  2. AsyncStorage 'saathi_token'  (direct key written by setAuth())
//  3. Zustand persisted blob 'saathi-auth'  (cold-start, first request only)
api.interceptors.request.use(async (config) => {
  let token = tokenCache.getToken();

  if (!token) {
    // Attempt 2 — direct AsyncStorage key
    token = await AsyncStorage.getItem('saathi_token');

    if (token) {
      // Warm the cache so subsequent requests skip AsyncStorage
      const refresh = await AsyncStorage.getItem('saathi_refresh_token');
      tokenCache.set(token, refresh);
      console.log('[API] Token loaded from AsyncStorage direct key');
    } else {
      // Attempt 3 — Zustand persisted blob (onRehydrateStorage not yet called)
      try {
        const blob = await AsyncStorage.getItem('saathi-auth');
        if (blob) {
          const parsed = JSON.parse(blob);
          const t: string | null = parsed?.state?.token ?? null;
          const r: string | null = parsed?.state?.refreshToken ?? null;
          tokenCache.set(t, r);
          token = t;
          // Sync the direct keys so next request hits path 2
          if (t) await AsyncStorage.setItem('saathi_token', t);
          if (r) await AsyncStorage.setItem('saathi_refresh_token', r);
          if (t) {
            console.log('[API] Token loaded from Zustand persisted blob');
          }
        }
      } catch (err) {
        console.warn('[API] Failed to parse Zustand blob:', err);
      }
    }
  } else {
    console.log('[API] Token from in-memory cache');
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('[API] Authorization header attached');
  } else {
    console.warn('[API] ⚠️ NO TOKEN FOUND - Request will be sent without Authorization header');
  }
  
  config.headers['x-client-type'] = 'mobile';
  return config;
});

// ── RESPONSE INTERCEPTOR ────────────────────────────────────────────────────
// Auto-refresh on 401.  If the refresh itself fails, clear everything and
// redirect to login via tokenCache.triggerAuthFailure() (registered in _layout.tsx).
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const endpoint = originalRequest?.url || 'unknown';
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn(`[API] 401 Unauthorized on ${endpoint} - Attempting refresh`);
      originalRequest._retry = true;
      try {
        const refreshToken =
          tokenCache.getRefreshToken() ??
          (await AsyncStorage.getItem('saathi_refresh_token'));

        if (!refreshToken) {
          console.error('[API] No refresh token available');
          throw new Error('No refresh token');
        }

        console.log('[API] Calling /auth/refresh');
        const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, {
          refreshToken,
        });

        const newToken: string = data.token;
        const newRefresh: string = data.refreshToken ?? refreshToken;

        // Update in-memory cache first, then AsyncStorage
        tokenCache.set(newToken, newRefresh);
        await AsyncStorage.setItem('saathi_token', newToken);
        await AsyncStorage.setItem('saathi_refresh_token', newRefresh);
        console.log('[API] Token refreshed successfully');

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('[API] Token refresh failed:', refreshError);
        // Refresh failed — wipe everything and force re-login
        tokenCache.clear();
        await AsyncStorage.multiRemove([
          'saathi_token',
          'saathi_refresh_token',
          'saathi_user',
        ]);
        // Notify _layout.tsx to clear the Zustand store (avoids circular import)
        tokenCache.triggerAuthFailure();
        console.log('[API] Auth failed - redirecting to login');
        router.replace('/(auth)/login');
      }
    } else if (error.response?.status === 401) {
      console.error(`[API] 401 Unauthorized on ${endpoint} - Already retried, rejecting`);
    }
    return Promise.reject(error);
  }
);

export default api;
