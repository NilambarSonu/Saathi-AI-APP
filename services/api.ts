import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Core API configuration
export const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://saathiai.org';
const API_ROOT = `${API_BASE}/api`;
const ASYNC_ACCESS_TOKEN_KEY = 'saathi_token';
const ASYNC_REFRESH_TOKEN_KEY = 'saathi_refresh_token';
const PENDING_SOIL_QUEUE_KEY = 'pending_soil_queue_v1';

export const SAATHI_SYSTEM_INSTRUCTION = `
You are Saathi AI — an expert agricultural intelligence system designed for Indian farmers.

CORE OBJECTIVE:
Provide accurate, actionable, and farmer-friendly recommendations based on soil data.

STRICT RULES:
- Always prioritize ORGANIC farming solutions first
- Only suggest CHEMICAL fertilizers if organic options are not available
- Use ONLY commonly available fertilizers in India (Urea, DAP, MOP, SSP, Vermicompost, FYM)
- Always give quantities in KG per ACRE
- Keep response SHORT, CLEAR, and PRACTICAL

RESPONSE STYLE:
- Use simple language (farmer-friendly)
- Use emojis for clarity
- Max 8–10 bullet points
- NO markdown, NO bold, NO special symbols like *

OUTPUT STRUCTURE:
🌱 Soil Health Status
✅ Good Things
❌ Problems
💡 Solutions (Organic first → Chemical alternative)
📅 When to apply
🎯 Expected result

SMART BEHAVIOR:
- If pH < 5.5 → suggest liming (soil acidity fix)
- If Nitrogen low → recommend compost/vermicompost first
- If moisture low → suggest irrigation strategy
- If temperature high → suggest mulching

CONTEXT AWARE:
- If user asks general question → answer normally
- If soil data exists → personalize recommendations

NEVER:
- Suggest external experts
- Give vague answers
- Use complex scientific terms
`;

async function getStoredAccessToken(): Promise<string | null> {
  const secureToken = await SecureStore.getItemAsync('saathi_access_token');
  if (secureToken) return secureToken;
  return AsyncStorage.getItem(ASYNC_ACCESS_TOKEN_KEY);
}

async function getStoredRefreshToken(): Promise<string | null> {
  const secureRefresh = await SecureStore.getItemAsync('saathi_refresh_token');
  if (secureRefresh) return secureRefresh;
  return AsyncStorage.getItem(ASYNC_REFRESH_TOKEN_KEY);
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('REQUEST_TIMEOUT')), timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

async function isInternetAvailable(): Promise<boolean> {
  try {
    const probe = await withTimeout(
      fetch(`${API_ROOT}/config`, { method: 'GET' }),
      3500
    );
    return probe.ok;
  } catch {
    return false;
  }
}

type PendingSoilPayload = {
  data: Record<string, any>;
  queuedAt: string;
};

async function getPendingSoilQueue(): Promise<PendingSoilPayload[]> {
  try {
    const raw = await AsyncStorage.getItem(PENDING_SOIL_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function setPendingSoilQueue(queue: PendingSoilPayload[]): Promise<void> {
  await AsyncStorage.setItem(PENDING_SOIL_QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Core API call function
 * Automatically attaches JWT token from secure storage
 * Automatically retries with refresh token on 401
 */
export async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getStoredAccessToken();
  
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
  await AsyncStorage.setItem(ASYNC_ACCESS_TOKEN_KEY, token);
  await AsyncStorage.setItem(ASYNC_REFRESH_TOKEN_KEY, refreshToken);
}

/**
 * Clear all auth tokens (logout)
 */
export async function clearAuthTokens(): Promise<void> {
  await SecureStore.deleteItemAsync('saathi_access_token');
  await SecureStore.deleteItemAsync('saathi_refresh_token');
  await AsyncStorage.removeItem(ASYNC_ACCESS_TOKEN_KEY);
  await AsyncStorage.removeItem(ASYNC_REFRESH_TOKEN_KEY);
}

/**
 * Attempt to refresh the access token using the refresh token
 * Returns true if successful, false otherwise
 */
async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = await getStoredRefreshToken();
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

export const api = {
  async chat(message: string, token?: string, extra?: Record<string, any>) {
    const authToken = token || (await getStoredAccessToken()) || undefined;

    const res = await fetch(`${API_ROOT}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
      body: JSON.stringify({
        message,
        systemInstruction: SAATHI_SYSTEM_INSTRUCTION,
        ...extra,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || data?.message || 'Chat request failed');
    }
    return data;
  },

  async uploadSoil(data: any, token?: string) {
    const authToken = token || (await getStoredAccessToken());
    if (!authToken) throw new Error('AUTH_REQUIRED');

    const res = await fetch(`${API_ROOT}/analyze-soil-file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.error || json?.message || 'Soil analysis failed');
    }
    return json;
  },

  async sendSoilData(soilData: Record<string, any>, token?: string) {
    const online = await isInternetAvailable();
    if (!online) {
      const queue = await getPendingSoilQueue();
      queue.push({ data: soilData, queuedAt: new Date().toISOString() });
      await setPendingSoilQueue(queue);
      return { queued: true, message: 'Saved locally. Will sync when internet is available.' };
    }

    const authToken = token || (await getStoredAccessToken());
    if (!authToken) throw new Error('AUTH_REQUIRED');

    const res = await fetch(`${API_ROOT}/soil-tests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(soilData),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.error || json?.message || 'Soil pipeline request failed');
    }
    return json;
  },

  async flushSoilQueue(token?: string) {
    const online = await isInternetAvailable();
    if (!online) return { synced: 0, pending: (await getPendingSoilQueue()).length };

    const queue = await getPendingSoilQueue();
    if (!queue.length) return { synced: 0, pending: 0 };

    let synced = 0;
    const remaining: PendingSoilPayload[] = [];
    for (const item of queue) {
      try {
        await this.sendSoilData(item.data, token);
        synced += 1;
      } catch {
        remaining.push(item);
      }
    }

    await setPendingSoilQueue(remaining);
    return { synced, pending: remaining.length };
  },

  getPendingSoilQueue,
};
