// filepath: c:\Users\gregg\development\react-extendable-input\src\components\TypeaheadLookup\TypeaheadLookup.tsx
// ...existing code...
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTypeaheadLookups } from './hooks/useTypeaheadLookups';
import TypeaheadItem from './components/TypeaheadItem';
import {
  useBehaviour,
  useBlocks,
  useBuffer,
  useCursorPosition,
  useKeyHandlers,
  BlockType,
  StyledBlock,
  getBlockIndexAtPosition,
  insertStyledBlockAtPosition,
  replaceTextAtPosition,
  splitTextFromStyledBlock,
  transformToTextBlocks,
} from '@smart-input/core';
import { TypeaheadLookupProps } from './typeAheadLookupProps';
import { useElementSize } from './hooks/useElementSize';
import styles from './TypeaheadLookup.module.less';

const DEFAULT_DEBOUNCE = 200;
const DEFAULT_MAX_HEIGHT = 240;
const DEFAULT_MAX_WIDTH = 380;
const ITEM_HEIGHT = 24; // px, used to compute page up/down behaviour

/**
 * TypeaheadLookup provides autocomplete/suggestion functionality for the editor.
 * It displays a dropdown with lookup results based on the text being typed,
 * allowing users to quickly insert predefined values or search results.
 *
 * @component
 * @example
 * ```tsx
 * const lookups: Lookup[] = [
 *   async (query) => {
 *     const results = await searchAPI(query);
 *     return results.map(r => ({
 *       text: r.name,
 *       category: 'users',
 *       score: r.relevance
 *     }));
 *   }
 * ];
 *
 * <SmartInput>
 *   <Editor />
 *   <TypeaheadLookup
 *     lookups={lookups}
 *     autoInsert={true}
 *     minSearchLength={2}
 *     showCategory={true}
 *   />
 * </SmartInput>
 * ```
 */
export const TypeaheadLookup: React.FC<TypeaheadLookupProps> = ({
  debounce = DEFAULT_DEBOUNCE,
  autoHighlight = false,
  lookups,
  wordsToCheck,
  maxHeight = DEFAULT_MAX_HEIGHT,
  maxWidth = DEFAULT_MAX_WIDTH,
  autoInsert = false,
  minSearchLength = 3,
  showCategory = false,
  showScore = false,
  highlightMatch = false,
  itemClassname,
  position = 'below',
  onSelect,
}) => {
  // get full cursor state; we expect the cursor selector to expose something containing
  // the text before the cursor (common names: textBeforeCursor, text, etc.).
  // Fall back safely using any to avoid strict typing issues with the selector's shape.
  const cursorState = useCursorPosition((s) => s);
  const { cursorRect, characterPosition, updateCharacterPosition } =
    cursorState;
  const setSelectionInProgress = useBehaviour((s) => s.setSelectionInProgress);
  const { addKeyboardHandler, removeKeyboardHandler } = useKeyHandlers(
    (state) => state,
  );
  const { blocks, setBlocks } = useBlocks((s) => s);
  const [visibleStart, setVisibleStart] = useState(0);
  const appendToBuffer = useBuffer((s) => s.appendToBuffer);
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemsRef = useRef<Array<HTMLDivElement | null>>([]);
  const lookUpItems = useRef<Map<string, string>>(new Map());

  const [sizeRef, size] = useElementSize();

  const setContainerRef = (element: HTMLDivElement | null) => {
    containerRef.current = element;
    sizeRef(element);
  };

  useEffect(() => {
    if (!autoInsert) return;
    blocks.forEach((b, idx) => {
      if (
        b.type !== BlockType.Styled ||
        !lookUpItems.current.has(b.id) ||
        lookUpItems.current.get(b.id) === b.text
      )
        return;
      const styled = b as StyledBlock;
      const lookup = lookUpItems.current.get(styled.id);
      if (lookup) {
        if (!styled.text.includes(lookup)) {
          const { newBlocks } = transformToTextBlocks(blocks, [
            { block: styled, idx },
          ]);
          lookUpItems.current.delete(styled.id);
          setBlocks(newBlocks);
          appendToBuffer(newBlocks);
        } else {
          //
          const { newBlocks } = splitTextFromStyledBlock(
            blocks,
            styled,
            idx,
            lookup,
          );
          setBlocks(newBlocks);
          appendToBuffer(newBlocks);
        }
      }
    });
  }, [blocks, autoInsert, appendToBuffer, setBlocks]);

  const cursorPos = Math.max(0, characterPosition ?? 0);

  const textBeforeCursor = useMemo(() => {
    if (!blocks || blocks.length === 0) return '';

    // find block containing cursorPos
    let running = 0;
    let blockIndex = -1;
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (!b) continue;
      if (
        b.type === BlockType.Document ||
        b.type === BlockType.Image ||
        b.type === BlockType.Styled
      ) {
        continue;
      }
      const bt = 'text' in b && typeof b.text === 'string' ? b.text : '';
      const next = running + bt.length;
      if (cursorPos <= next) {
        blockIndex = i;
        break;
      }
      running = next;
    }

    // if not found, use last block
    if (blockIndex === -1) {
      blockIndex = Math.max(0, blocks.length - 1);
      running = blocks
        .slice(0, blockIndex)
        .reduce(
          (s, b) =>
            s +
            (b.type !== BlockType.Document &&
            b.type !== BlockType.Image &&
            b.type !== BlockType.Styled &&
            typeof b.text === 'string'
              ? b.text.length
              : 0),
          0,
        );
    }

    const currentBlock = blocks[blockIndex];
    if (!currentBlock) return '';
    // if current block is styled, return blank string
    if (currentBlock.type !== BlockType.Text) return '';

    const curText =
      'text' in currentBlock && typeof currentBlock.text === 'string'
        ? currentBlock.text
        : '';
    const offsetInBlock = Math.max(
      0,
      Math.min(curText.length, cursorPos - running),
    );

    // only consider text inside the current block up to the cursor
    const acc = curText.slice(0, offsetInBlock);

    // return substring after last carriage return inside the same block (if any)
    const lastCR = acc.lastIndexOf('\n');
    if (lastCR >= 0) return acc.slice(lastCR + 1);
    return acc;
  }, [blocks, cursorPos]);

  // derive queries from the last `wordsToCheck` words before the cursor
  const queries = useMemo(() => {
    // if wordsToCheck is less than 1, use the full text before cursor
    if (!wordsToCheck) {
      return [textBeforeCursor];
    }
    // capture words with their trailing spaces so internal spacing is preserved
    const segments = Array.from(
      textBeforeCursor.matchAll(/\S+\s*/g),
      (m) => m[0] ?? '',
    );
    const n = Math.min(segments.length, wordsToCheck);
    const lastSegments = segments.slice(Math.max(0, segments.length - n));

    // if there's no word to query, behave consistently
    if (lastSegments.length === 0) return null;

    // Build cumulative queries from shortest (last word) to longest (last n words)
    // preserve original spacing by joining the captured segments, then trim ends
    const q: string[] = [];
    for (let i = 1; i <= lastSegments.length; i++) {
      const combined = lastSegments.slice(lastSegments.length - i).join('');
      if (combined.length < minSearchLength) continue;
      q.push(combined);
    }
    return q;
  }, [textBeforeCursor, wordsToCheck, minSearchLength]);

  // results come from the hook, now driven by cursor-derived queries
  const results = useTypeaheadLookups(lookups, queries, debounce);

  // Reset local UI state when queries change (hook clears results)
  const queriesKey = queries?.join('\u0000');
  useEffect(() => {
    setVisibleStart(0);
    setHighlightIndex(autoHighlight ? 0 : null);
  }, [queriesKey, autoHighlight]);

  useEffect(() => {
    // Selection is in progress if dropdown has results (regardless of highlight state)
    setSelectionInProgress(results.length > 0);
  }, [results.length, setSelectionInProgress]);

  // determine visible window based on maxHeight
  const visibleCount = Math.max(1, Math.floor(maxHeight / ITEM_HEIGHT));
  const visibleItems = results.slice(visibleStart, visibleStart + visibleCount);

  // ensure highlight index stays within range when results change
  useEffect(() => {
    if (results.length === 0) {
      setHighlightIndex(null);
      setVisibleStart(0);
      return;
    }

    if (highlightIndex === null && autoHighlight) {
      setHighlightIndex(0);
      setVisibleStart(0);
      return;
    }

    if (highlightIndex !== null) {
      const clamped = Math.max(0, Math.min(results.length - 1, highlightIndex));
      if (clamped !== highlightIndex) setHighlightIndex(clamped);

      if (clamped < visibleStart) setVisibleStart(clamped);
      else if (clamped >= visibleStart + visibleCount)
        setVisibleStart(clamped - visibleCount + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results.length, autoHighlight, visibleCount]);

  // scroll highlighted item into view when it changes
  useEffect(() => {
    if (highlightIndex === null) return;
    const localIndex = highlightIndex - visibleStart;
    const el = itemsRef.current[localIndex];
    if (el && containerRef.current) {
      const elTop = el.offsetTop;
      const elBottom = elTop + el.offsetHeight;
      if (elTop < containerRef.current.scrollTop)
        containerRef.current.scrollTop = elTop;
      else if (
        elBottom >
        containerRef.current.scrollTop + containerRef.current.clientHeight
      ) {
        containerRef.current.scrollTop =
          elBottom - containerRef.current.clientHeight;
      }
    }
  }, [highlightIndex, visibleStart]);

  const handleItemEntered = (globalIndex: number) => {
    setHighlightIndex(globalIndex);
  };

  const handleItemClicked = useCallback(
    (globalIndex: number) => {
      const item = results[globalIndex];
      if (item) {
        if (autoInsert) {
          try {
            const lookup = lookups.find((l) => l.category === item.category);
            if (item.category && lookup?.style) {
              const id = item.category + '-' + Date.now();
              const { newBlocks = null, newPosition = null } =
                insertStyledBlockAtPosition(
                  blocks,
                  characterPosition - item.matchedText.length,
                  item.matchedText,
                  id,
                  item.text,
                  lookup.style ?? {},
                );
              if (newBlocks === null || newPosition === null) return;
              lookUpItems.current.set(id, item.text);
              setBlocks(newBlocks);
              updateCharacterPosition(newPosition);
              appendToBuffer(newBlocks);
              return;
            }
            const { newBlocks = null, newPosition = null } =
              replaceTextAtPosition(
                blocks,
                characterPosition - item.matchedText.length,
                item.matchedText,
                item.text,
              ) ?? {};
            if (newBlocks === null || newPosition === null) return;
            setBlocks(newBlocks);
            updateCharacterPosition(newPosition);
            appendToBuffer(newBlocks);
          } catch {
            /* swallow insertion errors */
          }
          return;
        }
        if (onSelect) {
          const { index = -1, offset = -1 } =
            getBlockIndexAtPosition(
              characterPosition - item.matchedText.length,
              blocks,
            ) ?? {};
          onSelect(item, index, offset);
        }
      }
    },
    [
      appendToBuffer,
      autoInsert,
      blocks,
      characterPosition,
      lookups,
      onSelect,
      results,
      setBlocks,
      updateCharacterPosition,
    ],
  );

  // Register keyHandler to intercept Enter when typeahead is active
  useEffect(() => {
    const handleKeyDown = (keys: { key: string }) => {
      if (!results.length) return false;
      switch (keys.key) {
        case 'ArrowDown': {
          const next = (highlightIndex ?? -1) + 1;
          const idx = Math.min(results.length - 1, next);
          setHighlightIndex(idx);
          if (idx >= visibleStart + visibleCount)
            setVisibleStart(idx - visibleCount + 1);
          return true;
        }
        case 'ArrowUp': {
          const prev = (highlightIndex ?? results.length) - 1;
          const idx = Math.max(0, prev);
          setHighlightIndex(idx);
          if (idx < visibleStart) setVisibleStart(idx);
          return true;
        }
        case 'PageDown': {
          const idx = Math.min(
            results.length - 1,
            (highlightIndex ?? 0) + visibleCount,
          );
          setHighlightIndex(idx);
          setVisibleStart(
            Math.min(
              results.length - visibleCount,
              visibleStart + visibleCount,
            ),
          );
          return true;
        }
        case 'PageUp': {
          const idx = Math.max(0, (highlightIndex ?? 0) - visibleCount);
          setHighlightIndex(idx);
          setVisibleStart(Math.max(0, visibleStart - visibleCount));
          return true;
        }
        case 'Home': {
          setHighlightIndex(0);
          setVisibleStart(0);
          return true;
        }
        case 'End': {
          setHighlightIndex(results.length - 1);
          setVisibleStart(Math.max(0, results.length - visibleCount));
          return true;
        }
        case 'Enter': {
          const indexToSelect = highlightIndex !== null ? highlightIndex : 0;
          handleItemClicked(indexToSelect);
          return true; // Prevent other handlers from processing this key
        }
        default:
          return false;
      }
    };
    addKeyboardHandler(handleKeyDown);
    return () => {
      removeKeyboardHandler(handleKeyDown);
    };
  }, [
    highlightIndex,
    results.length,
    results,
    visibleStart,
    visibleCount,
    handleItemClicked,
    addKeyboardHandler,
    removeKeyboardHandler,
  ]);

  const getTopPosition = () => {
    return position === 'below'
      ? cursorRect
        ? cursorRect.bottom
        : 0
      : cursorRect
        ? cursorRect.top - size.height
        : 0;
  };

  const dynamicPosStyle: React.CSSProperties = {
    top: cursorRect ? getTopPosition() : 0,
    left: cursorRect ? cursorRect.left : 0,
    width: maxWidth,
    maxHeight,
  };

  return (
    <Fragment>
      {visibleItems.length > 0 && (
        <div
          className={styles['typeaheadDropdown']}
          style={dynamicPosStyle}
          ref={setContainerRef}
          role="listbox"
          aria-label="Typeahead results"
        >
          {visibleItems.map((r, i) => {
            const globalIndex = visibleStart + i;
            const isHighlighted = highlightIndex === globalIndex;
            const setRef = (el: HTMLDivElement | null) => {
              itemsRef.current[i] = el;
            };
            return (
              <TypeaheadItem
                key={`${r.text}-${r.score}-${globalIndex}`}
                ref={setRef}
                item={r}
                globalIndex={globalIndex}
                isHighlighted={isHighlighted}
                onMouseEnter={handleItemEntered}
                onClick={handleItemClicked}
                showCategory={showCategory}
                showScore={showScore}
                highlightMatch={highlightMatch}
                {...(itemClassname !== undefined && { itemClassname })}
              />
            );
          })}
        </div>
      )}
    </Fragment>
  );
};

TypeaheadLookup.displayName = 'TypeaheadLookup';
