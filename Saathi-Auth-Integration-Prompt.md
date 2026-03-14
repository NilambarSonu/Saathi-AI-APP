# SAATHI AI — DUAL AUTH INTEGRATION PROMPT
### For Antigravity IDE (Stitch MCP) · Mitti-AI Innovations
**Task:** Connect the native Saathi AI app to the existing saathiai.org backend + Neon DB  
**Scope:** Two codebases must be modified — read every section carefully before touching any file

---

## CONTEXT — READ THIS FIRST

There are **two separate codebases** involved in this task:

| Codebase | Repo | Purpose |
|---|---|---|
| **Codebase A** | `saathiai.org` (existing live website) | Backend API + Web frontend |
| **Codebase B** | `NilambarSonu/saathi-native` (app being built) | React Native mobile app |

The goal: **One Neon PostgreSQL database, shared by both web and app.** A farmer who registered on saathiai.org logs into the native app using the same email and password — no new account needed.

**The database schema is already complete.** The `user_devices` table has been added to Neon. Do NOT run any SQL or touch the database. All work is code-only.

**Architecture after this task:**
```
saathiai.org web browser  ──┐
                             ├──→ saathiai.org API  ──→ Neon DB (PostgreSQL)
Saathi AI native app      ──┘     (same endpoints)      (single source of truth)
```

The native app never connects to Neon directly. It calls the same saathiai.org API endpoints that the web uses, but authenticates using JWT Bearer tokens instead of session cookies.

---

## PART 1 — CHANGES TO CODEBASE A (saathiai.org)

**These changes make the existing backend support both web sessions AND mobile JWT tokens simultaneously. The web functionality must not break at all.**

### STEP 1.1 — Install JWT dependency

In the `saathiai.org` project root, run:

```bash
npm install jsonwebtoken
npm install --save-dev @types/jsonwebtoken
```

### STEP 1.2 — Add environment variables

Open `.env` (or `.env.local`) on the saathiai.org project. Add these three lines at the end. Do NOT remove any existing variables:

```env
# JWT Authentication for native mobile app
JWT_SECRET=saathi_jwt_secret_mitti_ai_2026_prod_key_change_this
JWT_REFRESH_SECRET=saathi_refresh_secret_mitti_ai_2026_prod_key_change_this
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
```

**Important:** If saathiai.org is deployed on Railway, Vercel, or any cloud platform — add these same four variables to the platform's environment variables dashboard too. The app will return 500 errors if JWT_SECRET is undefined at runtime.

### STEP 1.3 — Create the JWT utility file

Create a new file at this exact path in the saathiai.org project:

**File:** `server/lib/jwt.ts` (or `lib/jwt.ts` if no server/ folder — match where other utilities live)

```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be set in environment variables');
}

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate access token (7 day expiry for mobile app)
 */
export function generateAccessToken(user: {
  id: string;
  email: string;
  username: string;
}): string {
  return jwt.sign(
    { userId: user.id, email: user.email, username: user.username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
  );
}

/**
 * Generate refresh token (30 day expiry)
 */
export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    { userId },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions
  );
}

/**
 * Verify access token — returns payload or null
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Verify refresh token — returns payload or null
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload;
  } catch {
    return null;
  }
}
```

### STEP 1.4 — Update the authentication middleware

**Find the existing auth middleware file.** It is likely named one of:
- `server/middleware/auth.ts`
- `middleware/auth.ts`
- `server/auth.ts`
- `lib/auth.ts`
- Inside `server/routes.ts` as an inline function

**Look for the function that checks `req.session.userId` or `req.isAuthenticated()` before protected routes.** That is the function to modify.

**Do NOT delete the existing session logic.** Add JWT support ABOVE it as a first check. The final middleware must support both methods:

```typescript
import { verifyAccessToken } from './lib/jwt'; // adjust path to match where you created jwt.ts
import { db } from '../db'; // adjust to your actual db import
import { users } from '../db/schema'; // adjust to your actual schema import
import { eq } from 'drizzle-orm';

/**
 * Dual auth middleware — supports both:
 * 1. JWT Bearer token (native mobile app)
 * 2. Session cookie (web browser) — unchanged from before
 */
export async function requireAuth(req: any, res: any, next: any) {
  // ── METHOD 1: JWT Bearer Token (mobile app) ──
  const authHeader = req.headers['authorization'] as string | undefined;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const payload = verifyAccessToken(token);
    
    if (!payload) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    try {
      const userRows = await db
        .select()
        .from(users)
        .where(eq(users.id, payload.userId))
        .limit(1);

      if (!userRows.length) {
        return res.status(401).json({ error: 'User not found' });
      }

      req.user = userRows[0];
      req.authMethod = 'jwt'; // useful for logging
      return next();
    } catch (err) {
      console.error('[JWT Auth] DB error:', err);
      return res.status(500).json({ error: 'Authentication error' });
    }
  }

  // ── METHOD 2: Session Cookie (web browser) ── KEEP EXACTLY AS IS
  // Paste your existing session authentication code here unchanged.
  // It typically looks like one of:
  //   if (req.session?.userId) { ... }
  //   if (req.isAuthenticated()) { ... }
  // DO NOT modify it.
}
```

**After editing:** Search the entire saathiai.org codebase for every place `requireAuth` (or whatever the middleware is named) is used. Confirm none of those existing usages need to change — they should all work identically because the session path is untouched.

### STEP 1.5 — Update the Login endpoint

**Find the existing login route.** It is likely at:
- `POST /api/auth/login`
- `POST /api/login`
- Inside `server/routes.ts` or `server/auth-routes.ts`

**Find the part where login succeeds** (after password verification passes) and **add the JWT block** shown below. The existing session code must remain:

```typescript
import { generateAccessToken, generateRefreshToken } from '../lib/jwt'; // adjust path

// Inside your existing login route handler, AFTER credentials are verified:
// (your existing code already has: const user = await db... verifyPassword... etc)

// ── ADD THIS BLOCK — detect mobile app client ──
const isMobileClient = req.body.client === 'mobile' || 
                       req.headers['x-client-type'] === 'mobile';

if (isMobileClient) {
  // Mobile app gets JWT tokens
  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    username: user.username,
  });
  const refreshToken = generateRefreshToken(user.id);

  return res.status(200).json({
    success: true,
    token: accessToken,
    refreshToken: refreshToken,
    expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      location: user.location,
      profile_picture: user.profile_picture,
      preferred_language: user.preferred_language,
      provider: user.provider,
      created_at: user.created_at,
    },
  });
}
// ── END OF ADDED BLOCK ──

// The existing web session code continues below UNCHANGED:
// req.session.userId = user.id; (or however your session is set)
// return res.json({ ... });
```

### STEP 1.6 — Update the Register endpoint

**Find the existing register route** (`POST /api/auth/register` or similar).

**Find where registration succeeds** (new user inserted into DB) and add:

```typescript
import { generateAccessToken, generateRefreshToken } from '../lib/jwt';

// Inside register handler, AFTER the new user is created in the DB:

const isMobileClient = req.body.client === 'mobile' ||
                       req.headers['x-client-type'] === 'mobile';

if (isMobileClient) {
  // For mobile: after OTP is sent, return success (no token yet — token comes after OTP verify)
  return res.status(201).json({
    success: true,
    message: 'Account created. Please verify your email with the OTP sent.',
    email: newUser.email, // echo back so app knows where OTP was sent
    requiresOTP: true,
  });
}

// Existing web flow continues below unchanged
```

### STEP 1.7 — Update the OTP Verify endpoint

**Find the existing OTP verification route** (`POST /api/auth/verify-otp` or similar).

**Find where OTP verification succeeds** and add:

```typescript
// Inside OTP verify handler, AFTER otp is confirmed valid:

const isMobileClient = req.body.client === 'mobile' ||
                       req.headers['x-client-type'] === 'mobile';

if (isMobileClient) {
  // Mark user as verified in DB (your existing logic should handle this)
  // Then return JWT tokens so the app can log the user in immediately
  const accessToken = generateAccessToken({
    id: verifiedUser.id,
    email: verifiedUser.email,
    username: verifiedUser.username,
  });
  const refreshToken = generateRefreshToken(verifiedUser.id);

  return res.status(200).json({
    success: true,
    message: 'Email verified successfully.',
    token: accessToken,
    refreshToken: refreshToken,
    expiresIn: 7 * 24 * 60 * 60,
    user: {
      id: verifiedUser.id,
      username: verifiedUser.username,
      email: verifiedUser.email,
      phone: verifiedUser.phone,
      location: verifiedUser.location,
      profile_picture: verifiedUser.profile_picture,
      preferred_language: verifiedUser.preferred_language,
      provider: verifiedUser.provider,
      created_at: verifiedUser.created_at,
    },
  });
}

// Existing web session flow continues unchanged
```

### STEP 1.8 — Add Token Refresh endpoint (NEW ROUTE)

**Add this new route** to your routes file. This is needed when the app's 7-day access token expires — the app uses the 30-day refresh token to get a new access token without forcing re-login:

```typescript
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '../lib/jwt';

// POST /api/auth/refresh
app.post('/api/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token required' });
  }

  const payload = verifyRefreshToken(refreshToken);

  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }

  try {
    const userRows = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (!userRows.length) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = userRows[0];
    const newAccessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      username: user.username,
    });
    const newRefreshToken = generateRefreshToken(user.id);

    return res.status(200).json({
      success: true,
      token: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 7 * 24 * 60 * 60,
    });
  } catch (err) {
    console.error('[Token Refresh] Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
```

### STEP 1.9 — Add Push Token registration endpoint (NEW ROUTE)

**Add this new route** for when the native app registers its Expo push notification token:

```typescript
// POST /api/users/device  — register mobile device for push notifications
app.post('/api/users/device', requireAuth, async (req, res) => {
  const { expo_push_token, device_type, device_name } = req.body;
  const userId = req.user.id;

  if (!expo_push_token || !device_type) {
    return res.status(400).json({ error: 'expo_push_token and device_type are required' });
  }

  try {
    // Upsert: insert if new token, update last_active if exists
    await db.execute(`
      INSERT INTO user_devices (user_id, expo_push_token, device_type, device_name, last_active)
      VALUES ($1, $2, $3, $4, now())
      ON CONFLICT (expo_push_token) 
      DO UPDATE SET 
        user_id = $1,
        device_type = $3,
        device_name = $4,
        last_active = now()
    `, [userId, expo_push_token, device_type, device_name || null]);

    return res.status(200).json({ success: true, message: 'Device registered' });
  } catch (err) {
    console.error('[Device Register] Error:', err);
    return res.status(500).json({ error: 'Failed to register device' });
  }
});
```

### STEP 1.10 — Add OAuth social login JWT support

**Find the Google OAuth callback** (likely at `/api/auth/google/callback` or similar). After the OAuth success and user is found/created, add:

```typescript
// In the OAuth callback, detect if request came from mobile app
// Mobile app OAuth sends a state parameter containing 'mobile'
const state = req.query.state as string;
const isMobileOAuth = state && state.includes('mobile');

if (isMobileOAuth) {
  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    username: user.username,
  });
  const refreshToken = generateRefreshToken(user.id);

  // Redirect to app deep link with tokens
  // The app handles this URL via expo-linking
  return res.redirect(
    `saathiai://auth/callback?token=${accessToken}&refreshToken=${refreshToken}&userId=${user.id}`
  );
}

// Existing web OAuth redirect continues unchanged
```

**Repeat the same pattern** for Facebook and X OAuth callbacks.

### STEP 1.11 — Verify nothing is broken

After all Codebase A changes, do these checks:

```bash
# 1. TypeScript compile check
npx tsc --noEmit

# 2. Start dev server
npm run dev

# 3. Test web login still works by visiting saathiai.org/login in browser
# 4. Test the new mobile login endpoint with curl:
curl -X POST https://saathiai.org/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username_or_email":"test@example.com","password":"yourpassword","client":"mobile"}'
# Expected response: { "success": true, "token": "eyJ...", "refreshToken": "eyJ...", "user": {...} }
```

---

## PART 2 — CHANGES TO CODEBASE B (Native App — saathi-native)

**These are all new files/additions to the React Native Expo app. Nothing in the web codebase is affected.**

### STEP 2.1 — Install required packages

In the `saathi-native` project root:

```bash
npx expo install expo-secure-store
npx expo install expo-linking
npm install zustand
npm install @react-native-async-storage/async-storage
npx expo install expo-auth-session expo-web-browser expo-crypto
```

### STEP 2.2 — Create the API base client

Create file: `services/api.ts`

```typescript
import * as SecureStore from 'expo-secure-store';

// ── IMPORTANT: This is your live website's API ──
export const API_BASE = 'https://saathiai.org';

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
```

### STEP 2.3 — Create the Auth service

Create file: `services/auth.ts`

```typescript
import { apiCall, saveAuthTokens, clearAuthTokens, API_BASE } from './api';
import * as SecureStore from 'expo-secure-store';

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
}

export interface AuthResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

/**
 * Login with email/username + password
 * Sends client: 'mobile' so backend returns JWT instead of session cookie
 */
export async function loginWithCredentials(
  usernameOrEmail: string,
  password: string
): Promise<AuthResponse> {
  const data = await apiCall<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username_or_email: usernameOrEmail,
      password,
      client: 'mobile',          // ← critical — tells backend to return JWT
    }),
  });

  // Save tokens to device secure storage
  await saveAuthTokens(data.token, data.refreshToken);
  return data;
}

/**
 * Register new account
 */
export async function registerAccount(params: {
  name: string;
  email: string;
  phone?: string;
  password: string;
}): Promise<{ success: boolean; email: string; requiresOTP: boolean }> {
  return apiCall('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: params.name,
      username: params.name.toLowerCase().replace(/\s+/g, '_') + '_' + Math.random().toString(36).slice(2, 6),
      email: params.email,
      phone: params.phone,
      password: params.password,
      client: 'mobile',
    }),
  });
}

/**
 * Verify OTP — returns JWT tokens on success
 * This is what actually logs the user in after registration
 */
export async function verifyOTP(
  email: string,
  otp: string
): Promise<AuthResponse> {
  const data = await apiCall<AuthResponse>('/api/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({
      email,
      otp,
      client: 'mobile',
    }),
  });

  await saveAuthTokens(data.token, data.refreshToken);
  return data;
}

/**
 * Resend OTP
 */
export async function resendOTP(email: string): Promise<{ success: boolean }> {
  return apiCall('/api/auth/resend-otp', {
    method: 'POST',
    body: JSON.stringify({ email, client: 'mobile' }),
  });
}

/**
 * Logout — clear tokens locally + invalidate session on server
 */
export async function logout(): Promise<void> {
  try {
    await apiCall('/api/auth/logout', { method: 'POST' });
  } catch {
    // Even if server logout fails, clear local tokens
  } finally {
    await clearAuthTokens();
  }
}

/**
 * Check if user is still logged in (token exists and is valid)
 * Call this on app startup to decide where to navigate
 */
export async function checkAuthStatus(): Promise<User | null> {
  const token = await SecureStore.getItemAsync('saathi_access_token');
  if (!token) return null;

  try {
    const data = await apiCall<{ user: User }>('/api/auth/me');
    return data.user;
  } catch (err) {
    if ((err as Error).message === 'SESSION_EXPIRED') {
      return null; // tokens cleared by apiCall, navigate to login
    }
    return null;
  }
}

/**
 * Register device for push notifications
 */
export async function registerDevice(params: {
  expo_push_token: string;
  device_type: 'ios' | 'android';
  device_name?: string;
}): Promise<void> {
  await apiCall('/api/users/device', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
```

### STEP 2.4 — Create the Auth store (Zustand)

Create file: `store/authStore.ts`

```typescript
import { create } from 'zustand';
import { User } from '../services/auth';

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: User) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),
  clearUser: () => set({ user: null, isAuthenticated: false, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
```

### STEP 2.5 — Update app root layout with auth gate

**File:** `app/_layout.tsx` — update to check auth status on startup:

```typescript
import { useEffect } from 'react';
import { Stack, router, SplashScreen } from 'expo-router';
import { useFonts, Sora_400Regular, Sora_500Medium, Sora_600SemiBold, Sora_700Bold, Sora_800ExtraBold } from '@expo-google-fonts/sora';
import { useAuthStore } from '../store/authStore';
import { checkAuthStatus } from '../services/auth';

// Keep native splash visible until we're ready
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { setUser, clearUser, setLoading } = useAuthStore();

  const [fontsLoaded] = useFonts({
    Sora_400Regular,
    Sora_500Medium,
    Sora_600SemiBold,
    Sora_700Bold,
    Sora_800ExtraBold,
  });

  useEffect(() => {
    async function initializeApp() {
      try {
        // Check if user has a valid saved session
        const user = await checkAuthStatus();
        
        if (user) {
          setUser(user);
          router.replace('/(app)/dashboard');
        } else {
          clearUser();
          // Check if first time launch
          const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
          const hasOnboarded = await AsyncStorage.getItem('saathi_has_onboarded');
          
          if (!hasOnboarded) {
            router.replace('/(onboarding)');
          } else {
            router.replace('/(auth)/login');
          }
        }
      } catch (err) {
        console.error('[App Init]', err);
        clearUser();
        router.replace('/(auth)/login');
      } finally {
        if (fontsLoaded) {
          SplashScreen.hideAsync();
        }
      }
    }

    if (fontsLoaded) {
      initializeApp();
    }
  }, [fontsLoaded]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
      <Stack.Screen name="splash" />
    </Stack>
  );
}
```

### STEP 2.6 — Build the Login screen

**File:** `app/(auth)/login.tsx`

```typescript
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Link } from 'expo-router';
import { loginWithCredentials } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/Colors';

export default function LoginScreen() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuthStore();

  async function handleLogin() {
    if (!usernameOrEmail.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await loginWithCredentials(usernameOrEmail.trim(), password);
      setUser(response.user);
      router.replace('/(app)/dashboard');
    } catch (err: any) {
      Alert.alert(
        'Login Failed',
        err.message || 'Invalid credentials. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container} bounces={false}>
        {/* Hero Header */}
        <LinearGradient
          colors={['#0D3B1D', '#1A7B3C']}
          style={styles.hero}
        >
          <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>🌱</Text></View>
          <Text style={styles.heroTitle}>
            Empowering Farmers,{'\n'}
            <Text style={styles.heroAccent}>Transforming Agriculture.</Text>
          </Text>
          <Text style={styles.heroSub}>Join 10,000+ farmers across India</Text>
        </LinearGradient>

        {/* Auth Card */}
        <View style={styles.card}>
          {/* Tab switcher */}
          <View style={styles.tabRow}>
            <View style={[styles.tab, styles.tabActive]}>
              <Text style={[styles.tabText, styles.tabTextActive]}>Login</Text>
            </View>
            <TouchableOpacity
              style={styles.tab}
              onPress={() => router.replace('/(auth)/register')}
            >
              <Text style={styles.tabText}>Register</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <Text style={styles.label}>USERNAME OR EMAIL</Text>
          <TextInput
            style={styles.input}
            value={usernameOrEmail}
            onChangeText={setUsernameOrEmail}
            placeholder="farmer123 or you@gmail.com"
            placeholderTextColor="#B0C4B8"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <Text style={styles.label}>PASSWORD</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#B0C4B8"
              secureTextEntry={!showPassword}
              autoComplete="password"
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={{ fontSize: 18 }}>{showPassword ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>

          {/* Primary button */}
          <TouchableOpacity
            style={[styles.btnPrimary, isLoading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnPrimaryText}>🌱 Login to Saathi AI →</Text>
            }
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social buttons */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn}>
              <Text style={styles.socialBtnText}>🔵 Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <Text style={styles.socialBtnText}>📘 Facebook</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <Text style={styles.socialBtnText}>✖ X</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  hero: { paddingTop: 64, paddingHorizontal: 24, paddingBottom: 48 },
  heroBadge: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'flex-end', marginBottom: 12,
  },
  heroBadgeText: { fontSize: 20 },
  heroTitle: { fontSize: 24, fontFamily: 'Sora_800ExtraBold', color: '#fff', lineHeight: 32 },
  heroAccent: { color: '#A8F0C0' },
  heroSub: { fontSize: 13, fontFamily: 'Sora_400Regular', color: 'rgba(255,255,255,0.6)', marginTop: 6 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 28, margin: 0,
    marginTop: -20,
    padding: 24,
    paddingBottom: 40,
    minHeight: 400,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12, padding: 4,
    marginBottom: 24,
  },
  tab: { flex: 1, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 9 },
  tabActive: { backgroundColor: Colors.surface, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  tabText: { fontFamily: 'Sora_600SemiBold', fontSize: 14, color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary },
  label: { fontFamily: 'Sora_600SemiBold', fontSize: 11, color: Colors.textSecondary, letterSpacing: 0.6, marginBottom: 6, textTransform: 'uppercase' },
  input: {
    height: 52, backgroundColor: Colors.background,
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 14, paddingHorizontal: 16,
    fontFamily: 'Sora_400Regular', fontSize: 14,
    color: Colors.textPrimary, marginBottom: 16,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  eyeBtn: { padding: 12 },
  btnPrimary: {
    height: 54, backgroundColor: Colors.primary,
    borderRadius: 16, alignItems: 'center',
    justifyContent: 'center', marginTop: 4,
  },
  btnDisabled: { opacity: 0.7 },
  btnPrimaryText: { fontFamily: 'Sora_700Bold', fontSize: 15, color: '#fff' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontFamily: 'Sora_400Regular', fontSize: 11, color: Colors.textSecondary, whiteSpace: 'nowrap' },
  socialRow: { flexDirection: 'row', gap: 10 },
  socialBtn: {
    flex: 1, height: 48,
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 14, alignItems: 'center', justifyContent: 'center',
  },
  socialBtnText: { fontFamily: 'Sora_600SemiBold', fontSize: 12, color: Colors.textPrimary },
});
```

### STEP 2.7 — Build the Register screen

**File:** `app/(auth)/register.tsx`

```typescript
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { registerAccount } from '../../services/auth';
import { Colors } from '../../constants/Colors';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleRegister() {
    if (!name || !email || !password) {
      Alert.alert('Missing fields', 'Name, email and password are required.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await registerAccount({ name, email, phone: phone || undefined, password });
      
      if (response.requiresOTP) {
        // Navigate to OTP screen, pass email as param
        router.push({
          pathname: '/(auth)/verify-otp',
          params: { email: response.email },
        });
      }
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message || 'Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView style={styles.container} bounces={false}>
        <LinearGradient colors={['#0D3B1D', '#1A7B3C']} style={styles.hero}>
          <View style={styles.heroBadge}><Text style={{ fontSize: 20 }}>🌱</Text></View>
          <Text style={styles.heroTitle}>
            Empowering Farmers,{'\n'}
            <Text style={{ color: '#A8F0C0' }}>Transforming Agriculture.</Text>
          </Text>
          <Text style={styles.heroSub}>Join the smart farming revolution today</Text>
        </LinearGradient>

        <View style={styles.card}>
          {/* Tab switcher */}
          <View style={styles.tabRow}>
            <TouchableOpacity style={styles.tab} onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.tabText}>Login</Text>
            </TouchableOpacity>
            <View style={[styles.tab, styles.tabActive]}>
              <Text style={[styles.tabText, styles.tabTextActive]}>Register</Text>
            </View>
          </View>

          <Text style={styles.label}>FULL NAME</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName}
            placeholder="Ramesh Kumar" placeholderTextColor="#B0C4B8" autoComplete="name" />

          <Text style={styles.label}>EMAIL ADDRESS</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail}
            placeholder="ramesh@gmail.com" placeholderTextColor="#B0C4B8"
            keyboardType="email-address" autoCapitalize="none" autoComplete="email" />

          <Text style={styles.label}>PHONE (OPTIONAL)</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone}
            placeholder="+91 98765 43210" placeholderTextColor="#B0C4B8"
            keyboardType="phone-pad" autoComplete="tel" />

          <Text style={styles.label}>PASSWORD</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword}
            placeholder="Create a strong password (min 8 chars)" placeholderTextColor="#B0C4B8"
            secureTextEntry autoComplete="new-password" />

          <Text style={styles.label}>CONFIRM PASSWORD</Text>
          <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword}
            placeholder="Confirm your password" placeholderTextColor="#B0C4B8"
            secureTextEntry autoComplete="new-password" />

          <TouchableOpacity
            style={[styles.btnPrimary, isLoading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnPrimaryText}>Send OTP →</Text>
            }
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn}><Text style={styles.socialBtnText}>🔵 Google</Text></TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}><Text style={styles.socialBtnText}>📘 Facebook</Text></TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}><Text style={styles.socialBtnText}>✖ X</Text></TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  hero: { paddingTop: 64, paddingHorizontal: 24, paddingBottom: 48 },
  heroBadge: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end', marginBottom: 12 },
  heroTitle: { fontSize: 24, fontFamily: 'Sora_800ExtraBold', color: '#fff', lineHeight: 32 },
  heroSub: { fontSize: 13, fontFamily: 'Sora_400Regular', color: 'rgba(255,255,255,0.6)', marginTop: 6 },
  card: { backgroundColor: '#fff', borderRadius: 28, marginTop: -20, padding: 24, paddingBottom: 40 },
  tabRow: { flexDirection: 'row', backgroundColor: Colors.surfaceAlt, borderRadius: 12, padding: 4, marginBottom: 24 },
  tab: { flex: 1, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 9 },
  tabActive: { backgroundColor: '#fff', elevation: 2 },
  tabText: { fontFamily: 'Sora_600SemiBold', fontSize: 14, color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary },
  label: { fontFamily: 'Sora_600SemiBold', fontSize: 11, color: Colors.textSecondary, letterSpacing: 0.6, marginBottom: 6, textTransform: 'uppercase' },
  input: { height: 52, backgroundColor: Colors.background, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 14, paddingHorizontal: 16, fontFamily: 'Sora_400Regular', fontSize: 14, color: Colors.textPrimary, marginBottom: 16 },
  btnPrimary: { height: 54, backgroundColor: Colors.primary, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  btnPrimaryText: { fontFamily: 'Sora_700Bold', fontSize: 15, color: '#fff' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontFamily: 'Sora_400Regular', fontSize: 11, color: Colors.textSecondary },
  socialRow: { flexDirection: 'row', gap: 10 },
  socialBtn: { flex: 1, height: 48, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  socialBtnText: { fontFamily: 'Sora_600SemiBold', fontSize: 12, color: Colors.textPrimary },
});
```

### STEP 2.8 — Build the OTP Verify screen

**File:** `app/(auth)/verify-otp.tsx`

```typescript
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { verifyOTP, resendOTP } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/Colors';

const OTP_LENGTH = 6;

export default function VerifyOTPScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { setUser } = useAuthStore();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  function handleOtpChange(value: string, index: number) {
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // only last character
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (newOtp.every(d => d !== '') && newOtp.join('').length === OTP_LENGTH) {
      handleVerify(newOtp.join(''));
    }
  }

  function handleKeyPress(key: string, index: number) {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleVerify(otpCode?: string) {
    const code = otpCode || otp.join('');
    if (code.length !== OTP_LENGTH) {
      Alert.alert('Incomplete', 'Please enter the 6-digit code.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await verifyOTP(email, code);
      setUser(response.user);
      router.replace('/(app)/dashboard');
    } catch (err: any) {
      Alert.alert('Invalid OTP', err.message || 'The code is incorrect or expired.');
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    setCanResend(false);
    setCountdown(60);
    try {
      await resendOTP(email);
      Alert.alert('OTP Sent', 'A new verification code has been sent to your email.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to resend OTP.');
    }
  }

  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1***$3');

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.icon}><Text style={{ fontSize: 32 }}>📧</Text></View>

        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to{'\n'}
          <Text style={styles.emailHighlight}>{maskedEmail}</Text>
          {'\n'}Enter it below to continue.
        </Text>

        {/* OTP boxes */}
        <View style={styles.otpRow}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={(ref) => { if (ref) inputRefs.current[i] = ref; }}
              style={[styles.otpBox, digit && styles.otpBoxFilled]}
              value={digit}
              onChangeText={(v) => handleOtpChange(v, i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Countdown */}
        <Text style={styles.timer}>
          {canResend ? (
            <Text style={styles.resendLink} onPress={handleResend}>
              Resend OTP
            </Text>
          ) : (
            <>Resend in <Text style={styles.timerHighlight}>{countdown}s</Text></>
          )}
        </Text>

        {/* Verify button */}
        <TouchableOpacity
          style={[styles.btnPrimary, isLoading && { opacity: 0.7 }]}
          onPress={() => handleVerify()}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>✓ Verify & Continue</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  back: { padding: 20, paddingTop: 56 },
  backText: { fontFamily: 'Sora_600SemiBold', fontSize: 16, color: Colors.textSecondary },
  content: { flex: 1, paddingHorizontal: 28, alignItems: 'center' },
  icon: { width: 80, height: 80, backgroundColor: Colors.surfaceAlt, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  title: { fontFamily: 'Sora_800ExtraBold', fontSize: 24, color: Colors.textPrimary, textAlign: 'center', marginBottom: 10 },
  subtitle: { fontFamily: 'Sora_400Regular', fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 36 },
  emailHighlight: { fontFamily: 'Sora_700Bold', color: Colors.textPrimary },
  otpRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  otpBox: { width: 48, height: 60, borderRadius: 14, borderWidth: 2, borderColor: Colors.border, backgroundColor: Colors.background, fontFamily: 'Sora_800ExtraBold', fontSize: 22, color: Colors.primary },
  otpBoxFilled: { borderColor: Colors.primary, backgroundColor: Colors.surfaceAlt },
  timer: { fontFamily: 'Sora_400Regular', fontSize: 14, color: Colors.textSecondary, marginBottom: 28 },
  timerHighlight: { fontFamily: 'Sora_700Bold', color: Colors.primary },
  resendLink: { fontFamily: 'Sora_700Bold', color: Colors.primary },
  btnPrimary: { width: '100%', height: 54, backgroundColor: Colors.primary, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontFamily: 'Sora_700Bold', fontSize: 15, color: '#fff' },
});
```

### STEP 2.9 — Register device for push notifications after login

**File:** `app/(app)/_layout.tsx` — Add this inside the protected layout, runs once after user is authenticated:

```typescript
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { registerForPushNotifications } from '../../services/notifications';
import { registerDevice } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';

// Inside your protected layout component, add this useEffect:
const { user } = useAuthStore();

useEffect(() => {
  async function setupPushNotifications() {
    if (!user) return;
    try {
      const token = await registerForPushNotifications();
      if (token) {
        await registerDevice({
          expo_push_token: token,
          device_type: Platform.OS as 'ios' | 'android',
          device_name: `${Platform.OS} Device`,
        });
      }
    } catch (err) {
      // Non-critical — don't block app if this fails
      console.warn('[Push Setup]', err);
    }
  }
  setupPushNotifications();
}, [user?.id]);
```

### STEP 2.10 — Handle SESSION_EXPIRED globally

**In `app/_layout.tsx`**, add this listener to catch session expiry from any API call:

```typescript
import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '../store/authStore';

// Inside RootLayout component:
const { clearUser } = useAuthStore();

useEffect(() => {
  // Global error listener for session expiry
  const originalFetch = global.fetch;
  // The apiCall service throws 'SESSION_EXPIRED' — catch it at navigation level
  // by listening for auth store changes where user becomes null unexpectedly
}, []);
```

---

## PART 3 — TESTING CHECKLIST

After completing all changes in both codebases, verify every scenario in order:

### 3.1 Web parity test (MUST pass — nothing should break)
```
1. Open saathiai.org in browser
2. Login with existing account → should work identically as before
3. Register new account → OTP flow → login → dashboard
4. All protected pages load correctly
5. Logout works
```

### 3.2 Mobile JWT flow test
```bash
# Test login returns JWT
curl -X POST https://saathiai.org/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username_or_email":"your@email.com","password":"yourpassword","client":"mobile"}'

# Expected: { "success": true, "token": "eyJ...", "refreshToken": "eyJ...", "user": {...} }

# Test JWT-protected endpoint
curl https://saathiai.org/api/auth/me \
  -H "Authorization: Bearer <token_from_above>"

# Expected: { "user": { "id": "...", "email": "...", ... } }

# Test token refresh
curl -X POST https://saathiai.org/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refresh_token_from_above>"}'

# Expected: { "success": true, "token": "eyJ...(new)...", "refreshToken": "eyJ...(new)..." }
```

### 3.3 Native app end-to-end test
```
1. Fresh install app → Onboarding shows → Complete → Login screen
2. Enter credentials from saathiai.org account → Login succeeds → Dashboard loads
3. Kill app → Reopen → Should skip login and go straight to Dashboard (token persisted)
4. Wait 7 days (or manually expire token) → App should auto-refresh silently
5. Register new account in app → OTP arrives at email → Verify → Dashboard
6. Same account should be visible at saathiai.org → login on web works too
```

---

## PART 4 — CRITICAL REMINDERS

1. **Never commit JWT secrets to git.** The `.env` file must be in `.gitignore` for both projects. Use the platform's environment variables dashboard for production deployment.

2. **The `client: 'mobile'` field is the routing key.** Every mobile API call must include either `client: 'mobile'` in the request body or `x-client-type: mobile` in headers. The backend uses this to decide whether to return JWT or set a session cookie.

3. **`expo-secure-store` not `AsyncStorage` for tokens.** Tokens are sensitive — SecureStore uses iOS Keychain and Android Keystore, which are hardware-encrypted. AsyncStorage is plaintext and must never store auth tokens.

4. **BLE still requires expo-dev-client.** The auth changes have no effect on this — BLE cannot be tested in Expo Go regardless of auth method.

5. **Social OAuth (Google/Facebook/X) for mobile** uses a deep link callback (`saathiai://auth/callback`). This requires the `scheme` field in `app.json`:
   ```json
   { "expo": { "scheme": "saathiai" } }
   ```
   Without this, OAuth redirect back to the app will fail silently.

6. **The saathiai.org backend changes are backwards-compatible.** If `client: 'mobile'` is NOT sent, the API behaves exactly as before. The web frontend does not need any changes.

---

*Auth Integration Prompt — Mitti-AI Innovations · March 2026*  
*Prepared for Antigravity IDE (Stitch MCP)*  
*Connects: saathiai.org backend ↔ Neon DB ↔ Saathi AI Native App*
