/**
 * tokenCache — tiny in-memory singleton shared by axiosConfig and authStore.
 *
 * Why this exists:
 *   axiosConfig needs the JWT on every request (synchronously / before AsyncStorage
 *   is read). authStore is the source of truth for the token. But importing authStore
 *   into axiosConfig would create a circular dependency:
 *
 *       authStore → auth.ts → axiosConfig → authStore  ← CIRCULAR
 *
 *   This module sits "below" both of them so neither creates a cycle.
 *
 * Lifecycle:
 *   1. App cold-start  → authStore `onRehydrateStorage` warms the cache from the
 *                         Zustand persisted blob (no AsyncStorage race condition).
 *   2. Login/register  → authStore.setAuth() calls tokenCache.set().
 *   3. Every request   → axiosConfig reads tokenCache.getToken() synchronously.
 *   4. Refresh OK      → axiosConfig calls tokenCache.set() with new tokens.
 *   5. Refresh FAIL    → axiosConfig calls tokenCache.clear() + triggerAuthFailure().
 *   6. Logout          → authStore calls tokenCache.clear().
 */

type AuthFailureHandler = () => void;

let _token: string | null = null;
let _refreshToken: string | null = null;
let _onAuthFailure: AuthFailureHandler | null = null;

export const tokenCache = {
  /** Current access token — synchronous, no I/O. */
  getToken: (): string | null => _token,

  /** Current refresh token — synchronous, no I/O. */
  getRefreshToken: (): string | null => _refreshToken,

  /**
   * Set (or clear) tokens.
   * @param token        Access token, or null to clear.
   * @param refreshToken Refresh token; defaults to current value if omitted.
   */
  set: (token: string | null, refreshToken: string | null = _refreshToken): void => {
    _token = token;
    _refreshToken = refreshToken;
  },

  /** Clear both tokens (logout or auth failure). */
  clear: (): void => {
    _token = null;
    _refreshToken = null;
  },

  /**
   * Register a callback that axiosConfig invokes when a 401 cannot be
   * recovered (refresh also failed). Use this to update the Zustand store
   * from _layout.tsx without importing authStore into axiosConfig.
   */
  onAuthFailure: (handler: AuthFailureHandler): void => {
    _onAuthFailure = handler;
  },

  /** Called by axiosConfig when auth fails unrecoverably. */
  triggerAuthFailure: (): void => {
    _onAuthFailure?.();
  },
};
