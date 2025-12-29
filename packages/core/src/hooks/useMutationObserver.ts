import { useEffect } from 'react';

/**
 * Hook that sets up a MutationObserver to watch for changes in the DOM tree.
 * Useful for reacting to dynamic DOM changes in the editor.
 *
 * @param targetNode - The DOM node to observe
 * @param callback - Function to call when mutations are observed
 * @param options - MutationObserver configuration options
 *
 * @example
 * ```tsx
 * const editorRef = useRef<HTMLDivElement>(null);
 *
 * useMutationObserver(
 *   editorRef.current?.querySelector('pre'),
 *   (mutations) => {
 *     console.log('DOM changed:', mutations);
 *     // Reattach event listeners or update state
 *   },
 *   { childList: true, subtree: true }
 * );
 * ```
 */
export const useMutationObserver = (
  targetNode: Node | null,
  callback: MutationCallback,
  options?: MutationObserverInit,
) => {
  useEffect(() => {
    if (!targetNode) return;

    const observer = new MutationObserver(callback);

    observer.observe(targetNode, options);

    callback([], observer);
    return () => observer.disconnect();
  }, [options, targetNode, callback]);
};
