import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { User } from '../src/features/auth/services/auth';

// ─── Canonical token key ─────────────────────────────────────────────────────
// ALL reads and writes MUST use this constant — never hard-coded strings.
export const TOKEN_KEY = 'auth_token';

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),

  clearUser: () => {
    SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  setLoading: (isLoading) => set({ isLoading }),

  /**
   * Called immediately after every successful login (credentials or OAuth).
   * Writes token to SecureStore so apiCall() can read it on every request.
   */
  login: (user, token) => {
    // Persist to SecureStore (fire-and-forget; apiCall will read this on next request)
    if (token) {
      SecureStore.setItemAsync(TOKEN_KEY, token).catch((e) =>
        console.warn('[AuthStore] SecureStore.setItemAsync failed:', e)
      );
      console.log('[AuthStore] TOKEN saved to SecureStore:', TOKEN_KEY, '→', token.slice(0, 20) + '…');
    }
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },
}));
