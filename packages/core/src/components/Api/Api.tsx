import { forwardRef, useEffect, useImperativeHandle, useMemo } from 'react';
import {
  useApi,
  useBuffer,
  useCursorPosition,
  useBlocks,
} from '@src/state/useState';
import { SmartInputApi, SmartInputFunctions } from '@src/types/api';
import { Block, BlockType, CommitItem } from '@src/types';
import { createApi, createState } from './functions';
import {
  convertBlocksToCommitItems,
  getCursorPosition,
  getSelectionRange,
  setCursorPosition,
} from '@src/utils/functions';

/**
 * Api component provides the SmartInput API interface.
 * This component doesn't render any UI but exposes methods via ref to interact with the editor.
 * It manages state transformations and provides methods to manipulate blocks programmatically.
 *
 * @component
 * @example
 * ```tsx
 * const apiRef = useRef<SmartInputApi>(null);
 *
 * // Use the API
 * apiRef.current?.apply((api) => {
 *   api.insertText('Hello');
 * });
 * ```
 */
export const Api = forwardRef<SmartInputApi>(function Api(_, ref) {
  const { blocks, setBlocks } = useBlocks((s) => s); // ensure re-render on blocks change
  const { setApi, element } = useApi((s) => s); // ensure re-render on api change
  const { characterPosition, updateCharacterPosition } = useCursorPosition(
    (s) => s,
  ); // ensure re-render on cursor position change
  const { appendToBuffer } = useBuffer((s) => s);

  const api = useMemo<SmartInputApi>(
    () => ({
      apply: (fn: (api: SmartInputFunctions) => void) => {
        const state = createState(blocks, characterPosition);
        const functions = createApi(state);
        fn(functions);
        if (JSON.stringify(state.blocks) !== JSON.stringify(blocks)) {
          setBlocks(state.blocks);
        }
        if (state.characterPosition !== characterPosition) {
          updateCharacterPosition(state.characterPosition);
        }
        if (state.buffer.length > 0) {
          state.buffer.forEach((b) => appendToBuffer(b));
        }
      },
      getBlockAtPosition: (position: number): Block | null => {
        let blockIndex = -1;
        let blockStart = 0;
        for (let i = 0; i < blocks.length; i++) {
          const b = blocks[i];
          if (!b) continue;
          if (b.type === BlockType.Text || b.type === BlockType.Styled) {
            const blockLength = b.text.length;
            if (position >= blockStart && position < blockStart + blockLength) {
              blockIndex = i;
              const foundBlock = blocks[blockIndex];
              return foundBlock ?? null;
            }
            blockStart += blockLength;
          }
        }
        return null;
      },
      get: (): CommitItem[] => {
        return convertBlocksToCommitItems(blocks);
      },
      getElementById: (id: string): HTMLElement | null => {
        return document.getElementById(id);
      },
      focus: (): void => {
        if (element) {
          element.focus();
          // Move cursor to end of content
          if (element.childNodes.length === 0) {
            const selection = window.getSelection();
            if (selection) {
              const range = document.createRange();
              range.setStart(element, 0);
              range.collapse(true);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          }
        }
      },
      getCursorPosition: (): number => {
        if (!element) return 0;
        const range = getSelectionRange(element);
        if (!range) return 0;
        return getCursorPosition(element, range);
      },
      setCursorPosition: (position: number): void => {
        if (!element) return;
        setCursorPosition(element, position);
      },
      getText: (): string => {
        return blocks
          .map((b) =>
            b.type === BlockType.Text || b.type === BlockType.Styled
              ? b.text
              : '',
          )
          .join('');
      },
      getTextLength: (): number => {
        return blocks.reduce((length, b) => {
          if (b.type === BlockType.Text || b.type === BlockType.Styled) {
            return length + b.text.length;
          }
          return length;
        }, 0);
      },
    }),
    [
      blocks,
      characterPosition,
      setBlocks,
      updateCharacterPosition,
      appendToBuffer,
      element,
    ],
  );

  useEffect(() => {
    setApi(api);
  }, [api, setApi]);

  useImperativeHandle(ref, () => api, [api]);

  return null;
});
