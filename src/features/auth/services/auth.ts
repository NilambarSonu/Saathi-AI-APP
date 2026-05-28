import api, { BASE_URL } from '@/api/axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';


// ─────────────── USER TYPE ───────────────
export interface User {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  location: string | null;
  profile_picture: string | null;
  preferred_language: string;
  provider: string;
  created_at: string;
  name?: string;       // optional compat alias
  avatar_url?: string; // optional compat alias
}

// ─────────────── HELPER: PHONE NORMALIZATION ───────────────
export function parseContact(contact: string, provider: 'EMAIL' | 'TEXTBEE') {
  if (provider === 'EMAIL') {
    return { email: contact.toLowerCase().trim() };
  } else {
    let cleanPhone = contact.replace(/\D/g, '');
    let countryCode = '+91';
    if (cleanPhone.length > 10) {
      if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
        countryCode = '+91';
        cleanPhone = cleanPhone.slice(2);
      }
    }
    return { phone: cleanPhone, countryCode };
  }
}

// ─────────────── REGISTER FLOW ───────────────
export async function register(data: {
  username: string;
  contact: string;
  provider: 'EMAIL' | 'TEXTBEE';
  password: string;
}) {
  const contactPayload = parseContact(data.contact, data.provider);
  
  // Inject a dummy email for phone registrations to satisfy backend validation
  const payload: any = {
    username: data.username.toLowerCase().trim().replace(/\s+/g, '_'),
    password: data.password,
    ...contactPayload,
    client: 'mobile',
  };

  if (data.provider === 'TEXTBEE' && !payload.email) {
    payload.email = `${contactPayload.phone}@phone.saathiai.org`;
  }

  const response = await api.post('/auth/register', payload);
  return response.data;
}

// Alias for old code
export async function registerAccount(data: {
  name?: string;
  username?: string;
  email: string;
  phone?: string;
  password: string;
}) {
  const isPhone = !!data.phone;
  return register({
    username: data.username || data.name || '',
    contact: isPhone ? data.phone! : data.email,
    provider: isPhone ? 'TEXTBEE' : 'EMAIL',
    password: data.password,
  });
}

// ─────────────── SEND OTP ───────────────
export async function sendOtp(contact: string, provider: 'EMAIL' | 'TEXTBEE', purpose: 'register' | 'login') {
  const contactPayload = parseContact(contact, provider);
  const response = await api.post('/auth/send-otp', {
    ...contactPayload,
    purpose,
    provider,
  });
  return response.data;
}

// Alias used by verify-otp.tsx (resend)
export async function resendOTP(contact: string, provider: 'EMAIL' | 'TEXTBEE' = 'EMAIL') {
  return sendOtp(contact, provider, 'register');
}

// ─────────────── VERIFY OTP (Mobile) ───────────────
export async function verifyOtp(otp: string, contact: string, provider: 'EMAIL' | 'TEXTBEE') {
  const contactPayload = parseContact(contact, provider);
  const response = await api.post('/auth/verify-otp', {
    otp,
    ...contactPayload,
    provider,
    client: 'mobile',
  });
  return response.data;
}

// Alias for old code
export async function verifyOTP(contact: string, otp: string, provider: 'EMAIL' | 'TEXTBEE' = 'EMAIL') {
  return verifyOtp(otp, contact, provider);
}

// ─────────────── LOGIN ───────────────
export async function login(usernameOrEmail: string, password: string) {
  const response = await api.post('/auth/login', {
    usernameOrEmail: usernameOrEmail.toLowerCase().trim(),
    password,
    client: 'mobile',
  });
  return response.data;
}

// Alias used by login.tsx
export async function loginWithCredentials(usernameOrEmail: string, password: string) {
  return login(usernameOrEmail, password);
}

// ─────────────── CHECK AUTH STATUS (used by _layout.tsx) ───────────────
export async function checkAuthStatus(): Promise<User | null> {
  try {
    const token = await AsyncStorage.getItem('saathi_token');
    if (!token) return null;
    const response = await api.get('/user');
    return response.data.user as User;
  } catch {
    return null;
  }
}

// ─────────────── SAVE SESSION ───────────────
export async function saveSession(data: {
  token: string;
  refreshToken: string | null;
  user: object;
}) {
  await AsyncStorage.setItem('saathi_token', data.token);
  if (data.refreshToken) {
    await AsyncStorage.setItem('saathi_refresh_token', data.refreshToken);
  }
  await AsyncStorage.setItem('saathi_user', JSON.stringify(data.user));
}

// ─────────────── LOGOUT ───────────────
export async function logout() {
  await AsyncStorage.multiRemove([
    'saathi_token',
    'saathi_refresh_token',
    'saathi_user',
    'saathi_auth_token',
    'saathi_access_token',  // legacy key compat
  ]);
}

// ─────────────── GET CURRENT USER ───────────────
export async function getUser(): Promise<User> {
  const response = await api.get('/user');
  return response.data.user;
}

// ─────────────── FORGOT PASSWORD ───────────────
export async function forgotPassword(contact: string, provider: 'EMAIL' | 'TEXTBEE') {
  const contactPayload = parseContact(contact, provider);
  const response = await api.post('/auth/forgot-password', {
    ...contactPayload,
    provider,
  });
  return response.data;
}

export async function resetPassword(
  contact: string,
  provider: 'EMAIL' | 'TEXTBEE',
  otp: string,
  newPassword: string,
  confirmPassword: string
) {
  const contactPayload = parseContact(contact, provider);
  const response = await api.post('/auth/reset-password', {
    ...contactPayload,
    otp,
    newPassword,
    confirmPassword,
    client: 'mobile',
  });
  return response.data;
}

// ─────────────── CHANGE PASSWORD (LOGGED IN USER) ───────────────
export async function sendPasswordChangeOtp() {
  const response = await api.post('/auth/send-password-change-otp');
  return response.data;
}

export async function changePassword(otpId: string, otp: string, newPassword: string) {
  const response = await api.post('/auth/change-password', {
    otpId,
    otp,
    newPassword,
    client: 'mobile',
  });
  return response.data;
}

// ─────────────── SOCIAL LOGIN (Google / Facebook / X) ───────────────
async function socialLogin(provider: 'google' | 'facebook' | 'x') {
  const redirectUri = Linking.createURL('auth'); // → "saathiai://auth"
  const authUrl = `${BASE_URL}/api/auth/${provider}?redirect_uri=${encodeURIComponent(redirectUri)}`;

  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

  if (result.type === 'success' && result.url) {
    const url = new URL(result.url);
    const token = url.searchParams.get('token');
    const userId = url.searchParams.get('userId');

    if (token && userId) {
      // Store token first so the interceptor can attach it
      await AsyncStorage.setItem('saathi_token', token);

      // Fetch user profile with the token
      const userResponse = await api.get('/user');
      return {
        success: true,
        token,
        refreshToken: null as string | null,
        user: userResponse.data.user as User,
      };
    }
  }
  throw new Error('Social login was cancelled or failed.');
}

export const loginWithGoogle = () => socialLogin('google');
export const loginWithFacebook = () => socialLogin('facebook');
export const loginWithX = () => socialLogin('x');

// Unified alias used by login.tsx and register.tsx
export async function startSocialAuth(provider: 'google' | 'facebook' | 'x') {
  return socialLogin(provider);
}

// ─────────────── DEVICE REGISTRATION ───────────────
export async function registerDevice(params: {
  expo_push_token: string;
  device_type: 'ios' | 'android';
  device_name?: string;
}) {
  await api.post('/users/device', params);
}
