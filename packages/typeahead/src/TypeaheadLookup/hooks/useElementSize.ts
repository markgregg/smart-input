import { useCallback, useLayoutEffect, useState } from 'react';

export type ElementSize = { width: number; height: number };

export const useElementSize = <T extends HTMLElement = HTMLElement>() => {
  const [node, setNode] = useState<T | null>(null);
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });

  const sizeRef = useCallback((element: T | null) => {
    setNode(element);
  }, []);

  useLayoutEffect(() => {
    if (!node) {
      return;
    }

    const update = () => {
      const rect = node.getBoundingClientRect();
      setSize({
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      });
    };

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(update);
      ro.observe(node);
      update();
      return () => ro.disconnect();
    } else {
      // fallback for environments without ResizeObserver
      update();
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }
  }, [node]);

  return [sizeRef, size] as const;
};
