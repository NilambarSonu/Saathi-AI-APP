import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export const API_BASE = "https://saathiai.org/api";
export const API_HOST = "https://saathiai.org"; 
export const API_ROOT = API_BASE;

export async function getStoredAccessToken(): Promise<string | null> {
  const secureToken = await SecureStore.getItemAsync('saathi_access_token');
  if (secureToken) return secureToken;
  return AsyncStorage.getItem('saathi_access_token');
}

export async function getStoredRefreshToken(): Promise<string | null> {
  const secureRefresh = await SecureStore.getItemAsync('saathi_refresh_token');
  if (secureRefresh) return secureRefresh;
  return AsyncStorage.getItem('saathi_refresh_token');
}

export async function saveAuthTokens(token: string, refreshToken?: string): Promise<void> {
  if (typeof token !== 'string' || token.trim().length === 0) {
    throw new Error('INVALID_AUTH_TOKEN');
  }

  await SecureStore.setItemAsync('saathi_access_token', token);
  await AsyncStorage.setItem('saathi_access_token', token);

  if (refreshToken) {
    if (typeof refreshToken !== 'string') {
      throw new Error('INVALID_REFRESH_TOKEN');
    }
    await SecureStore.setItemAsync('saathi_refresh_token', refreshToken);
    await AsyncStorage.setItem('saathi_refresh_token', refreshToken);
  }
}

export async function clearAuthTokens(): Promise<void> {
  await SecureStore.deleteItemAsync('saathi_access_token');
  await SecureStore.deleteItemAsync('saathi_refresh_token');
  await AsyncStorage.removeItem('saathi_access_token');
  await AsyncStorage.removeItem('saathi_refresh_token');
}

export async function apiCall<T = any>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const token = await getStoredAccessToken();
  
  const endpointPath = endpoint.startsWith('/api') ? endpoint.replace('/api', '') : (endpoint.startsWith('/') ? endpoint : `/${endpoint}`);

  const response = await fetch(`${API_BASE}${endpointPath}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers as Record<string, string> || {})
    }
  });

  const contentType = (response.headers.get('content-type') || '').toLowerCase();
  
  if (!response.ok) {
     let errorMessage = `HTTP Error ${response.status}`;
     if (contentType.includes('application/json')) {
        try {
           const errPayload = await response.json();
           errorMessage = errPayload.error || errPayload.message || errPayload.details || errorMessage;
        } catch {}
     } else {
        try {
           const errText = await response.text();
           errorMessage = errText || errorMessage;
        } catch {}
     }
     throw new Error(errorMessage);
  }
  
  if (!contentType.includes('application/json')) {
    return {} as T;
  }

  return response.json();
}

export async function fetchSoilHistory<T = any[]>(userId: string): Promise<T> {
  const normalizedUserId = typeof userId === 'string' ? userId.trim() : '';
  if (!normalizedUserId) return [] as T;

  try {
    const payload = await apiCall(`/soil-tests/${encodeURIComponent(normalizedUserId)}`);
    return payload as T;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch soil tests');
  }
}

export async function isInternetAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/health`, { method: 'GET' });
    return response.ok !== false;
  } catch {
    return false;
  }
}

// ─── Offline Queue Syncing ───────────────────────────────────────────────────
type PendingSoilPayload = { data: Record<string, any>; queuedAt: string };
const PENDING_SOIL_QUEUE_KEY = 'pending_soil_queue_v2';

export async function getPendingSoilQueue(): Promise<PendingSoilPayload[]> {
  try {
    const raw = await AsyncStorage.getItem(PENDING_SOIL_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

async function setPendingSoilQueue(queue: PendingSoilPayload[]): Promise<void> {
  await AsyncStorage.setItem(PENDING_SOIL_QUEUE_KEY, JSON.stringify(queue));
}

export const api = {
  chat: async (message: string): Promise<{ response: string }> => {
    return apiCall<{ response: string }>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  uploadSoil: async (data: any): Promise<any> => {
    return apiCall('/analyze-soil-file', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  soilTests: async (soilData: Record<string, any>): Promise<{ recommendations: any[], pricing?: any, queued?: boolean }> => {
    const isOnline = await isInternetAvailable();
    if (!isOnline) {
      const queue = await getPendingSoilQueue();
      queue.push({ data: soilData, queuedAt: new Date().toISOString() });
      await setPendingSoilQueue(queue);
      return { recommendations: [], queued: true };
    }

    return apiCall<{ recommendations: any[], pricing?: any }>('/soil-tests', {
      method: 'POST',
      body: JSON.stringify(soilData),
    });
  },

  flushSoilQueue: async (): Promise<{ synced: number, pending: number }> => {
    const queue = await getPendingSoilQueue();
    if (!queue.length || !(await isInternetAvailable())) {
      return { synced: 0, pending: queue.length };
    }

    let synced = 0;
    const remaining: PendingSoilPayload[] = [];
    
    for (const item of queue) {
      try {
        await apiCall('/soil-tests', { method: 'POST', body: JSON.stringify(item.data) });
        synced++;
      } catch (err) {
        remaining.push(item);
      }
    }

    await setPendingSoilQueue(remaining);
    return { synced, pending: remaining.length };
  }
};
