# SAATHI AI — NATIVE MOBILE APP MASTER BUILD PROMPT
### For Antigravity IDE (Stitch MCP) · Mitti-AI Innovations
**Version:** 2.0 Production Build  
**Target:** iOS (App Store) + Android (Play Store)  
**Stack:** React Native + Expo (EAS Build)  
**Base Repo:** `github.com/sanatan223/mitti` (fork into `NilambarSonu/saathi-native`)

---

## SECTION 1 — PROJECT OVERVIEW & OBJECTIVE

### 1.1 What You Are Building

You are transforming an existing functional-but-unpolished Expo React Native app (APK-only, no auth, generic UI) into a **production-grade, App Store + Play Store ready** native mobile application for Saathi AI — India's first AI-powered Bluetooth soil testing platform by Mitti-AI Innovations.

The existing repo has all the hard technical work done: BLE scanning, GPS history, AI chat with voice, multilingual support, and Leaflet map integration. **Do NOT rewrite the logic layer.** Your job is to:

1. Perform a complete UI/UX overhaul to Apple-tier / premium quality
2. Add authentication (exactly matching saathiai.org)
3. Add splash screen + onboarding flow
4. Add push notifications and soil alert system
5. Add improved BLE pairing UX
6. Add PDF export from history
7. Add app opening animation
8. Configure EAS Build for both platforms

### 1.2 Who Uses This App

**Primary users:** Indian farmers, age 25–60, using Android phones (60%) or budget iPhones. Many are semi-literate in English but fluent in regional languages. UI must be clear, large-touch-targets, icon-first, never text-heavy.

**Secondary users:** Agricultural extension workers and agronomists who use the Pro/Premium tier features.

### 1.3 Brand Identity to Match Exactly

The live website at **saathiai.org** is the design reference. Every screen in the native app must feel like a mobile version of that website — same brand, same tone, same quality. Key brand attributes: organic, premium, data-driven, farmer-first, multilingual.

---

## SECTION 2 — DESIGN SYSTEM (NON-NEGOTIABLE)

### 2.1 Typography

```
Primary Display Font:   "Sora" (Google Fonts)
Weights used:           300 (light), 400, 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold)
Body Font:              "Sora" 400, 14sp
Heading Font:           "Sora" 700–800, letterspacing -0.02em
```

**Installation in Expo:**
```bash
npx expo install expo-font @expo-google-fonts/sora
```

In `app/_layout.tsx`:
```typescript
import { useFonts, Sora_400Regular, Sora_600SemiBold, Sora_700Bold, Sora_800ExtraBold } from '@expo-google-fonts/sora';
```

**Never use:** Inter, Roboto, Arial, System default fonts. The entire visual quality of this app depends on Sora being loaded correctly.

### 2.2 Color Tokens

```typescript
// constants/Colors.ts — define exactly as follows
export const Colors = {
  // Primary Greens
  primary:        '#1A7B3C',   // main brand green
  primaryDark:    '#14562A',   // darker shade for gradients
  primaryDeep:    '#0D3B1D',   // darkest, used in headers
  primaryLight:   '#4CAF6E',   // lighter green for highlights
  
  // Background & Surface
  background:     '#F4FBF6',   // app background (ultra-pale mint)
  surface:        '#FFFFFF',   // cards, modals
  surfaceAlt:     '#E8F7ED',   // mint-tinted surface (feature tiles, chips)
  surfaceAlt2:    '#D0EDD8',   // slightly deeper mint

  // Accent
  amber:          '#F4A02D',   // harvest gold, used for warnings & highlights
  amberDark:      '#E8892A',

  // Semantic
  error:          '#E53935',   // destructive actions, acidic soil
  warning:        '#FF8F00',   // moderate alerts
  info:           '#1565C0',   // informational
  success:        '#2E7D32',   // confirmation toasts

  // Typography
  textPrimary:    '#1A2E1E',   // main text
  textSecondary:  '#6B8A72',   // secondary/muted text
  textOnDark:     '#FFFFFF',   // text on dark backgrounds
  textOnDarkMute: 'rgba(255,255,255,0.65)',

  // Borders
  border:         '#C8E6D0',
  borderLight:    '#E8F7ED',

  // Special
  purple:         '#7C3AED',   // Premium tier
  blue:           '#2563EB',   // Pro tier / Bluetooth
};
```

### 2.3 Spacing & Radius System

```typescript
// constants/Spacing.ts
export const Spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  24,
  xxxl: 32,
};

export const Radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  24,
  pill: 100,
};
```

### 2.4 Shadows

```typescript
export const Shadows = {
  card: {
    shadowColor: '#1A7B3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
};
```

### 2.5 Component Visual Language

**Cards:** `borderRadius: 20`, white background, `Shadows.card`, no border by default. Featured cards get `border: 2px solid Colors.primary`.

**Buttons (Primary):** Full width, `height: 54`, `borderRadius: 16`, `backgroundColor: Colors.primary`, Sora 700 16sp white text. Active state: `scale(0.98)` via `Animated`.

**Buttons (Secondary):** Same height, `backgroundColor: Colors.surfaceAlt`, `color: Colors.primary`.

**Inputs:** `height: 52`, `backgroundColor: Colors.background`, `border: 1.5px solid Colors.border`, `borderRadius: 14`, focused state border changes to `Colors.primary`.

**Bottom Tab Bar:** `backgroundColor: rgba(255,255,255,0.95)`, `backdropFilter: blur(20px)` via `@react-native-community/blur`, `borderTopColor: Colors.border`. Active icon: `Colors.primary`, scale 1.1. Labels Sora 600 10sp.

**Toasts/Alerts:** Use `react-native-toast-message`. Custom config: success = green, error = red, info = blue.

---

## SECTION 3 — FOLDER STRUCTURE

Reorganize the repo to follow this structure exactly:

```
saathi-native/
├── app/                          # Expo Router screens
│   ├── _layout.tsx               # Root layout with font loading + auth gate
│   ├── index.tsx                 # Redirects to /splash
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── verify-otp.tsx
│   ├── (onboarding)/
│   │   └── index.tsx             # 3-slide onboarding
│   ├── (app)/                    # Protected routes (requires auth)
│   │   ├── _layout.tsx           # Tab navigator
│   │   ├── dashboard.tsx
│   │   ├── live-connect.tsx
│   │   ├── ai-chat.tsx
│   │   ├── history.tsx
│   │   └── about.tsx
│   ├── splash.tsx
│   ├── profile.tsx
│   ├── settings.tsx
│   ├── subscribe.tsx
│   └── buy-agni.tsx
├── components/
│   ├── ui/                       # Base design system components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Toggle.tsx
│   │   └── Toast.tsx
│   ├── dashboard/
│   │   ├── AgniConnectCard.tsx
│   │   ├── SoilHealthRing.tsx
│   │   ├── FeatureGrid.tsx
│   │   └── AwardsTicker.tsx
│   ├── live-connect/
│   │   ├── BLERadar.tsx
│   │   └── DeviceCard.tsx
│   ├── ai-chat/
│   │   ├── ChatBubble.tsx
│   │   ├── QuickActionGrid.tsx
│   │   └── VoiceButton.tsx
│   ├── history/
│   │   ├── SoilHistoryChart.tsx
│   │   ├── FieldMap.tsx
│   │   ├── TestLogRow.tsx
│   │   └── SoilDetailModal.tsx
│   └── navigation/
│       └── TabBar.tsx            # Custom bottom tab bar
├── hooks/
│   ├── useBLE.ts                 # (keep existing, improve UX only)
│   ├── useAuth.ts                # NEW
│   ├── useNotifications.ts       # NEW
│   └── useLanguage.ts            # (keep existing)
├── services/
│   ├── auth.ts                   # API calls for login/register/OTP
│   ├── notifications.ts          # Expo Notifications config
│   └── pdfExport.ts             # NEW
├── store/
│   └── authStore.ts              # Zustand auth state
├── constants/
│   ├── Colors.ts
│   ├── Spacing.ts
│   └── Languages.ts
├── assets/
│   ├── fonts/
│   ├── animations/               # Lottie JSON files
│   └── images/
├── app.json
├── eas.json                      # NEW — EAS build config
└── package.json
```

---

## SECTION 4 — SCREEN-BY-SCREEN SPECIFICATIONS

### 4.1 SPLASH SCREEN

**File:** `app/splash.tsx`  
**Duration:** 2.2 seconds then auto-navigate  
**Navigation logic:** 
- Check `AsyncStorage` for `hasOnboarded` — if false → `/onboarding`
- Check auth token — if invalid/missing → `/auth/login`
- If authenticated → `/(app)/dashboard`

**Visual:**
```
Background: Linear gradient top-to-bottom: #0D3B1D → #1A7B3C → #4CAF6E
Center: 
  - Animated logo box (100x100, borderRadius:28, rgba(white,0.12), blur backdrop)
  - Inside: SVG sprout logo (Saathi AI brand mark from saathiai.org favicon)
  - Logo animates: scale 0→1.1→1, opacity 0→1, duration 600ms, spring easing
  
Below logo:
  - "Saathi AI" in Sora 800 32sp white, letterSpacing:-0.02em
  - "The Organic Intelligence Platform" in Sora 400 14sp rgba(white,0.65)
  
Loading indicator:
  - Three animated bars (8x8px each, borderRadius:4, rgba(white,0.3))
  - Each pulses opacity 0.3→1→0.3 with staggered delay (0ms, 200ms, 400ms)
  - Loop animation while loading check occurs
  
Bottom:
  - "Mitti-AI Innovations · Est. 2024" in Sora 400 11sp rgba(white,0.4)
  - letterSpacing: 0.08em
```

**Implementation note:** Use `expo-splash-screen` to hide native splash until fonts load, then show this animated screen.

---

### 4.2 ONBOARDING SCREEN

**File:** `app/(onboarding)/index.tsx`  
**Skip condition:** If `AsyncStorage.getItem('hasOnboarded') === 'true'`, skip entirely.  
**On complete:** Set `hasOnboarded: 'true'` in AsyncStorage, navigate to `/auth/login`.

**3 slides content:**

| Slide | Title | Body | Badge | Illustration BG |
|---|---|---|---|---|
| 1 | Soil Testing in **60 Seconds** | The Agni device analyzes 14 parameters — pH, N, P, K, moisture, EC and more. No lab. No waiting. | 60 SECS | Green mint |
| 2 | Your Farm, **Your Language** | Get recommendations in Odia, Hindi, English or 7 other Indian languages — with full voice advisory support. | 10 LANGS | Warm amber |
| 3 | AI That Knows **Agriculture** | Saathi AI is trained on peer-reviewed agronomic data to deliver personalized fertilizer plans and yield forecasts. | CUSTOM LLM | Soft purple |

**Layout structure:**
```
Full white screen
├── Top: Illustration panel (260×220px, rounded 24, tinted bg from Colors)
│   └── Badge chip: absolute top:-10, right:-10, green pill
├── Title: Sora 800 26sp, center, letterSpacing -0.02em
│   └── Key phrase wrapped in Colors.primary colored span
├── Body: Sora 400 14sp, Colors.textSecondary, center, lineHeight 1.6
│
└── Footer (sticky):
    ├── Dot indicators (3 dots, active = 24px wide green, inactive = 8px border)
    ├── Primary CTA button ("Continue" / "Get Started" on last slide)
    └── "Skip for now" text link → auth/login
```

**Gesture:** Support swipe left/right between slides using `react-native-gesture-handler` PanGestureHandler.

---

### 4.3 AUTHENTICATION SCREEN

**File:** `app/(auth)/login.tsx` and `app/(auth)/register.tsx`  
**Auth method:** Email + Password with OTP verification (matching saathiai.org exactly)  
**OAuth providers:** Google, Facebook, X — using `expo-auth-session`

#### LOGIN SCREEN

**Hero section (top 220px):**
```
Background: linear gradient #0D3B1D → #1A7B3C
Top-right: Saathi AI logo pill (40x40, rgba(white,0.15), blur)
Text bottom-left:
  "Empowering Farmers," — Sora 800 26sp white
  "Transforming Agriculture." — Sora 800 26sp #A8F0C0 (mint accent)
  Subtitle: "Join 10,000+ farmers across India" — Sora 400 13sp rgba(white,0.6)
```

**Bottom card (slides up, borderRadius 28 28 0 0, white background):**
```
Tab switcher: "Login" | "Register" pill tabs
  - Active: white bg, Sora 700, Colors.primary text
  - Inactive: transparent, Colors.textSecondary

Form fields:
  - "Username or Email" — placeholder: "farmer123 or you@gmail.com"
  - "Password" — with show/hide toggle (eye icon)
  - Forgot Password link (right-aligned, Colors.primary, 12sp)

Primary button: "🌱 Login to Saathi AI →"
  - Height 54, borderRadius 16, full width, Colors.primary bg

Divider: ── OR CONTINUE WITH ──

Social buttons row (3 equal):
  - Google (white circle icon)
  - Facebook (blue circle icon)
  - X/Twitter (black circle icon)
  Each: height 48, border 1.5px Colors.border, borderRadius 14
```

#### REGISTER SCREEN (Tab 2)

```
Fields in order:
  1. Full Name
  2. Email Address
  3. Phone Number (with +91 country prefix dropdown, optional)
  4. Verification Method:
     - Radio card: "Email Verification - Free, instant delivery" (default selected)
     - Radio card: "SMS Verification - Coming soon" (disabled, grey)
  5. Password (with strength indicator bar)
  6. Confirm Password

Primary button: "Send OTP →"
  → Validates form
  → Calls POST /api/auth/register with {name, email, phone, password}
  → On success: navigate to verify-otp screen with email in route params
  → On error: show red toast with error message

Social row: same as login
```

---

### 4.4 OTP VERIFICATION SCREEN

**File:** `app/(auth)/verify-otp.tsx`

```
Layout (white bg, no header bar):
  ← Back arrow (top left)
  
  Center content:
  - Email icon in green rounded box (80x80, borderRadius:24)
  - "Verify Your Email" — Sora 800 24sp
  - "We sent a 6-digit code to ram**@gmail.com" — 13sp muted, center
  
  6 OTP input boxes:
  - Each: 56×64px, borderRadius:16, border 2px
  - Empty: border Colors.border, bg Colors.background
  - Filled: border Colors.primary, bg Colors.surfaceAlt, Sora 800 24sp primary text
  - Auto-advance on each digit input
  - Auto-submit when 6th digit entered
  - Backspace clears current and goes back
  
  Resend row: "Resend in 42s" — countdown timer
    After 0: "Resend OTP" link in Colors.primary

  Verify button:
  - "✓ Verify & Continue" — same primary button style
  - Shows spinner while API call in progress

API call: POST /api/auth/verify-otp {email, otp}
  Success → navigate to /(app)/dashboard, save JWT token
  Failure → shake animation on boxes + red toast
```

---

### 4.5 DASHBOARD SCREEN

**File:** `app/(app)/dashboard.tsx`

**Header section (gradient, extends below safe area):**
```
Background: linear gradient #0D3B1D → #1A7B3C
Radial glow overlay: rgba(76,175,110,0.2) at top-right

Top row:
  Left: 
    "Good morning 🌾" — Sora 600 18sp rgba(white,0.7)
    User's first name — Sora 800 22sp white
  Right:
    Bell icon (notifications) with red dot badge if unread
    User avatar pill (44x44, borderRadius:14)

Stats row (3 glass cards, below greeting):
  Each card: bg rgba(white,0.12), border rgba(white,0.18), borderRadius:14, blur
  - Farms Analyzed | Soil Tests | AI Recommendations
  - Values in Sora 800 20sp white
  - Labels in Sora 400 10sp rgba(white,0.6)
  (Values pulled from user's actual account data via API)
```

**Body (scrollable, overlaps header by 52px with negative marginTop):**

Component order from top to bottom:

**1. Agni Connect Card**
```
Background: linear gradient #14562A → #1A7B3C
borderRadius: 20, padding:20, marginBottom:16
Box shadow: 0 8px 32px rgba(26,123,60,0.30)

Layout: Row
  Left: Rounded icon box (56x56, rgba(white,0.15), borderRadius:16)
        Bluetooth/signal icon inside
  Center text:
    "Connect Agni" — Sora 800 16sp white
    "Pair your soil sensor via Bluetooth" — 12sp rgba(white,0.65)
  Right: "Connect →" white pill button
    → onPress: navigate to live-connect tab

If Agni was recently connected (within session):
  Show "Agni Connected ✓" in green pill instead
  Show last sync time below
```

**2. Awards Ticker (horizontally scrolling marquee)**
```
Auto-scrolling (animateLoop with react-native-reanimated)
Pill badges: bg Colors.surfaceAlt, border Colors.border, Colors.primary text
Content: "🏆 State Level Winner 2025" | "⚡ < 60s Testing" | "🌿 Zero Chemicals" 
         "🗣 3 Lang AI" | "🏛 OSHEC Funded" | "🥇 Best Agritech Solution"
```

**3. Soil Health Score Card**
```
Card with SVG ring chart on left:
  - Circular progress ring (80x80)
  - Ring color: Colors.primary for filled, Colors.surfaceAlt for empty
  - Center text: score value (0-100) in Sora 800 18sp primary
  - Score calculated from: pH closeness to 7.0, NPK balance, moisture

Right of ring:
  - "Good Soil Health 🌱" or appropriate label — Sora 700 14sp
  - One-line insight — 12sp muted
  - Parameter chips row: "pH 6.8" "N: OK" "K: ↑"
    Each chip: bg surfaceAlt, borderRadius:8, 11sp Sora 600 primary

Data source: last sync'd soil test from database
If no data: show "No soil data yet. Connect Agni to start!" with CTA
```

**4. Quick Actions Grid (2x2)**
```
Each tile: bg Colors.background, borderRadius:16, padding:16
  - Icon in colored rounded box (44x44, borderRadius:14)
  - Title: Sora 700 13sp
  - Subtitle: 11sp muted

Tiles:
  [🤖 AI Assistant] [bg:surfaceAlt]  → navigate to ai-chat
  [📊 Analytics]    [bg:#FFF3E0]     → navigate to history
  [🗺 Field Map]    [bg:#E3F2FD]     → navigate to history (map tab)
  [🌤 Weather]      [bg:#F3E5F5]     → fetch local weather advisory
```

**5. Recent Tests Section (if data exists)**
```
Section header: "Recent Tests" + "View All →"
Horizontal scroll of compact test cards:
  Each: white card, 160px wide, padding:14
  - Date string
  - pH value (large, colored by range)
  - Field name
  - Tap → opens SoilDetailModal
```

---

### 4.6 LIVE CONNECT SCREEN

**File:** `app/(app)/live-connect.tsx`  
**Critical:** Keep all existing BLE scanning logic from `hooks/useBLE.ts`. Only redesign the UI layer.

**States to handle:**
1. **Idle** — "Ready to Scan" state
2. **Scanning** — radar animation playing
3. **Device Found** — show device card with name + signal strength
4. **Connected** — show connected state, begin data transfer
5. **Receiving Data** — show progress
6. **Data Received** — show soil results summary
7. **Error** — show error state with retry

**Idle State UI:**
```
Screen header: "Live Connect" Sora 800 24sp + subtitle 13sp muted

Main BLE Card (white, borderRadius:24, large):
  Radar animation container (140×140px circular):
    - bg Colors.surfaceAlt
    - Bluetooth icon at center (Sora green, 48sp)
    - Two concentric rings that pulse outward (reanimated):
        Ring 1: 80px diameter, opacity 0.8→0, scale 1→1.6, 2s loop
        Ring 2: 120px diameter, same animation, 0.5s delay
  
  Status text: "Ready to Connect" — Sora 700 16sp
  Sub text: "Make sure Agni device is powered on" — 13sp muted
  
  Scan Button: 
    Text: "📡 Scan for Agni Device"
    Style: full width, height 56, borderRadius:18, primary green

Quick Start Guide card (below):
  3 numbered steps with colored number badges:
    Step 1: green badge — "Power on Agni — hold orange button 2 seconds"
    Step 2: blue badge — "Tap Scan, select AGNI-SOIL-SENSOR from list"
    Step 3: amber badge — "Insert probes into soil — data transfers in ~60s"
```

**Scanning State UI:**
```
Replace scan button with "Stop Scanning" (grey)
Radar rings animate continuously
Status: "🔍 START SCAN (Agni only)" with spinner
Show list of discovered devices (non-Agni shown greyed out)
```

**Connected + Data Received UI:**
```
Replace radar with: ✅ green checkmark animation (Lottie)
Show Soil Analysis Results card:
  Header: "Soil Analysis Complete 🌱"
  Grid of parameter readings:
    pH: [value] | N (ppm): [value]
    P (ppm): [value]  | K (ppm): [value]
    Moisture: [value]% | EC: [value]
    Temperature: [value]°C | ...
  
  Each parameter chip shows color indicator:
    Green = optimal | Amber = borderline | Red = problematic
  
  CTA buttons row:
    "Get AI Analysis" (primary) → opens ai-chat with soil data pre-loaded
    "Save to History" (secondary) → saves to local DB + server
```

---

### 4.7 AI CHAT SCREEN

**File:** `app/(app)/ai-chat.tsx`  
**Keep:** All existing AI API integration, voice playback logic.  
**Add:** Chat session history sidebar (drawer), quick action cards, improved chat bubbles.

**Header bar:**
```
Left: AI bot avatar (40x40 green rounded square) + "Saathi AI" Sora 700 15sp
      + "● Online · Agricultural Expert" 12sp Colors.primary below
Right: Language selector (globe icon → LanguagePicker sheet)
       History icon (drawer icon → chat sessions list as bottom sheet)
```

**Welcome state (no messages yet):**
```
Center content:
  Saathi AI robot illustration (from existing assets)
  "Namaste! 🙏" — DM Serif Display 24sp (match website's heading style)
  "How can Saathi AI help your farm today?" — Sora 400 13sp muted

Quick action 2×2 grid:
  💧 Fertilizer Plan   | 🐛 Pest Diagnosis
  🌾 Crop Suitability  | 🌤 Weather Advisory
  
  Each: white card, border Colors.border, center-aligned
  Tap → pre-fills chat with that prompt context
```

**Chat message bubbles:**
```
AI bubble:
  - bg: white, border: 1px Colors.border
  - borderRadius: 4 16 16 16 (top-left flat = "tail" effect)
  - Text: Sora 400 13sp Colors.textPrimary, lineHeight 1.6
  - Below text: "🔊 Read aloud in [Language]" — tappable, 11sp Colors.primary
  - Avatar: 32px green rounded square with 🌱 icon

User bubble:
  - bg: Colors.primary
  - borderRadius: 16 4 16 16 (top-right flat)
  - Text: Sora 400 13sp white
  - Avatar: 32px amber rounded square with 👨‍🌾 icon

Typing indicator (AI):
  - Three green dots, animate bouncing in sequence

File attachment preview (for .json soil files):
  - Card with 📄 icon, filename, filesize
  - "Analyzing soil data..." shimmer while processing
```

**Input bar:**
```
Left: 📎 attachment icon (opens file picker for .json files)
Center: Text input field (bg Colors.background, border, borderRadius:14)
Right: 🎤 mic button (activate voice input via expo-speech)
       ▶ send button (Colors.primary circle, 48x48)
```

**Language switching:**
```
When language changed via selector:
  All UI labels, placeholder text, and AI responses switch to selected language
  AI is prompted: "Respond only in [selected language] from now on."
  Supported: English, हिंदी, ଓଡ଼ିଆ, मराठी, বাংলা, తెలుగు, தமிழ், اردو, ગુજરાતી, മലയാളം
```

---

### 4.8 HISTORY & ANALYTICS SCREEN

**File:** `app/(app)/history.tsx`  
**Keep:** All database queries, GPS location tagging, existing history log data.  
**Enhance:** Chart visualization, PDF export, improved list view.

**Header:**
```
"History" Sora 800 24sp + "Soil health trends over time" 13sp muted
Right: "⬆ Export PDF" button (green, height:44)
```

**Filter pills (horizontal scroll):**
```
Last 30 Days | Last 90 Days | Last Year | All Time | pH | N | P | K | Moisture
Active pill: bg Colors.primary, white text
Inactive: white bg, border, muted text
```

**Stats row (3 mini cards):**
```
Total Tests | Avg pH | Improvement (delta with ↑↓ arrow, colored)
Each: white card, borderRadius:16, center text, Sora 800 20sp primary value
```

**pH Trend Chart:**
```
Use react-native-chart-kit or victory-native
Bar chart showing selected parameter over selected time range
- X-axis: dates (abbreviated)
- Y-axis: parameter values
- Bar color: Colors.primary with 0.7 opacity
- Selected bar: full opacity
- Chart updates when filter pills change
- Loading skeleton while fetching
```

**Field Test Locations Map:**
```
Keep existing Leaflet map implementation (expo-web-view)
Map height: 200px, rounded top 0, borderRadius bottom 0
Pins colored by soil health:
  Green pin = Good (pH 6-7.5)
  Amber pin = Moderate (pH 5.5-6 or 7.5-8)
  Red pin = Poor (pH < 5.5 or > 8)
Tap pin → show popup with test summary
"Expand Map" button → opens full-screen map modal
```

**Test History Log:**
```
Each row:
  - Colored dot (green/amber/red based on pH)
  - Field name (Sora 700 13sp)
  - Date/time (11sp muted)
  - pH value right-aligned (Sora 800 16sp, colored)
  - "›" chevron → tap opens SoilDetailModal

SoilDetailModal (full bottom sheet, 90% screen height):
  Header: field name + date
  Two columns:
    Left: "Raw Data" — all 14 parameter readings
    Right: "AI Analysis" — AI-generated insights
      Sections: Soil Health Status | Key Issues | Recommended Treatments
                When to Apply | Expected Benefits
  Bottom: Share button + Save PDF button
```

**PDF Export (NEW FEATURE):**
```
Library: react-native-html-to-pdf or expo-print

PDF structure:
  Page 1: Summary (header, stats, map screenshot)
  Page 2+: Full test history table
  Last page: AI recommendations for each test

Export flow:
  1. "Export PDF" button tapped
  2. Bottom sheet: "Generating your soil report..." with progress
  3. Share sheet opens with generated PDF
  4. Options: Save to Files, Share via WhatsApp, Email

PDF filename format: "Saathi-SoilReport-[YYYY-MM-DD].pdf"
```

---

### 4.9 PROFILE & DRAWER SCREEN

**File:** `app/profile.tsx`  
**Access:** Tap user avatar in any screen header.

**Hero section:**
```
Background: linear gradient #0D3B1D → #1A7B3C
← Back button top-left
Center:
  Avatar (80x80, borderRadius:24, rgba(white,0.2), border rgba(white,0.4))
  User's first name initial as fallback emoji
  Full name — Sora 800 20sp white
  Email — Sora 400 13sp rgba(white,0.6)
  Status badge: "● Active · Member since [date]"
```

**Menu sections:**

```
Section 1 — Actions:
  🛒 Buy Agni Device    "Starting ₹4,699 · 22% off today"  → buy-agni screen
  👤 My Account         "Profile, security & data"          → account screen
  👑 Subscription       "Free plan · Upgrade for more"     → subscribe screen
  ⚙️  Settings          "Dark mode, language, sync"         → settings screen
  ❓  Help & Support    "FAQ, guides, contact us"            → help screen

Section 2 — Danger:
  🚪 Logout             Red text, tap → confirm dialog → clear token → auth/login
```

---

### 4.10 SETTINGS SCREEN

**File:** `app/settings.tsx`

**Sections:**

**Appearance:**
- Dark Mode toggle (use `@react-native-community/daynighttheme` or manual theme context)
- Compact Mode toggle

**Language & Region:**
- Language selector — BottomSheet picker with all 10 languages
- Updates `i18n` locale and AI chat language simultaneously

**Sync & Notifications:**
- Auto Sync toggle
- Push Notifications toggle (calls `requestPermissionsAsync` from expo-notifications on enable)
- Soil Alert Reminders toggle ("Remind me to test every 30 days")
- Alert Threshold setting: "Alert me when pH drops below [input]"

**Data Management:**
- Export All Data (JSON) button
- Download CSV button
- Clear Cache button

**Danger Zone:**
- Red-tinted card
- Delete Account → confirmation modal → API call → clear all local data → auth/login

---

### 4.11 SUBSCRIPTION SCREEN

**File:** `app/subscribe.tsx`

**Three plan cards:**

| Plan | Price | Color |
|------|-------|-------|
| Basic | ₹199/month | Green (surfaceAlt bg) |
| Pro | ₹499/month | Primary green (featured, "Most Popular" badge) |
| Premium | ₹999/month | Purple |

**Pro card extras:** `border: 2px Colors.primary`, elevated shadow, `position:relative` badge at top center.

**Feature lists per plan — Basic:**
- Up to 10 soil tests/month
- AI Chat (50 messages/month)
- Basic history & analytics
- English & Hindi only

**Feature lists per plan — Pro:**
- Unlimited soil tests
- Unlimited AI Chat with voice
- Full analytics + PDF export
- All 10 Indian languages
- Push notifications & smart alerts
- Priority email support

**Feature lists per plan — Premium:**
- Everything in Pro
- White-label PDF reports
- REST API access
- Dedicated agronomist access
- Custom branding on reports

**Payment:** Integrate Razorpay using `react-native-razorpay` package.

---

## SECTION 5 — NEW FEATURES (FULL SPECIFICATIONS)

### 5.1 PUSH NOTIFICATIONS SYSTEM

**Library:** `expo-notifications`

**Setup in `app.json`:**
```json
{
  "expo": {
    "plugins": [
      ["expo-notifications", {
        "icon": "./assets/notification-icon.png",
        "color": "#1A7B3C",
        "sounds": []
      }]
    ]
  }
}
```

**`services/notifications.ts`:**
```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) return null;
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
  // POST token to your backend: /api/users/push-token
}
```

**Notification types to implement:**

1. **Soil Alert** — "Your Field 2 pH has dropped to 5.2. Immediate attention needed 🔴"
2. **Test Reminder** — "It's been 30 days since your last soil test. Time to check your field! 🌾"
3. **AI Insight** — "Based on your recent data, rice planting season is approaching. Check your AI recommendations."
4. **Device Battery** — "Agni device battery low (15%). Please charge before your next scan."
5. **Sync Complete** — "3 soil tests synced from Agni device ✅"

**Local scheduled notifications (no server needed):**
```typescript
// Schedule monthly test reminder
await Notifications.scheduleNotificationAsync({
  content: {
    title: "Time for a soil test! 🌱",
    body: "It's been 30 days since your last scan.",
    data: { screen: 'live-connect' },
  },
  trigger: { seconds: 30 * 24 * 60 * 60, repeats: true },
});
```

**Tap handling — navigate to relevant screen:**
```typescript
Notifications.addNotificationResponseReceivedListener(response => {
  const screen = response.notification.request.content.data?.screen;
  if (screen) router.push(`/(app)/${screen}`);
});
```

---

### 5.2 IMPROVED BLE UX

**Problem with current APK:** Scanning shows a blank screen with just a spinning indicator and "START SCAN (Agni only)" text. No feedback, no guidance, no loading states.

**Improvements:**

1. **Animated radar** — two concentric rings pulse outward while scanning
2. **Device discovery list** — show discovered BLE devices in real-time as they appear, greyed out if not AGNI-SOIL-SENSOR
3. **Signal strength indicator** — show RSSI as bar graph (like WiFi bars) for each device
4. **Connection progress** — once paired, show: "Connecting... → Authenticating... → Syncing data..."
5. **Auto-reconnect** — if device was previously paired, show "Reconnect to AGNI-SOIL-SENSOR" as a shortcut button bypassing scan
6. **Error messages** — specific errors: "Bluetooth off → turn on", "Location permission required", "Device out of range", "Connection timed out"
7. **Success animation** — Lottie checkmark animation when data received successfully

---

### 5.3 OPENING APP ANIMATION

**Approach:** Use `expo-splash-screen` to hold the native splash, then run a custom Lottie animation.

**Animation sequence (2.2 seconds total):**
```
0ms:    Dark green background appears
100ms:  Saathi AI logo box fades+scales in (spring animation)
600ms:  "Saathi AI" text slides up from below, opacity 0→1
900ms:  Tagline text fades in
1200ms: Three loading dots pulse
1800ms: All elements fade out smoothly
2200ms: Navigate to appropriate screen
```

**Use `react-native-reanimated` for all animations:**
```typescript
// Logo entrance
const scale = useSharedValue(0.5);
const opacity = useSharedValue(0);

useEffect(() => {
  scale.value = withSpring(1, { damping: 12, stiffness: 100 });
  opacity.value = withTiming(1, { duration: 600 });
}, []);
```

---

### 5.4 PDF EXPORT

**Library:** `expo-print` + `expo-sharing`

**`services/pdfExport.ts`:**
```typescript
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export async function exportSoilReport(tests: SoilTest[], user: User) {
  const html = generateReportHTML(tests, user);
  const { uri } = await Print.printToFileAsync({ 
    html, 
    base64: false,
    filename: `Saathi-SoilReport-${new Date().toISOString().split('T')[0]}`
  });
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Share Soil Report',
    UTI: 'com.adobe.pdf',
  });
}

function generateReportHTML(tests: SoilTest[], user: User): string {
  return `
    <!DOCTYPE html><html>
    <head><style>
      body { font-family: Arial; margin: 40px; }
      .header { background: #1A7B3C; color: white; padding: 20px; border-radius: 8px; }
      .stat { display: inline-block; margin: 10px; padding: 10px 20px; border: 1px solid #C8E6D0; border-radius: 8px; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th { background: #E8F7ED; padding: 10px; text-align: left; font-size: 12px; }
      td { padding: 8px 10px; border-bottom: 1px solid #f0f0f0; font-size: 12px; }
      .good { color: #1A7B3C; font-weight: bold; }
      .warn { color: #F4A02D; font-weight: bold; }
      .bad  { color: #E53935; font-weight: bold; }
    </style></head>
    <body>
      <div class="header">
        <h1>🌱 Saathi AI Soil Report</h1>
        <p>${user.name} · Generated ${new Date().toLocaleDateString('en-IN')}</p>
      </div>
      <!-- stats, table, AI insights rendered here -->
    </body></html>
  `;
}
```

---

## SECTION 6 — AUTHENTICATION INTEGRATION

### 6.1 Backend API Endpoints (already exist on saathiai.org backend)

```
POST /api/auth/login        { username_or_email, password } → { token, user }
POST /api/auth/register     { name, email, phone?, password } → { message }
POST /api/auth/verify-otp   { email, otp } → { token, user }
POST /api/auth/resend-otp   { email } → { message }
POST /api/auth/google       { id_token } → { token, user }
POST /api/auth/logout       (bearer token) → { message }
GET  /api/auth/me           (bearer token) → { user }
```

### 6.2 Auth State Management

**`store/authStore.ts` using Zustand + AsyncStorage:**
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthStore {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      isAuthenticated: () => !!get().token,
    }),
    { name: 'saathi-auth', storage: createJSONStorage(() => AsyncStorage) }
  )
);
```

### 6.3 API Client

```typescript
// services/api.ts
import { useAuthStore } from '@/store/authStore';

const BASE_URL = 'https://saathiai.org/api';

export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = useAuthStore.getState().token;
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}
```

### 6.4 Route Protection

**`app/(app)/_layout.tsx`:**
```typescript
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function AppLayout() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated());
  if (!isAuthenticated) return <Redirect href="/auth/login" />;
  return <Tabs>...</Tabs>;
}
```

---

## SECTION 7 — EAS BUILD CONFIGURATION

### 7.1 `eas.json`

```json
{
  "cli": { "version": ">= 5.9.1" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": { "buildType": "apk" },
      "ios": { "simulator": true }
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" },
      "ios": { "simulator": false }
    },
    "production": {
      "android": { "buildType": "app-bundle" },
      "ios": {}
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./service-account.json",
        "track": "internal"
      },
      "ios": {
        "appleId": "YOUR_APPLE_ID",
        "ascAppId": "YOUR_APP_ID",
        "appleTeamId": "YOUR_TEAM_ID"
      }
    }
  }
}
```

### 7.2 `app.json` key fields

```json
{
  "expo": {
    "name": "Saathi AI",
    "slug": "saathi-ai",
    "version": "2.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0D3B1D"
    },
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "org.saathiai.app",
      "buildNumber": "1",
      "infoPlist": {
        "NSBluetoothAlwaysUsageDescription": "Saathi AI needs Bluetooth to connect to your Agni soil sensor device.",
        "NSBluetoothPeripheralUsageDescription": "Saathi AI uses Bluetooth to receive soil analysis data from Agni.",
        "NSLocationWhenInUseUsageDescription": "Saathi AI uses your location to tag soil test results to specific field coordinates.",
        "NSMicrophoneUsageDescription": "Saathi AI uses the microphone for voice queries to the AI assistant."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#1A7B3C"
      },
      "package": "org.saathiai.app",
      "versionCode": 1,
      "permissions": [
        "BLUETOOTH", "BLUETOOTH_ADMIN", "BLUETOOTH_SCAN", "BLUETOOTH_CONNECT",
        "ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION",
        "RECORD_AUDIO", "RECEIVE_BOOT_COMPLETED",
        "VIBRATE", "WAKE_LOCK"
      ]
    },
    "plugins": [
      "expo-router",
      "expo-font",
      ["expo-notifications", { "icon": "./assets/notification-icon.png", "color": "#1A7B3C" }],
      ["expo-location", { "locationWhenInUsePermission": "Allow Saathi AI to use your location for field mapping." }],
      "expo-print",
      "expo-sharing"
    ]
  }
}
```

---

## SECTION 8 — PACKAGE DEPENDENCIES

### 8.1 New packages to install

```bash
# Core
npx expo install expo-router expo-font @expo-google-fonts/sora
npx expo install zustand @react-native-async-storage/async-storage

# Auth
npx expo install expo-auth-session expo-web-browser expo-crypto

# Notifications
npx expo install expo-notifications expo-device

# Animations
npx expo install react-native-reanimated react-native-gesture-handler
npx expo install lottie-react-native

# BLE (keep existing, but add)
npx expo install react-native-ble-manager  # if not already

# PDF & Sharing
npx expo install expo-print expo-sharing expo-file-system

# Charts
npm install react-native-chart-kit react-native-svg

# Toast notifications
npm install react-native-toast-message

# Location
npx expo install expo-location

# Payment
npm install react-native-razorpay

# Blur effect (tab bar)
npx expo install @react-native-community/blur
```

### 8.2 Remove / replace

```bash
# Remove if present (conflicts with expo-router)
# react-navigation (if used directly — expo-router wraps it)

# Replace
# Any custom navigation setup → expo-router file-based routing
```

---

## SECTION 9 — STEP-BY-STEP BUILD ORDER

Execute these phases in order. Do not skip ahead.

### Phase 1 — Foundation (Day 1)
```
1. Fork sanatan223/mitti → NilambarSonu/saathi-native
2. Clean up root: remove duplicate configs, legacy nav files
3. Install all new dependencies (Section 8)
4. Set up constants/Colors.ts, constants/Spacing.ts
5. Load Sora font globally in app/_layout.tsx
6. Set up authStore.ts with Zustand + AsyncStorage
7. Set up Expo Router file structure (create all route files as stubs)
8. Configure eas.json and update app.json (Section 7)
9. Verify: dev build runs without errors
```

### Phase 2 — Auth Flow (Day 2)
```
10. Build Splash screen with animations
11. Build 3-slide Onboarding with gesture swipe
12. Build Login screen (hero + card + form + social buttons)
13. Build Register screen (all fields + verification method selector)
14. Build OTP verification screen (6 boxes + auto-advance + countdown)
15. Connect all auth screens to API (saathiai.org backend)
16. Implement route protection in (app)/_layout.tsx
17. Test full auth flow: register → OTP → dashboard → logout → login
```

### Phase 3 — Core Screens (Day 3-4)
```
18. Build custom bottom TabBar component
19. Build Dashboard screen (all 5 sections)
20. Keep all existing Live Connect BLE logic, build new UI on top
21. Keep all existing AI Chat logic, build new UI
22. Keep all existing History DB logic, build new UI + add charts
23. Build Profile drawer screen
24. Build About screen
```

### Phase 4 — New Features (Day 5)
```
25. Implement push notifications (setup + all 5 notification types)
26. Build improved BLE UX (radar + device list + progress states)
27. Implement PDF export from History
28. Build Settings screen with all toggles functional
29. Build Subscribe screen with Razorpay integration
30. Build Buy Agni screen (product page)
```

### Phase 5 — Polish & Launch (Day 6-7)
```
31. Add all micro-animations with react-native-reanimated
32. Test on real Android device + iOS simulator
33. Test all BLE scenarios (Agni connected / not found / timeout)
34. Test all auth scenarios (wrong password, expired OTP, network error)
35. Run `eas build --platform android --profile preview` → generate APK
36. Run `eas build --platform ios --profile production` → generate IPA
37. Submit to Play Store internal track + App Store TestFlight
```

---

## SECTION 10 — KNOWN ISSUES TO FIX FROM CURRENT APK

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| 1 | No authentication | App-wide | Implement full auth flow (Section 4.3–4.4) |
| 2 | Plain BLE scan screen | LiveConnect | New radar UI + device list + progress |
| 3 | Generic default font | App-wide | Replace with Sora font (Section 2.1) |
| 4 | Flat, colorless cards | Dashboard | Green gradient header + styled cards |
| 5 | No opening animation | Splash | Build animated splash (Section 5.3) |
| 6 | No onboarding | First launch | Build 3-slide onboarding (Section 4.2) |
| 7 | AI Chat plain bubbles | AIChat | New bubble design + read-aloud button |
| 8 | History no charts | History | Add bar chart + improved map card |
| 9 | No PDF export | History | Implement expo-print export (Section 5.4) |
| 10 | No push notifications | App-wide | Implement full notification system (Section 5.1) |
| 11 | About page static | About | Redesign with team cards + testimonials + contact |
| 12 | No profile/drawer | Profile | Build profile screen with full menu (Section 4.9) |
| 13 | No settings | Settings | Build settings screen (Section 4.10) |
| 14 | No subscription page | Subscribe | Build 3-tier plan UI with Razorpay (Section 4.11) |
| 15 | APK only | Build | Configure EAS for iOS + Android production builds |

---

## SECTION 11 — QUALITY CHECKLIST

Before considering any screen complete, verify:

**Visual:**
- [ ] Uses Sora font at all text elements
- [ ] Colors match exactly from Colors.ts
- [ ] Spacing uses Spacing constants
- [ ] Cards have correct borderRadius (16–24) and shadows
- [ ] Bottom tab bar visible on all main screens
- [ ] Status bar style set correctly (light on dark headers, dark on white)

**Functional:**
- [ ] All buttons have `activeOpacity={0.85}` or Animated scale feedback
- [ ] Loading states exist for all async operations
- [ ] Error states exist with retry mechanisms
- [ ] Empty states exist (no tests yet, no chat history, etc.)
- [ ] Keyboard handling: input fields don't get hidden behind keyboard
- [ ] Safe area insets handled via `useSafeAreaInsets()`

**Performance:**
- [ ] FlatList used for all scrollable lists (never ScrollView + map())
- [ ] Images optimized and using expo-image
- [ ] No blocking operations on main thread
- [ ] Memoization used on heavy components

**Accessibility:**
- [ ] Touch targets minimum 44×44px
- [ ] accessibilityLabel on all interactive elements
- [ ] Screen reader compatible (VoiceOver / TalkBack)

---

## SECTION 12 — IMPORTANT NOTES FOR ANTIGRAVITY

1. **Do not modify the backend.** The saathiai.org API is live and functional. Only integrate with it — never change it.

2. **The BLE hook is the most critical piece of code.** The existing `hooks/useBLE.ts` connects to the Agni ESP32-S3 hardware device broadcasting as `AGNI-SOIL-SENSOR`. Only wrap it in new UI — do not rewrite the BLE scanning/pairing logic.

3. **Font loading is synchronous gate.** The Sora font must be fully loaded before rendering any UI. Use `expo-splash-screen.preventAutoHideAsync()` and only hide after fonts load.

4. **Multilingual state is global.** The language selection must propagate to: UI labels, AI chat language, voice output language, PDF report language. Store language choice in AsyncStorage and restore on app launch.

5. **For iOS BLE:** Bluetooth requires `NSBluetoothAlwaysUsageDescription` in infoPlist (already specified in app.json above). Without this, App Store review will reject the build.

6. **Expo Go vs Dev Build.** BLE does not work in Expo Go. Always test BLE features using `expo-dev-client` or a full EAS build.

7. **Authentication tokens.** JWT tokens from saathiai.org expire in 7 days. Implement token refresh logic: on any 401 response, call `/api/auth/refresh` → if that also fails, redirect to login.

8. **The app name in stores must be "Saathi AI"** — this is the brand, not "mitti" (the repo name). Update all display names in app.json and store listings.

9. **Razorpay integration** requires a `razorpay_key_id` from the Mitti-AI Innovations Razorpay account. Use environment variables via `expo-constants` — never hardcode keys in source.

10. **PDF report branding:** The exported PDF header must show the Saathi AI logo, user's name, farm location, and report date. Footer: "Mitti-AI Innovations · saathiai.org · © 2026". This is a compliance and brand requirement.

---

*Document prepared for Mitti-AI Innovations by Claude (Anthropic) — March 2026*  
*Ref: saathiai.org (live website) · github.com/sanatan223/mitti (source repo)*  
*Contact: saathi.ai.innovation@gmail.com · FMU-TBI, Balasore, Odisha, India*
