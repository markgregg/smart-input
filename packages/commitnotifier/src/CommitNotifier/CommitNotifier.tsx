import React from 'react';
import {
  useBehaviour,
  useBlocks,
  useKeyHandlers,
  useCursorPosition,
  KeyCombination,
  Block,
  convertBlocksToCommitItems,
  CommitItem,
  CommitKeyCombination,
} from '@smart-input/core';
import { useBlockStorage } from '../hooks/useBlockStorage';

/**
 * Props for the CommitNotifier component.
 */
export interface CommitNotifierProps {
  /** Callback invoked when content is committed. Return true to clear the editor, false to keep content. */
  onCommit: (items: CommitItem[]) => boolean;
  /** Key combination that triggers a commit (default: Enter key) */
  commitKeyCombination?: CommitKeyCombination;
  /** Whether to enable history navigation with Up/Down arrow keys */
  enableHistory?: boolean;
  /** Maximum number of history entries to store (default: 50) */
  maxHistory?: number;
  /** localStorage key for persisting history (default: 'commit-history') */
  historyStorageKey?: string;
  /** Whether to store documents and images in history (default: false) */
  storeDocsAndImagesToHistory?: boolean;
  /** Clear blocks after commit (default: false) */
  clearAfterCommit?: boolean;
}

/**
 * CommitNotifier handles commit operations for the editor.
 * It listens for a configurable key combination (default: Enter) to commit content,
 * and optionally provides history navigation with Up/Down arrow keys.
 *
 * @component
 * @example
 * ```tsx
 * <SmartInput>
 *   <Editor />
 *   <CommitNotifier
 *     onCommit={(items) => {
 *       console.log('Committed:', items);
 *       return true; // Clear editor after commit
 *     }}
 *     enableHistory={true}
 *     commitKeyCombination={{ key: 'Enter', metaKey: true }}
 *   />
 * </SmartInput>
 * ```
 */
export const CommitNotifier: React.FC<CommitNotifierProps> = ({
  onCommit,
  commitKeyCombination,
  maxHistory = 50,
  historyStorageKey = 'commit-history',
  enableHistory = false,
  storeDocsAndImagesToHistory = false,
  clearAfterCommit = false,
}) => {
  const { addKeyboardHandler, removeKeyboardHandler } = useKeyHandlers(
    (state) => state,
  );
  const selectionInProgress = useBehaviour((s) => s.selectionInProgress);
  const { blocks, setBlocks } = useBlocks((s) => s);
  const { characterPosition } = useCursorPosition((s) => s);

  // Use the block storage hook for persistence
  const { historicCount, addToHistory, getHistoryEntry } = useBlockStorage({
    enabled: enableHistory,
    storageKey: historyStorageKey,
    maxHistory,
    storeDocsAndImagesToHistory,
  });

  const [historyIndex, setHistoryIndex] = React.useState<number>(-1);
  const [currentBlocks, setCurrentBlocks] = React.useState<Block[] | null>(
    null,
  );

  const isCursorOnFirstLine = React.useCallback(() => {
    if (blocks.length === 0) return true;

    let position = 0;
    // Find the position of the first newline character
    for (const block of blocks) {
      if ('text' in block) {
        const newlineIndex = block.text.indexOf('\n');
        if (newlineIndex !== -1) {
          // Found a newline - first line ends at this position
          const firstLineEnd = position + newlineIndex;
          return characterPosition <= firstLineEnd;
        }
        position += block.text.length;
      }
    }

    // No newline found - cursor is always on first line
    return true;
  }, [blocks, characterPosition]);

  const isCursorOnLastLine = React.useCallback(() => {
    if (blocks.length === 0) return true;

    let position = 0;
    let lastNewlinePosition = -1;

    // Find the position of the last newline character
    for (const block of blocks) {
      if ('text' in block) {
        const lastIndex = block.text.lastIndexOf('\n');
        if (lastIndex !== -1) {
          lastNewlinePosition = position + lastIndex;
        }
        position += block.text.length;
      }
    }

    // No newline found - cursor is always on last line
    if (lastNewlinePosition === -1) return true;

    // Cursor is on last line if it's after the last newline
    return characterPosition > lastNewlinePosition;
  }, [blocks, characterPosition]);

  const navigateHistory = React.useCallback(
    (direction: 'up' | 'down') => {
      if (historyIndex === -1) {
        // Not in history mode
        if (historicCount === 0) return false;

        if (direction === 'up') {
          // Save current blocks before navigating history
          setCurrentBlocks(blocks);
          // Start at most recent entry (last in array)
          const newIndex = historicCount - 1;
          setHistoryIndex(newIndex);
          getHistoryEntry(newIndex).then((entry) => setBlocks(entry));
          return true;
        } else {
          // Down key does nothing when not in history
          return false;
        }
      } else if (direction === 'up') {
        // Navigate to older entries (towards index 0)
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          getHistoryEntry(newIndex).then((entry) => setBlocks(entry));
        }
        // Stop at oldest entry (index 0)
        return true;
      } else if (direction === 'down') {
        // Navigate to newer entries (towards current)
        if (historyIndex < historicCount - 1) {
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          getHistoryEntry(newIndex).then((entry) => setBlocks(entry));
        } else if (currentBlocks) {
          // Reached newest entry, restore current blocks
          setBlocks(currentBlocks);
          setHistoryIndex(-1);
          setCurrentBlocks(null);
        }
        return true;
      }
      return true;
    },
    [historyIndex, history, blocks, currentBlocks, setBlocks, getHistoryEntry],
  );

  React.useEffect(() => {
    if (!onCommit) return;

    const handleKeyDown = (keys: KeyCombination) => {
      if (selectionInProgress) return false;

      if (
        keys.key === 'Enter' ||
        (commitKeyCombination &&
          commitKeyCombination.key === keys.key &&
          (!commitKeyCombination.altKey || keys.altKey) &&
          (!commitKeyCombination.ctrlKey || keys.ctrlKey) &&
          (!commitKeyCombination.shiftKey || keys.shiftKey) &&
          (!commitKeyCombination.metaKey || keys.shiftKey))
      ) {
        const items = convertBlocksToCommitItems(blocks);
        if (items.length === 0) {
          return false;
        }
        if (onCommit(items)) {
          if (enableHistory) {
            addToHistory(blocks);
          }
          if (clearAfterCommit) {
            setBlocks([]);
          }
        }
        return true;
      }
      if (enableHistory && keys.key === 'ArrowUp' && isCursorOnFirstLine()) {
        return navigateHistory('up');
      }
      if (enableHistory && keys.key === 'ArrowDown' && isCursorOnLastLine()) {
        return navigateHistory('down');
      }
      return false;
    };

    addKeyboardHandler(handleKeyDown);
    return () => {
      removeKeyboardHandler(handleKeyDown);
    };
  }, [
    onCommit,
    commitKeyCombination,
    selectionInProgress,
    blocks,
    historyIndex,
    addKeyboardHandler,
    removeKeyboardHandler,
    isCursorOnFirstLine,
    isCursorOnLastLine,
    currentBlocks,
    navigateHistory,
    enableHistory,
    setBlocks,
    addToHistory,
    clearAfterCommit,
  ]);

  return null;
};
