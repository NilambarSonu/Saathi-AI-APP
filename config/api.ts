import * as SecureStore from 'expo-secure-store';

export const API_BASE = "https://saathiai.org/api";

// ─── Canonical token key — must match store/authStore.ts TOKEN_KEY ────────────
const TOKEN_KEY = 'saathi_access_token';

export function buildUrl(endpoint: string): string {
  if (endpoint.startsWith('/api')) return `https://saathiai.org${endpoint}`;
  return `${API_BASE}${endpoint}`;
}

/**
 * Authenticated fetch wrapper used by legacy callers that still import from config/api.
 * Always attaches Authorization: Bearer <token> from SecureStore.
 */
export const safeFetch = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    // Read token from SecureStore (canonical key)
    const token = await SecureStore.getItemAsync(TOKEN_KEY);

    // DEBUG: confirm token on every call
    console.log(`[safeFetch] ${(options.method || 'GET')} ${endpoint} | TOKEN:`, token ? token.slice(0, 20) + '…' : 'MISSING ⚠️');

    const res = await fetch(buildUrl(endpoint), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(options.headers as Record<string, string> || {}),
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const contentType = res.headers.get('content-type') || '';
      let errorMessage = `HTTP ${res.status}`;
      try {
        if (contentType.includes('application/json')) {
          const err = await res.json();
          errorMessage = err?.error || err?.message || errorMessage;
        } else {
          errorMessage = (await res.text()) || errorMessage;
        }
      } catch {}
      throw new Error(errorMessage);
    }

    return await res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn('[safeFetch] ERROR:', error);
    return null;
  }
};
