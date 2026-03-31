import React, { useEffect, useRef } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDecay,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type SwipePageProps = {
  children: React.ReactNode;
  leftRoute?: string;
  rightRoute?: string;
};

// ─── Premium Swipe Configuration (Instagram/CRED-like) ───────────────────────
const SWIPE_CONFIG = {
  // Velocity threshold for quick swipe (pixels/second)
  VELOCITY_THRESHOLD: 500,
  
  // Distance threshold for slower drag
  DISTANCE_THRESHOLD: SCREEN_WIDTH * 0.30, // 30% of screen width
  
  // Maximum edge resistance distance
  MAX_RESISTANCE_DISTANCE: SCREEN_WIDTH * 0.15, // 15% of screen
  
  // Resistance factor at edges (0.3 = 70% resistance)
  EDGE_RESISTANCE: 0.3,
  
  // Spring animation config (60 FPS smooth)
  SPRING: {
    damping: 22,
    stiffness: 150,
    mass: 0.8,
  },
  
  // Timing animation for navigation
  NAVIGATION_TIMING: {
    duration: 280,
  },
};

export default function SwipePage({ children, leftRoute, rightRoute }: SwipePageProps) {
  const router = useRouter();
  const swipeX = useSharedValue(0);
  const isNavigatingRef = useRef(false);

  const navigateTo = (target?: string) => {
    if (!target || isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    router.replace(target as any);
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 500);
  };

  useEffect(() => {
    if (leftRoute) router.prefetch(leftRoute as any);
    if (rightRoute) router.prefetch(rightRoute as any);
  }, [leftRoute, rightRoute, router]);

  const gesture = Gesture.Pan()
    .activeOffsetX([-12, 12]) // Start gesture sooner for smoother feel
    .failOffsetY([-18, 18])   // Allow more vertical movement before failing
    .onUpdate((event) => {
      let translationX = event.translationX;
      
      // Apply edge resistance
      if (translationX > 0 && !rightRoute) {
        // Right edge - no right route available
        translationX *= SWIPE_CONFIG.EDGE_RESISTANCE;
      } else if (translationX < 0 && !leftRoute) {
        // Left edge - no left route available
        translationX *= SWIPE_CONFIG.EDGE_RESISTANCE;
      } else if (translationX > SWIPE_CONFIG.MAX_RESISTANCE_DISTANCE) {
        // Beyond max resistance distance
        const excess = translationX - SWIPE_CONFIG.MAX_RESISTANCE_DISTANCE;
        translationX = SWIPE_CONFIG.MAX_RESISTANCE_DISTANCE + excess * SWIPE_CONFIG.EDGE_RESISTANCE;
      } else if (translationX < -SWIPE_CONFIG.MAX_RESISTANCE_DISTANCE) {
        // Beyond max resistance distance (left)
        const excess = Math.abs(translationX) - SWIPE_CONFIG.MAX_RESISTANCE_DISTANCE;
        translationX = -(SWIPE_CONFIG.MAX_RESISTANCE_DISTANCE + excess * SWIPE_CONFIG.EDGE_RESISTANCE);
      }
      
      swipeX.value = translationX;
    })
    .onEnd((event) => {
      const velocity = event.velocityX;
      const distance = event.translationX;
      
      // Velocity-based snapping (Instagram-style)
      const shouldSwipeLeft = 
        (velocity < -SWIPE_CONFIG.VELOCITY_THRESHOLD || distance < -SWIPE_CONFIG.DISTANCE_THRESHOLD) && 
        leftRoute;
      
      const shouldSwipeRight = 
        (velocity > SWIPE_CONFIG.VELOCITY_THRESHOLD || distance > SWIPE_CONFIG.DISTANCE_THRESHOLD) && 
        rightRoute;

      if (shouldSwipeLeft) {
        // Smooth navigation to left route
        swipeX.value = withTiming(-SCREEN_WIDTH, SWIPE_CONFIG.NAVIGATION_TIMING);
        runOnJS(navigateTo)(leftRoute);
        return;
      }

      if (shouldSwipeRight) {
        // Smooth navigation to right route
        swipeX.value = withTiming(SCREEN_WIDTH, SWIPE_CONFIG.NAVIGATION_TIMING);
        runOnJS(navigateTo)(rightRoute);
        return;
      }

      // Snap back with premium spring animation
      swipeX.value = withSpring(0, SWIPE_CONFIG.SPRING);
    })
    .onFinalize(() => {
      if (!isNavigatingRef.current) {
        swipeX.value = withSpring(0, SWIPE_CONFIG.SPRING);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    // Premium parallax effect
    const scale = interpolate(
      Math.abs(swipeX.value),
      [0, SCREEN_WIDTH * 0.5],
      [1, 0.94],
      Extrapolation.CLAMP
    );
    
    const opacity = interpolate(
      Math.abs(swipeX.value),
      [0, SCREEN_WIDTH * 0.5],
      [1, 0.85],
      Extrapolation.CLAMP
    );
    
    const borderRadius = interpolate(
      Math.abs(swipeX.value),
      [0, SCREEN_WIDTH * 0.5],
      [0, 16],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: swipeX.value },
        { scale },
      ],
      opacity,
      borderRadius,
      overflow: 'hidden' as const,
    } as any;
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.container, animatedStyle]}>{children}</Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
});
