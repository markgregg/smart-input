import { useState, useEffect, useCallback } from 'react';
import { Block } from '@smart-input/core';
import { convertHistoricBlocks, exposeContentAsUrl } from '@src/utils/media';
import { HistoricBlock } from '@src/historicBlock';

/**
 * Options for the useBlockStorage hook.
 */
interface UseBlockStorageOptions {
  /** Whether history storage is enabled */
  enabled: boolean;
  /** localStorage key for persisting history */
  storageKey: string;
  /** Maximum number of history entries to store */
  maxHistory: number;
  /** Whether to store document and image blocks in history */
  storeDocsAndImagesToHistory?: boolean;
}

/**
 * Return value of the useBlockStorage hook.
 */
interface UseBlockStorageReturn {
  /** The current number of history entries */
  historicCount: number;
  /** Add blocks to the history */
  addToHistory: (blocks: Block[]) => void;
  /** Get a history entry by index (0 = oldest, historicCount-1 = most recent) */
  getHistoryEntry: (index: number) => Promise<Block[]>;
  /** Clear all history entries */
  clearHistory: () => void;
}

/**
 * Hook to handle persisting blocks to localStorage.
 * Manages history storage, loading, and retrieval with support for documents and images.
 *
 * @param options - Configuration options for history storage
 * @returns History management functions and state
 *
 * @example
 * ```tsx
 * const { addToHistory, getHistoryEntry, historicCount } = useBlockStorage({
 *   enabled: true,
 *   storageKey: 'my-editor-history',
 *   maxHistory: 50,
 *   storeDocsAndImagesToHistory: true
 * });
 * ```
 */
export const useBlockStorage = ({
  enabled,
  storageKey,
  maxHistory,
  storeDocsAndImagesToHistory,
}: UseBlockStorageOptions): UseBlockStorageReturn => {
  // Load history synchronously during initialization
  const [history, setHistory] = useState<HistoricBlock[][]>(() => {
    if (!enabled) return [];
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsedHistory = JSON.parse(stored) as HistoricBlock[][];
        return parsedHistory
          .filter((h) => !h.some((b) => !('block' in b)))
          .slice(parsedHistory.length - maxHistory);
      }
    } catch (error) {
      console.error('Failed to load commit history from localStorage:', error);
    }
    return [];
  });

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (!enabled) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save commit history to localStorage:', error);
    }
  }, [history, enabled, storageKey]);

  // Add blocks to history
  const addToHistory = useCallback(
    async (blocks: Block[]) => {
      //if don't save docs/images and blocks contain them, skip adding
      if (
        !storeDocsAndImagesToHistory &&
        blocks.some((b) => b.type === 'document' || b.type === 'image')
      ) {
        return;
      }
      const newBlocks = await convertHistoricBlocks(blocks);
      setHistory((prev) => {
        const newHistory = [...prev, newBlocks];
        return newHistory.slice(newHistory.length - maxHistory);
      });
    },
    [maxHistory, storeDocsAndImagesToHistory],
  );

  // Get a history entry by index with invalid blocks removed
  const getHistoryEntry = useCallback(
    async (index: number): Promise<Block[]> => {
      if (index < 0 || index >= history.length) {
        return [];
      }
      const entry = history[index];
      if (!entry) {
        return [];
      }
      return await exposeContentAsUrl(entry);
    },
    [history],
  );

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
    if (enabled) {
      try {
        localStorage.removeItem(storageKey);
      } catch (error) {
        console.error('Failed to clear history from localStorage:', error);
      }
    }
  }, [enabled, storageKey]);

  return {
    historicCount: history.length,
    addToHistory,
    getHistoryEntry,
    clearHistory,
  };
};
