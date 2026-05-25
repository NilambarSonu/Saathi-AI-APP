# Android APK Build Issues - Comprehensive Fix Prompt

## Overview
The Expo React Native Android build has multiple deprecation warnings and configuration issues preventing successful APK generation. The build process is failing at gradle compilation stage with 86% progress.

## Critical Issues to Fix

### 1. **AndroidManifest.xml Package Attribute Deprecations**
Multiple third-party libraries still use the deprecated `package` attribute in their AndroidManifest.xml files:
- `@react-native-async-storage/async-storage` - package="com.reactnativecommunity.asyncstorage"
- `@react-native-community/blur` - package="com.reactnativecommunity.blurview"
- `react-native-get-random-values` - package="org.linusu"
- `react-native-razorpay` - package="com.razorpay.rn"
- `react-native-safe-area-context` - package="com.th3rdwave.safeareacontext"
- `react-native-vector-icons` - package="com.oblador.vectoricons"
- `react-native-view-shot` - package="fr.greweb.reactnativeviewshot"

**Fix Strategy**: Update all deprecated packages to their latest versions that support modern Android namespace configuration.

### 2. **Razorpay Namespace Conflict**
Two Razorpay modules have the same namespace:
- `com.razorpay:standard-core:1.7.1`
- `com.razorpay:core:1.0.1`

Both declare namespace 'com.razorpay' which causes conflicts.

**Fix Strategy**: 
- Upgrade Razorpay to latest version or
- Remove duplicate dependency from gradle

### 3. **Kotlin Deprecation Warnings**
Multiple node_modules packages use deprecated Kotlin APIs:
- `lottie-react-native` - Using deprecated MapBuilder
- `react-native-screens` - Using deprecated ReactNativeHost
- `expo-modules-core` - Using deprecated UIManagerType.DEFAULT
- `react-native-webview` - Using deprecated WebSettings methods
- `react-native-gesture-handler` - Parameter naming mismatches

**Fix Strategy**: Update all packages to latest versions compatible with React Native 0.75+ and Kotlin 2.0.21

### 4. **Build Configuration Issues**
- Configuration on demand is incubating feature
- Gradle daemon reuse issues
- Missing cleartext traffic declarations in debug manifests

**Fix Strategy**: Update gradle wrapper and build.gradle configuration

### 5. **Java Deprecated API Warnings**
Multiple packages use deprecated Java APIs:
- Async storage with unchecked operations
- BLE Plx with unsafe operations
- Maps, Reanimated, SVG with deprecations

## Recommended Action Plan

### Step 1: Update Dependencies
```bash
npm update
# Or selectively update problematic packages:
npm install react-native-async-storage@latest --save
npm install @react-native-community/blur@latest --save
npm install react-native-razorpay@latest --save
npm install react-native-screens@latest --save
npm install lottie-react-native@latest --save
npm install react-native-webview@latest --save
npm install react-native-gesture-handler@latest --save
npm install expo@latest --save
```

### Step 2: Update Gradle Configuration
- Upgrade gradle wrapper to version 8.14.3 or later
- Update android/gradle.properties with latest SDK versions
- Configure kotlin-stdlib compatibility

### Step 3: Configure Build Suppressions
Add to android/app/build.gradle:
```gradle
android {
    ...
    lint {
        disable 'AndroidManifestTypo'
        disable 'MissingDimensionActivityCreator'
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
```

### Step 4: Clean and Rebuild
```bash
npx expo cache clear
rm -rf android/build
rm -rf node_modules/.cache
npx expo prebuild --clean
npx expo run:android
```

## Expected Outcome
- All AndroidManifest.xml deprecation warnings eliminated
- No namespace conflicts in dependencies
- Successful APK generation
- Reduced Kotlin/Java deprecation warnings
- Faster gradle build times

## Notes
- This build is still running (86% complete at mergeExtDexDebug)
- Wait for current build to complete or kill gradle daemon before attempting fixes
- Ensure device is properly authorized with USB debugging enabled
- Test on actual device after successful build
