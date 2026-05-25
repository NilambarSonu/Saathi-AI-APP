# 🚀 Saathi AI APK - Project Architecture & Structure

This document provides a comprehensive overview of the **Saathi AI** mobile application's folder structure, architectural patterns, and development guidelines.

---

## 📂 Directory Tree

```text
Saathi AI APK/
├── 🌐 app/                      # Expo Router (Navigation Layer)
│   ├── (app)/                   # Authenticated Routes
│   │   ├── about.tsx            # About Saathi AI
│   │   ├── ai-chat.tsx          # AI Assistant Interface
│   │   ├── buy-agni.tsx         # Product Purchase Page
│   │   ├── chat-history.tsx     # Past Conversations
│   │   ├── connect.tsx          # BLE Device Connection
│   │   ├── history.tsx          # Soil Test History
│   │   ├── index.tsx            # Main Dashboard Route
│   │   ├── settings.tsx         # User Preferences
│   │   └── _layout.tsx          # App Shell (Tabs/Drawer)
│   ├── (auth)/                  # Authentication Flow
│   │   ├── forgot-password.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── verify-otp.tsx
│   │   └── _layout.tsx
│   ├── (onboarding)/            # User Welcome Experience
│   │   ├── index.tsx
│   │   └── _layout.tsx
│   ├── index.tsx                # Entry/Redirect Logic
│   ├── splash.tsx               # Custom Splash Screen
│   └── _layout.tsx              # Root Provider Wrapper
├── 🏗️ src/                       # Core Application Logic
│   ├── 📡 api/                  # API Infrastructure
│   │   └── axiosConfig.ts       # Global Interceptors
│   ├── 🧩 components/           # Reusable UI Components
│   │   ├── ui/                  # Atomic Design Primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── FuturisticButton.tsx
│   │   ├── navigation/          # Navigation-specific UI
│   │   │   ├── LiquidGlassTabBar.tsx
│   │   │   └── SwipeContainer.tsx
│   │   ├── AgniPulseAnimation.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── MapBottomSheet.tsx
│   │   └── MapComponent.tsx
│   ├── ⚖️ constants/            # Design System & Configuration
│   │   ├── Animations.ts        # Lottie References
│   │   ├── Colors.ts            # Palette Tokens
│   │   ├── Shadows.ts           # Depth Tokens
│   │   ├── Spacing.ts           # Layout Tokens
│   │   └── Typography.ts        # Font Tokens
│   ├── 🖇️ context/              # React Context Providers
│   │   └── SoilMarkersContext.tsx # Map Marker Management
│   ├── 🧪 features/             # Domain-Driven Modules
│   │   ├── ai_assistant/        # Chatbot Business Logic
│   │   │   ├── hooks/useChat.ts
│   │   │   └── services/chat.ts
│   │   ├── auth/                # Identity Management
│   │   │   └── services/auth.ts
│   │   ├── hardware_ble/        # IoT Connectivity
│   │   │   ├── hooks/useBLE.ts
│   │   │   └── services/bleService.ts
│   │   └── soil_analysis/       # Core Analytical Engine
│   │       ├── hooks/useSoil.ts
│   │       └── services/soil.ts
│   ├── 📱 screens/              # Screen-level Components
│   │   ├── ChatScreen.tsx       # Logic-heavy Screen Views
│   │   ├── ConnectScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── HistoryScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── 🛠️ services/             # Cross-cutting Infrastructure
│   │   ├── storage/             # Persistence (AsyncStorage/MMKV)
│   │   │   └── datastorage.tsx
│   │   ├── analytics.ts         # User Tracking
│   │   ├── api.ts               # General API Wrappers
│   │   ├── notifications.ts     # Push/Local Alerts
│   │   └── pdfExport.ts         # Report Generation
│   └── 🧠 store/                # Global State (Zustand)
│       ├── authStore.ts
│       ├── navigationStore.ts
│       └── tabBarStore.ts
├── 🎨 assets/                   # Static Media & Resources
│   ├── animations/              # Lottie JSON Files
│   ├── fonts/                   # Brand Typography
│   ├── images/                  # Visual Assets (Farmer icons, UI)
│   └── videos/                  # Technology Demos
└── ⚙️ Root Config Files
    ├── app.json                 # Expo Configuration
    ├── babel.config.js          # Path Aliasing (@/*)
    ├── package.json             # Dependencies
    └── tsconfig.json            # TypeScript Configuration
```

---

## 🏛️ Architectural Principles

1. **Feature-First Organization**: Code is grouped by what it *does* (e.g., `soil_analysis`) rather than what it *is* (e.g., `components`). This keeps modules self-contained.
2. **Thin Routing Layer**: The `app/` directory should only handle navigation and layout. All business logic and UI should reside in `src/`.
3. **Absolute Path Aliasing**: We use `@/` to refer to the `src/` directory, avoiding deep relative imports like `../../../../`.
4. **Separation of Concerns**:
   - **Services**: Pure logic (API calls, calculations).
   - **Hooks**: React state wrappers for services.
   - **Screens**: Orchestration of hooks and components.
   - **Components**: Purely visual or small reusable logic blocks.

---

## 🛠️ Developer Workflow

- **Adding a new feature**: Create a new folder in `src/features/[feature_name]` with `hooks` and `services` subfolders.
- **Adding a new screen**: Create the route in `app/` and the actual screen component in `src/screens/`.
- **Global State**: Use Zustand stores in `src/store/` for cross-component data persistence.
- **Styling**: Utilize tokens from `src/constants/` to ensure visual consistency.

---

## 📦 Tech Stack

- **Core**: React Native / Expo
- **Routing**: Expo Router (v3+)
- **State**: Zustand
- **Animation**: React Native Reanimated & Lottie
- **Connectivity**: React Native BLE Manager
- **Maps**: React Native Maps
- **Networking**: Axios with centralized config
