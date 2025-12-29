import React, {
  FC,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {
  useBlockRerenderHandlers,
  useBlocks,
  useBuffer,
  useCursorPosition,
} from '@state/useState';
import { stringifyCSSProperties } from 'react-style-stringify';
import { UnmanagedEditor } from '@components/UnmanagedEditor';
import { Block, BlockType, StyledBlock } from '@atypes/block';
import { useMutationObserver } from '@hooks/useMutationObserver';
import {
  createElement,
  getCursorPosition,
  getSelectionRange,
  insertCarridgeReturn,
  isCarridgeReturn,
  preContainsNode,
  preContainsTextNode,
  replaceLineFeeds,
  setCursorPosition,
} from '../../utils/functions';
import { EditorProps } from '@src/types';
import cx from 'classnames';
import {
  addBlockEventListeners,
  areStylesDifferent,
  getElementText,
  setElementText,
} from './functions';
import style from './Editor.module.less';

// Document icon as data URI (same as in functions.ts)
const DOCUMENT_ICON =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIGZpbGw9IiNGNUY1RjUiLz48cGF0aCBkPSJNMTIgOEMxMiA2Ljg5NTQzIDEyLjg5NTQgNiAxNCA2SDI2TDM2IDE2VjQwQzM2IDQxLjEwNDYgMzUuMTA0NiA0MiAzNCA0MkgxNEMxMi44OTU0IDQyIDEyIDQxLjEwNDYgMTIgNDBWOFoiIGZpbGw9IiM0Mjg1RjQiLz48cGF0aCBkPSJNMjYgNlYxNEgyNlYxNkgzNkwyNiA2WiIgZmlsbD0iIzFBNzNFOCIvPjxwYXRoIGQ9Ik0xOCAyMkgzME0xOCAyNkgzME0xOCAzMEgyNiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=';

/**
 * Editor component provides a rich text editing experience with support for images and documents.
 * This is a managed editor that automatically synchronizes with the SmartInput state.
 * It handles block rendering, cursor positioning, and user interactions.
 *
 * @component
 * @example
 * ```tsx
 * <Editor
 *   enableLineBreaks={true}
 *   placeholder="Type something..."
 *   imageWidth="100px"
 * />
 * ```
 */
export const Editor: FC<EditorProps> = memo(function Editor({
  enableLineBreaks = false,
  imageWidth,
  imageHeight,
  documentWidth,
  documentHeight,
  className,
  placeholder = 'Start typing',
  editorClassName,
  ...eventHandlers
}) {
  const preRef = useRef<HTMLPreElement | null>(null);
  const { blocks, setBlocks } = useBlocks((s) => s);
  const { undoBuffer, appendToBuffer } = useBuffer((s) => s);
  const { blockRerenderHandlers } = useBlockRerenderHandlers((s) => s);
  const { characterPosition, updateCharacterPosition } = useCursorPosition(
    (s) => s,
  );

  // Watch for DOM mutations and notify blockRerenderHandlers of changed styled blocks
  const handleMutations = useCallback(
    (mutations: MutationRecord[]) => {
      if (!preRef.current || blockRerenderHandlers.length === 0) return;

      // Track unique styled blocks that have been affected
      const affectedBlockIds = new Set<string>();

      mutations.forEach((mutation) => {
        // Check if mutation affected a styled block
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement && node.id) {
              affectedBlockIds.add(node.id);
            }
          });
        } else if (
          mutation.type === 'attributes' ||
          mutation.type === 'characterData'
        ) {
          let target: Node | null = mutation.target;
          // Walk up the DOM to find the styled block element
          while (target && target !== preRef.current) {
            if (target instanceof HTMLElement && target.id) {
              affectedBlockIds.add(target.id);
              break;
            }
            target = target.parentNode;
          }
        }
      });

      if (affectedBlockIds.size > 0) {
        // Get the styled blocks that were affected with their DOM elements
        const rerenderedStyledBlocks = blocks
          .filter(
            (block): block is StyledBlock =>
              block.type === BlockType.Styled &&
              'id' in block &&
              affectedBlockIds.has(block.id),
          )
          .map((block) => ({
            block,
            element: preRef.current?.querySelector(
              `#${block.id}`,
            ) as HTMLElement | null,
          }));

        if (rerenderedStyledBlocks.length > 0) {
          // Call all registered handlers
          blockRerenderHandlers.forEach((handler) => {
            handler(rerenderedStyledBlocks);
          });
        }
      }
    },
    [blocks, blockRerenderHandlers],
  );

  useMutationObserver(preRef.current, handleMutations, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true,
  });

  const handleDeleteBlock = useCallback(
    (blockId: string) => {
      const newBlocks = blocks.filter((b) => !('id' in b) || b.id !== blockId);
      setBlocks(newBlocks);
      appendToBuffer(newBlocks);
    },
    [blocks, setBlocks, appendToBuffer],
  );

  const createElementOptions = useMemo(
    () => ({
      ...(imageWidth !== undefined && { imageWidth }),
      ...(imageHeight !== undefined && { imageHeight }),
      ...(documentWidth !== undefined && { documentWidth }),
      ...(documentHeight !== undefined && { documentHeight }),
      onDeleteBlock: handleDeleteBlock,
    }),
    [imageWidth, imageHeight, documentWidth, documentHeight, handleDeleteBlock],
  );

  useEffect(() => {
    if (!preRef.current) return;
    const preElement = preRef.current;
    let cnt = 0;
    while (cnt < blocks.length) {
      const block = blocks[cnt];
      if (!block) {
        cnt += 1;
        continue;
      }
      const domElement =
        cnt < preElement.childNodes.length
          ? (preElement.childNodes[cnt] as HTMLElement)
          : null; // get dom element at position
      if (domElement) {
        if (block.type === BlockType.Text) {
          if (domElement.nodeName !== '#text') {
            if (preContainsTextNode(preElement, block.text, cnt + 1)) {
              // text node exists further down, remove this element
              domElement.remove();
              continue;
            }
            preElement.insertBefore(
              createElement(block, createElementOptions),
              domElement,
            ); // insert text node as it is new
          } else {
            if (domElement.textContent !== block.text) {
              domElement.textContent = block.text; // text node exists but text has changed
            }
          }
        } else {
          // span, img, or div block
          const blockId = 'id' in block ? block.id : undefined;
          if (blockId && blockId === domElement.id) {
            //same block, check for changes
            if (
              block.type === BlockType.Document ||
              block.type === BlockType.Image
            ) {
              // Image/Document blocks - now wrapped in span containers
              if (domElement.nodeName === 'SPAN') {
                const imgElement = domElement.querySelector(
                  'img',
                ) as HTMLImageElement;
                if (imgElement) {
                  const expectedSrc =
                    block.type === BlockType.Image ? block.url : DOCUMENT_ICON;
                  if (imgElement.src !== expectedSrc) {
                    imgElement.src = expectedSrc;
                  }
                }
              }
            } else if (block.type === BlockType.Styled) {
              const blockCss = stringifyCSSProperties(block.style ?? {});
              if (
                areStylesDifferent(block.style ?? {}, domElement.style.cssText)
              ) {
                domElement.style.cssText = blockCss; // element matches but style has changed
              }
              if (domElement.className !== (block.className ?? '')) {
                domElement.className = block.className ?? '';
              }
              if (
                domElement.isContentEditable !== !(block.uneditable ?? false)
              ) {
                domElement.contentEditable =
                  block.uneditable ?? false ? 'false' : 'true';
              }
              if (getElementText(domElement) !== block.text) {
                setElementText(domElement, block.text); // element matches but text has changed
              }
            }
          } else {
            const element = createElement(block, createElementOptions);
            if (blockId && preContainsNode(preElement, blockId, cnt + 1)) {
              // dom element must have been removed
              domElement.remove();
              continue;
            }
            if (block.type === BlockType.Styled) {
              addBlockEventListeners(
                domElement as HTMLElement,
                block,
                eventHandlers,
              );
            }
            preElement.insertBefore(element, domElement); //insert element as it is new
          }
        }
      } else {
        const domElement = createElement(block, createElementOptions);
        if (block.type === BlockType.Styled) {
          addBlockEventListeners(
            domElement as HTMLElement,
            block,
            eventHandlers,
          );
        }
        preElement.appendChild(domElement); // append element as it is new and there are no more elements
      }
      cnt += 1;
    }
    let extra = 0;
    const lastBlock = blocks[blocks.length - 1];
    if (
      lastBlock &&
      blocks.length > 0 &&
      'text' in lastBlock &&
      lastBlock.text.length > 0 &&
      lastBlock.text[lastBlock.text.length - 1] === '\n'
    ) {
      const childNodeAtLength = preElement.childNodes[blocks.length];
      if (
        preElement.childNodes.length > blocks.length &&
        childNodeAtLength &&
        isCarridgeReturn(childNodeAtLength)
      ) {
        extra = 1;
      }
    }
    while (preElement.childNodes.length > blocks.length + extra) {
      const lastChild = preElement.lastChild;
      if (lastChild) {
        preElement.removeChild(lastChild);
      }
    }
    const range = getSelectionRange(preElement);
    const position = range ? getCursorPosition(preElement, range) : 0;
    if (position !== characterPosition) {
      setCursorPosition(preElement, characterPosition);
    }
  }, [blocks, characterPosition, createElementOptions, eventHandlers]);

  const handleChange = useCallback(
    (isReturn?: boolean) => {
      if (!preRef.current) return;
      const preElement = preRef.current;
      let cnt = 0;
      const newBlocks: Block[] = [];
      while (cnt < preElement.childNodes.length) {
        const domElement = preElement.childNodes[cnt] as HTMLElement | Text;
        if ('id' in domElement && domElement.id) {
          const block = blocks.find((b) => 'id' in b && b.id === domElement.id);
          if (block) {
            // For DocumentBlock and ImageBlock, preserve the block as-is (no text content)
            if (
              block.type === BlockType.Document ||
              block.type === BlockType.Image
            ) {
              newBlocks.push(block);
            } else if (block.type === BlockType.Styled) {
              const styledBlock = block as StyledBlock;
              if (getElementText(domElement) !== styledBlock.text) {
                styledBlock.text =
                  replaceLineFeeds(getElementText(domElement)) ?? '';
              }
              newBlocks.push(styledBlock);
            }
          }
        } else {
          let text = domElement.textContent ?? '';
          const nextNode = preElement.childNodes[cnt + 1];
          while (
            cnt + 1 < preElement.childNodes.length &&
            nextNode &&
            (!('id' in nextNode) || !(nextNode as HTMLElement)?.id)
          ) {
            text += preElement.childNodes[cnt + 1]?.textContent ?? '';
            cnt += 1;
          }
          newBlocks.push({
            type: BlockType.Text,
            text: replaceLineFeeds(text),
          });
        }
        cnt += 1;
      }
      const deletedBlocks = blocks.filter(
        (b) =>
          'id' in b &&
          newBlocks.findIndex((nb) => 'id' in nb && nb.id === b.id) === -1,
      );
      if (deletedBlocks.some((b) => 'undeletable' in b && b.undeletable)) {
        setBlocks([...blocks]);
        return;
      }
      const finalBlocks = !enableLineBreaks
        ? newBlocks.map((b) =>
            'text' in b
              ? {
                  ...b,
                  text: b.text.replaceAll('\n', ''),
                }
              : b,
          )
        : isReturn
        ? insertCarridgeReturn(preElement, newBlocks)
        : newBlocks;
      if (isReturn) {
        updateCharacterPosition(characterPosition + 1);
      }
      if (JSON.stringify(blocks) !== JSON.stringify(finalBlocks)) {
        setBlocks(finalBlocks);
        appendToBuffer(finalBlocks);
      }
    },
    [
      blocks,
      setBlocks,
      appendToBuffer,
      characterPosition,
      enableLineBreaks,
      updateCharacterPosition,
    ],
  );

  const handleUndo = useCallback(() => {
    const lastBlocks = undoBuffer();
    setBlocks(lastBlocks ?? []);
  }, [undoBuffer, setBlocks]);

  return (
    <div className={cx(style['editorContainer'], className)}>
      <UnmanagedEditor
        ref={preRef}
        onChange={handleChange}
        onUndo={handleUndo}
        enableLineBreaks={enableLineBreaks}
        placeholder={placeholder}
        className={editorClassName}
      />
    </div>
  );
});

Editor.displayName = 'Editor';
