import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export const BASE_URL = 'https://saathiai.org';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token automatically to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('saathi_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Tell server this is a mobile client
  config.headers['x-client-type'] = 'mobile';
  return config;
});

// Auto-refresh on 401/403
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('saathi_refresh_token');
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken });
        await AsyncStorage.setItem('saathi_token', data.token);
        await AsyncStorage.setItem('saathi_refresh_token', data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return api(originalRequest);
      } catch {
        await AsyncStorage.multiRemove(['saathi_token', 'saathi_refresh_token', 'saathi_user']);
        router.replace('/(auth)/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
