import * as SecureStore from 'expo-secure-store';

// Core API configuration
export const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://saathiai.org';

/**
 * Core API call function
 * Automatically attaches JWT token from secure storage
 * Automatically retries with refresh token on 401
 */
export async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await SecureStore.getItemAsync('saathi_access_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-client-type': 'mobile',           // tells backend this is the app
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // Token expired — try refresh
  if (response.status === 401 && token) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      // Retry original request with new token
      const newToken = await SecureStore.getItemAsync('saathi_access_token');
      const retryResponse = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          Authorization: `Bearer ${newToken}`,
        },
      });
      if (!retryResponse.ok) {
        throw new Error(await retryResponse.text());
      }
      return retryResponse.json();
    } else {
      // Refresh also failed — user must log in again
      await clearAuthTokens();
      throw new Error('SESSION_EXPIRED');
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage: string;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error || errorJson.message || 'Request failed';
    } catch {
      errorMessage = errorText || `HTTP ${response.status}`;
    }
    throw new Error(errorMessage);
  }

  // Handle empty responses (204 No Content etc.)
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return {} as T;
  }

  return response.json();
}

/**
 * Save auth tokens securely after login/register
 */
export async function saveAuthTokens(token: string, refreshToken: string): Promise<void> {
  await SecureStore.setItemAsync('saathi_access_token', token);
  await SecureStore.setItemAsync('saathi_refresh_token', refreshToken);
}

/**
 * Clear all auth tokens (logout)
 */
export async function clearAuthTokens(): Promise<void> {
  await SecureStore.deleteItemAsync('saathi_access_token');
  await SecureStore.deleteItemAsync('saathi_refresh_token');
}

/**
 * Attempt to refresh the access token using the refresh token
 * Returns true if successful, false otherwise
 */
async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = await SecureStore.getItemAsync('saathi_refresh_token');
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    if (data.token && data.refreshToken) {
      await saveAuthTokens(data.token, data.refreshToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
