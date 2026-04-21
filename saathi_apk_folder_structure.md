# Saathi AI APK Folder Structure

`	ext
Saathi AI APK
├── .gitattributes
├── .gitignore
├── LICENSE
├── SQL-QUERIES.sql
├── android
│   ├── .gitignore
│   ├── .kotlin
│   │   └── sessions
│   ├── app
│   │   ├── build.gradle
│   │   ├── debug.keystore
│   │   ├── proguard-rules.pro
│   │   └── src
│   │       ├── debug
│   │       │   └── AndroidManifest.xml
│   │       ├── debugOptimized
│   │       │   └── AndroidManifest.xml
│   │       └── main
│   │           ├── AndroidManifest.xml
│   │           ├── java
│   │           │   └── org
│   │           │       └── saathiai
│   │           │           └── app
│   │           │               ├── MainActivity.kt
│   │           │               └── MainApplication.kt
│   │           └── res
│   │               ├── drawable
│   │               │   ├── ic_launcher_background.xml
│   │               │   └── rn_edit_text_material.xml
│   │               ├── drawable-hdpi
│   │               │   └── splashscreen_logo.png
│   │               ├── drawable-mdpi
│   │               │   └── splashscreen_logo.png
│   │               ├── drawable-xhdpi
│   │               │   └── splashscreen_logo.png
│   │               ├── drawable-xxhdpi
│   │               │   └── splashscreen_logo.png
│   │               ├── drawable-xxxhdpi
│   │               │   └── splashscreen_logo.png
│   │               ├── mipmap-anydpi-v26
│   │               │   ├── ic_launcher.xml
│   │               │   └── ic_launcher_round.xml
│   │               ├── mipmap-hdpi
│   │               │   ├── ic_launcher.webp
│   │               │   ├── ic_launcher_foreground.webp
│   │               │   └── ic_launcher_round.webp
│   │               ├── mipmap-mdpi
│   │               │   ├── ic_launcher.webp
│   │               │   ├── ic_launcher_foreground.webp
│   │               │   └── ic_launcher_round.webp
│   │               ├── mipmap-xhdpi
│   │               │   ├── ic_launcher.webp
│   │               │   ├── ic_launcher_foreground.webp
│   │               │   └── ic_launcher_round.webp
│   │               ├── mipmap-xxhdpi
│   │               │   ├── ic_launcher.webp
│   │               │   ├── ic_launcher_foreground.webp
│   │               │   └── ic_launcher_round.webp
│   │               ├── mipmap-xxxhdpi
│   │               │   ├── ic_launcher.webp
│   │               │   ├── ic_launcher_foreground.webp
│   │               │   └── ic_launcher_round.webp
│   │               ├── values
│   │               │   ├── colors.xml
│   │               │   ├── strings.xml
│   │               │   └── styles.xml
│   │               └── values-night
│   │                   └── colors.xml
│   ├── build.gradle
│   ├── gradle
│   │   └── wrapper
│   │       ├── gradle-wrapper.jar
│   │       └── gradle-wrapper.properties
│   ├── gradle.properties
│   ├── gradlew
│   ├── gradlew.bat
│   ├── hs_err_pid14436.log
│   ├── hs_err_pid18164.log
│   ├── hs_err_pid2160.log
│   ├── hs_err_pid24112.log
│   ├── hs_err_pid33232.log
│   ├── replay_pid18164.log
│   ├── replay_pid24112.log
│   └── settings.gradle
├── android_build_log.txt
├── animations
│   ├── Bluetooth-icon.json
│   ├── Bluetooth.json
│   ├── Brain.json
│   ├── Microscope.json
│   ├── Order-now.json
│   ├── chatbot.json
│   ├── history-trend.json
│   ├── soil-analysis-data.json
│   └── vs.json
├── app
│   ├── (app)
│   │   ├── _layout.tsx
│   │   ├── about.tsx
│   │   ├── ai-chat.tsx
│   │   ├── buy-agni.tsx
│   │   ├── chat-history.tsx
│   │   ├── connect.tsx
│   │   ├── history.tsx
│   │   ├── index.tsx
│   │   └── settings.tsx
│   ├── (auth)
│   │   ├── _layout.tsx
│   │   ├── forgot-password.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── verify-otp.tsx
│   ├── (onboarding)
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   ├── +native-intent.tsx
│   ├── +not-found.tsx
│   ├── _layout.tsx
│   ├── index.tsx
│   └── splash.tsx
├── app.config.js
├── app.json
├── app_backup
│   ├── (tabs)
│   │   ├── _layout.tsx
│   │   ├── about.tsx
│   │   ├── ai-chat.tsx
│   │   ├── history.tsx
│   │   ├── index.tsx
│   │   └── live-connect.tsx
│   ├── assets
│   │   ├── animation
│   │   │   └── useCountUp.js
│   │   ├── fonts
│   │   │   └── SpaceMono-Regular.ttf
│   │   └── images
│   │       ├── adaptive-icon.png
│   │       ├── favicon.png
│   │       ├── icon.png
│   │       ├── partial-react-logo.png
│   │       ├── react-logo.png
│   │       ├── react-logo@2x.png
│   │       ├── react-logo@3x.png
│   │       └── splash-icon.png
│   ├── connect.ts
│   └── context
│       └── LanguageContext.tsx
├── assets
│   └── images
│       ├── favicon.png
│       ├── icon.png
│       └── splash.png
├── babel.config.js
├── build.log
├── components
│   ├── AgniPulseAnimation.tsx
│   ├── ErrorBoundary.tsx
│   ├── MapBottomSheet.tsx
│   ├── MapComponent.tsx
│   └── navigation
│       └── SwipePage.tsx
├── components_backup
│   ├── Collapsible.tsx
│   ├── ExternalLink.tsx
│   ├── HapticTab.tsx
│   ├── HelloWave.tsx
│   ├── IconSymbol.ios.tsx
│   ├── IconSymbol.tsx
│   ├── Languageselector.tsx
│   ├── ParallaxScrollView.tsx
│   ├── TabBarBackground.ios.tsx
│   ├── TabBarBackground.tsx
│   ├── ThemedText.tsx
│   └── ThemedView.tsx
├── config
│   └── api.ts
├── constants
│   ├── Animations.ts
│   ├── Colors.ts
│   ├── Shadows.ts
│   ├── Spacing.ts
│   └── Typography.ts
├── context
│   └── SoilMarkersContext.tsx
├── create-dirs.js
├── database
│   └── datastorage.tsx
├── eas.json
├── hooks
├── hooks_backup
│   ├── useColorScheme.ts
│   ├── useColorScheme.web.ts
│   └── useThemeColor.ts
├── hs_err_pid21128.log
├── hs_err_pid24172.log
├── hs_err_pid28712.log
├── hs_err_pid29000.log
├── hs_err_pid31348.log
├── hs_err_pid32984.log
├── hs_err_pid4056.log
├── index.js
├── ios
│   ├── .gitignore
│   ├── .xcode.env
│   ├── Podfile
│   ├── Podfile.properties.json
│   ├── example
│   │   ├── AppDelegate.swift
│   │   ├── Images.xcassets
│   │   │   ├── AppIcon.appiconset
│   │   │   │   └── Contents.json
│   │   │   ├── Contents.json
│   │   │   └── SplashScreenLegacy.imageset
│   │   │       ├── Contents.json
│   │   │       └── SplashScreenLegacy.png
│   │   ├── Info.plist
│   │   ├── SplashScreen.storyboard
│   │   ├── Supporting
│   │   │   └── Expo.plist
│   │   └── example-Bridging-Header.h
│   └── example.xcodeproj
│       ├── project.pbxproj
│       └── xcshareddata
│           └── xcschemes
│               └── example.xcscheme
├── metro.config.js
├── package-lock.json
├── package.json
├── public
│   ├── Agni_Device.png
│   ├── Farmer_Icon
│   │   ├── farmer (1).png
│   │   ├── farmer (2).png
│   │   ├── farmer (3).png
│   │   ├── farmer (4).png
│   │   └── farmer.png
│   ├── agni_detail_1.png
│   ├── agni_detail_2.png
│   ├── auth_screen_laptop.png
│   ├── auth_screen_mobile.png
│   ├── chat-sidebar-close.png
│   ├── chat-sidebar-open.png
│   ├── co-founder.png
│   ├── favicon.png
│   ├── founder.png
│   ├── global-menu.png
│   ├── helpdesk.png
│   └── videos
│       ├── demo_calibration.mp4
│       ├── demo_field.mp4
│       ├── demo_night.mp4
│       └── demo_tech.mp4
├── replay_pid24172.log
├── replay_pid28712.log
├── replay_pid29000.log
├── replay_pid31348.log
├── replay_pid32984.log
├── replay_pid4056.log
├── routes.ts
├── saathi_apk_folder_structure.md
├── services
│   ├── analytics.ts
│   └── pdfExport.ts
├── src
│   ├── contexts
│   ├── core
│   │   └── services
│   │       ├── analytics.ts
│   │       ├── api.ts
│   │       ├── notifications.ts
│   │       └── pdfExport.ts
│   ├── features
│   │   ├── ai_assistant
│   │   │   ├── hooks
│   │   │   │   └── useChat.ts
│   │   │   └── services
│   │   │       └── chat.ts
│   │   ├── auth
│   │   │   └── services
│   │   │       ├── auth.ts
│   │   │       └── user.ts
│   │   ├── hardware_ble
│   │   │   ├── hooks
│   │   │   │   └── useBLE.ts
│   │   │   └── services
│   │   │       └── bleService.ts
│   │   └── soil_analysis
│   │       ├── hooks
│   │       │   └── useSoil.ts
│   │       └── services
│   │           └── soil.ts
│   ├── screens
│   │   ├── ChatScreen.tsx
│   │   ├── ConnectScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── HistoryScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── shared
│   │   ├── components
│   │   │   ├── navigation
│   │   │   │   ├── LiquidGlassTabBar.tsx
│   │   │   │   └── SwipeContainer.tsx
│   │   │   └── ui
│   │   │       ├── Button.tsx
│   │   │       ├── Card.tsx
│   │   │       └── FuturisticButton.tsx
│   │   └── hooks
│   │       └── useScrollHideTabBar.ts
│   └── store
│       ├── navigationStore.ts
│       └── tabBarStore.ts
├── store
│   └── authStore.ts
└── tsconfig.json
`
