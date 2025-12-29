import { useEffect, useRef } from 'react';

/**
 * Hook that observes an element for position and size changes.
 * Calls the provided callback when either the element's size changes
 * or its position changes (due to scrolling or layout shifts).
 *
 * @param element - The DOM element to observe
 * @param callback - Function to call when position or size changes
 *
 * @example
 * ```tsx
 * const preRef = useRef<HTMLPreElement>(null);
 *
 * useElementObserver(preRef.current, () => {
 *   console.log('Element position or size changed');
 *   updateCursorPosition();
 * });
 * ```
 */
export const useElementObserver = (
  element: HTMLElement | null,
  callback: () => void,
) => {
  const lastPositionRef = useRef({ top: 0, left: 0 });
  const callbackRef = useRef(callback);

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!element) return;

    let rafId: number | null = null;
    let isObserving = true;

    const triggerCallback = () => {
      callbackRef.current();
    };

    // Check for position changes using requestAnimationFrame
    const checkPosition = () => {
      if (!isObserving || !element) return;

      const rect = element.getBoundingClientRect();
      const currentPosition = { top: rect.top, left: rect.left };

      // Check if position has changed
      if (
        currentPosition.top !== lastPositionRef.current.top ||
        currentPosition.left !== lastPositionRef.current.left
      ) {
        lastPositionRef.current = currentPosition;
        triggerCallback();
      }

      rafId = requestAnimationFrame(checkPosition);
    };

    // Use ResizeObserver for size changes
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(triggerCallback);
      resizeObserver.observe(element);
    }

    // Use IntersectionObserver to detect position changes efficiently
    let intersectionObserver: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver(triggerCallback, {
        root: null, // viewport
        threshold: [0, 0.25, 0.5, 0.75, 1],
      });
      intersectionObserver.observe(element);
    }

    // Listen for scroll events on window and scrollable ancestors
    window.addEventListener('scroll', triggerCallback, true);
    window.addEventListener('resize', triggerCallback);

    // Start position checking as fallback
    rafId = requestAnimationFrame(checkPosition);

    return () => {
      isObserving = false;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (intersectionObserver) {
        intersectionObserver.disconnect();
      }
      window.removeEventListener('scroll', triggerCallback, true);
      window.removeEventListener('resize', triggerCallback);
    };
  }, [element]);
};
