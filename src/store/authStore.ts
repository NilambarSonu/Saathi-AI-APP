import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout as authLogout, User } from '@/features/auth/services/auth';
import { tokenCache } from '@/utils/tokenCache';

// ─────────── Key names used by axiosConfig interceptors ───────────
export const TOKEN_KEY = 'saathi_token';
export const REFRESH_TOKEN_KEY = 'saathi_refresh_token';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Called after login / OTP verify / social auth
  setAuth: (token: string, refreshToken: string | null, user: User) => Promise<void>;

  // Called from _layout.tsx initialisation path
  setUser: (user: User) => void;

  // Partial update (e.g. profile edit)
  updateUser: (fields: Partial<User>) => void;

  setLoading: (loading: boolean) => void;

  // Legacy alias kept for login.tsx / register.tsx
  login: (user: User, token: string, refreshToken?: string | null) => Promise<void>;

  // Clear local user state only
  clearUser: () => void;

  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      // ─── Primary setter used after any successful auth ───
      setAuth: async (token, refreshToken, user) => {
        // 1. Warm the in-memory cache immediately (axiosConfig reads this on
        //    the next request without any AsyncStorage round-trip)
        tokenCache.set(token, refreshToken);

        // 2. Persist to AsyncStorage so the interceptor can bootstrap on cold
        //    start before Zustand has rehydrated
        await AsyncStorage.setItem(TOKEN_KEY, token);
        if (refreshToken) {
          await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        }
        await AsyncStorage.setItem('saathi_user', JSON.stringify(user));

        set({ token, refreshToken, user, isAuthenticated: true, isLoading: false });
      },

      // ─── Used by _layout.tsx when restoring session from token ───
      setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),

      // ─── Legacy login alias (login.tsx / register.tsx call login(user, token)) ───
      login: async (user, token, refreshToken = null) => {
        return get().setAuth(token, refreshToken, user);
      },

      updateUser: (fields) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...fields } : null,
        })),

      setLoading: (isLoading) => set({ isLoading }),

      clearUser: () => {
        tokenCache.clear();
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isLoading: false });
      },

      logout: async () => {
        tokenCache.clear();
        try {
          await authLogout(); // clears AsyncStorage keys
        } catch {
          // ignore network errors on logout
        }
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isLoading: false });
      },
    }),
    {
      name: 'saathi-auth',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist these fields; isLoading is runtime-only
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      // ── KEY FIX: warm the tokenCache the moment Zustand rehydrates from
      // AsyncStorage on cold start.  Without this, the first API request fires
      // before setAuth() is called and finds an empty cache → 401.
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          console.log('[AuthStore] Rehydrated - warming tokenCache');
          tokenCache.set(state.token, state.refreshToken ?? null);
          // Also ensure the direct AsyncStorage keys are synced
          AsyncStorage.setItem(TOKEN_KEY, state.token).catch(() => {});
          if (state.refreshToken) {
            AsyncStorage.setItem(REFRESH_TOKEN_KEY, state.refreshToken).catch(() => {});
          }
        } else {
          console.log('[AuthStore] Rehydrated - no token found');
        }
      },
    }
  )
);
