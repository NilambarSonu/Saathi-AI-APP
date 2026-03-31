import React, { useEffect, useRef } from "react";
import { Dimensions, View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
  type SharedValue,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const SCREEN_WIDTH = Dimensions.get("window").width;

// Spring config: feels premium like Instagram/CRED — fast settle, no bounce
const SPRING_CONFIG = {
  damping: 22,
  stiffness: 180,
  mass: 0.4,
  overshootClamping: true, // prevents overshoot during fast velocity swipes
};

type SwipeContainerProps = {
  screens: React.FC<any>[];
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
};

export default function SwipeContainer({
  screens,
  initialIndex = 0,
  onIndexChange,
}: SwipeContainerProps) {
  // UI-thread source of truth — never stale
  const currentIndex = useSharedValue(initialIndex);
  const translateX = useSharedValue(-initialIndex * SCREEN_WIDTH);

  // JS-thread: track the "last committed" index to fix race conditions
  // during rapid swipes. We only call onIndexChange when gesture properly ends.
  const pendingIndexRef = useRef(initialIndex);

  // Stable callback ref — avoids re-creating gesture when parent re-renders
  const onIndexChangeRef = useRef(onIndexChange);
  useEffect(() => {
    onIndexChangeRef.current = onIndexChange;
  }, [onIndexChange]);

  // Sync from parent (e.g. tab bar tap changes store → SwipeContainer must follow)
  useEffect(() => {
    if (initialIndex !== pendingIndexRef.current) {
      pendingIndexRef.current = initialIndex;
      currentIndex.value = initialIndex;
      translateX.value = withSpring(-initialIndex * SCREEN_WIDTH, SPRING_CONFIG);
    }
  }, [initialIndex]);

  // ─── Notify parent (stable, never causes race) ───────────────────────────
  const commitIndex = (index: number) => {
    pendingIndexRef.current = index;
    onIndexChangeRef.current?.(index);
  };

  // ─── Gesture ─────────────────────────────────────────────────────────────
  const gesture = Gesture.Pan()
    .activeOffsetX([-15, 15])      // start tracking horizontal pan
    .failOffsetY([-20, 20])        // cancel if vertical pan — lets ScrollViews work
    .onUpdate((e) => {
      let base = -currentIndex.value * SCREEN_WIDTH + e.translationX;

      // Rubber-band resistance at edges
      if (currentIndex.value === 0 && e.translationX > 0) {
        base = e.translationX * 0.25;
      } else if (currentIndex.value === screens.length - 1 && e.translationX < 0) {
        base = -(currentIndex.value * SCREEN_WIDTH) + e.translationX * 0.25;
      }

      translateX.value = base;
    })
    .onEnd((e) => {
      const velocity = e.velocityX;
      const VELOCITY_THRESHOLD = 400;
      const DRAG_THRESHOLD = SCREEN_WIDTH * 0.38;

      let nextIndex = currentIndex.value;

      // Velocity-based: fast flick always commits
      if (velocity < -VELOCITY_THRESHOLD && nextIndex < screens.length - 1) {
        nextIndex = nextIndex + 1;
      } else if (velocity > VELOCITY_THRESHOLD && nextIndex > 0) {
        nextIndex = nextIndex - 1;
      } else {
        // Slow drag: commit if dragged past 38% of screen
        if (e.translationX < -DRAG_THRESHOLD && nextIndex < screens.length - 1) {
          nextIndex = nextIndex + 1;
        } else if (e.translationX > DRAG_THRESHOLD && nextIndex > 0) {
          nextIndex = nextIndex - 1;
        }
      }

      // Clamp to valid range
      nextIndex = Math.max(0, Math.min(screens.length - 1, nextIndex));

      // Update UI-thread value immediately — zero lag
      currentIndex.value = nextIndex;

      // Animate to final position
      translateX.value = withSpring(-nextIndex * SCREEN_WIDTH, SPRING_CONFIG);

      // Notify JS thread ONCE with the definitive final index
      // Using runOnJS with a stable ref avoids any stale closure / race issues
      runOnJS(commitIndex)(nextIndex);
    });

  // ─── Animated strip style ─────────────────────────────────────────────────
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  // ─── Per-screen scale/opacity parallax (optional premium feel) ───────────
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          styles.container,
          { width: SCREEN_WIDTH * screens.length },
          animatedStyle,
        ]}
      >
        {screens.map((ScreenComponent, index) => (
          <ScreenSlide
            key={index}
            index={index}
            translateX={translateX}
            totalScreens={screens.length}
          >
            <ScreenComponent />
          </ScreenSlide>
        ))}
      </Animated.View>
    </GestureDetector>
  );
}

// ─── Individual screen slide with subtle parallax ─────────────────────────────
function ScreenSlide({
  index,
  translateX,
  totalScreens,
  children,
}: {
  index: number;
  translateX: SharedValue<number>;
  totalScreens: number;
  children: React.ReactNode;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    // The screen's offset from center in percentage (0 = fully centered)
    const screenCenter = -index * SCREEN_WIDTH;
    const diff = translateX.value - screenCenter;
    const progress = diff / SCREEN_WIDTH; // -1 (left) to +1 (right)

    // Scale: 1 when centered, 0.96 when off-screen
    const scale = interpolate(
      Math.abs(progress),
      [0, 1],
      [1, 0.96],
      Extrapolation.CLAMP
    );

    // Opacity: 1 when centered, 0.7 when off-screen — depth effect
    const opacity = interpolate(
      Math.abs(progress),
      [0, 1],
      [1, 0.75],
      Extrapolation.CLAMP
    );

    return { transform: [{ scale }], opacity };
  });

  return (
    <Animated.View style={[styles.screenWrapper, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  screenWrapper: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
});
