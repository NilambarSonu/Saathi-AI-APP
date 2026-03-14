import { useEffect, useState, useRef } from 'react';

/**
 * Custom Hook to animate a number count up to a target value.
 * @param {number} endValue - The final number to count up to.
 * @param {number} duration - The duration of the animation in milliseconds.
 * @returns {number} The current animated number.
 */
const useCountUp = (endValue, duration = 2000) => {
  const [count, setCount] = useState(0);
  
  // Use a ref to store the animation frame request ID
  // This allows us to cancel the animation on cleanup
  const animationFrameRef = useRef(null);

  useEffect(() => {
    // Capture the start time *only once* when the effect begins
    const startTime = performance.now();

    const animate = (currentTime) => {
      // Calculate how much time has passed since the start
      const timeElapsed = currentTime - startTime;

      // Calculate the progress (a value from 0 to 1)
      const progress = Math.min(timeElapsed / duration, 1);

      // Calculate the current value based on progress
      // Use Math.floor to display whole numbers
      const currentValue = Math.floor(progress * endValue);
      
      setCount(currentValue);

      // If progress is less than 1, continue the animation
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    // Start the animation loop
    animationFrameRef.current = requestAnimationFrame(animate);

    // Cleanup function: This runs when the component unmounts
    // or if the dependencies (endValue, duration) change.
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [endValue, duration]); // Re-run the effect only if endValue or duration changes

  return count;
};

export default useCountUp;