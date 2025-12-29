import React, {
  useCallback,
  useState,
  useRef,
  ReactNode,
  useEffect,
} from 'react';
import {
  useBlocks,
  Block,
  BlockType,
  TextBlock,
  DragEventType,
  getBlockIndexAtPosition,
  useDragHandlers,
  isDraggableBlock,
  getCaretRangeFromPoint,
  useBlockRerenderHandlers,
  StyledBlockElement,
} from '@smart-input/core';
import styles from './DragBlocksHandler.module.less';

/**
 * Props for the DragBlocksHandler component.
 */
interface DragBlocksHandlerProps {
  /** Child components to render (typically SmartInput with Editor) */
  children: ReactNode;
}

/**
 * Position information for the drop indicator visual cue.
 * @internal
 */
interface DropIndicatorPosition {
  /** X coordinate of the indicator */
  x: number;
  /** Y coordinate of the indicator */
  y: number;
  /** Height of the indicator line */
  height: number;
  /** The block index where the drop would occur */
  index: number;
}

/**
 * DragBlocksHandler enables drag-and-drop reordering of blocks within the editor.
 * It displays a visual drop indicator and handles the drag events to reorder blocks.
 *
 * @component
 * @example
 * ```tsx
 * <SmartInput>
 *   <DragBlocksHandler>
 *     <Editor />
 *   </DragBlocksHandler>
 * </SmartInput>
 * ```
 */
export const DragBlocksHandler: React.FC<DragBlocksHandlerProps> = ({
  children,
}) => {
  const { blocks, setBlocks } = useBlocks((s) => s);
  const { addDragHandler, removeDragHandler } = useDragHandlers((s: any) => s);
  const [isDragging, setIsDragging] = useState(false);
  const [dropIndicatorPos, setDropIndicatorPos] =
    useState<DropIndicatorPosition | null>(null);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const { addBlockRerenderHandlers, removeBlockRerenderHandlers } =
    useBlockRerenderHandlers((s) => s);

  // Helper function to find a draggable block by ID
  const findDraggableBlock = useCallback(
    (blockId: string) => blocks.find((b) => isDraggableBlock(b, blockId)),
    [blocks],
  );

  const getBlockIndexFromPosition = useCallback(
    (clientX: number, clientY: number): number => {
      const editorElement = editorRef.current?.querySelector('pre');
      if (!editorElement) return blocks.length;

      const editorRect = editorElement.getBoundingClientRect();

      // If above the editor, insert at start
      if (clientY < editorRect.top) return 0;

      // If below the editor, insert at end
      if (clientY > editorRect.bottom) return blocks.length;

      let closestIndex = blocks.length;
      let minDistance = Infinity;

      // Find the closest block position
      const children = Array.from(editorElement.childNodes);
      let currentIndex = 0;

      for (const node of children) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;
          const rect = element.getBoundingClientRect();
          const midY = rect.top + rect.height / 2;
          const distance = Math.abs(clientY - midY);

          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = clientY < midY ? currentIndex : currentIndex + 1;
          }
          currentIndex++;
        } else if (node.nodeType === Node.TEXT_NODE) {
          // For text nodes, we need to increment based on text blocks
          const blockIds = blocks.filter(
            (b) => b.type === BlockType.Text || b.type === BlockType.Styled,
          );
          if (currentIndex < blockIds.length) {
            currentIndex++;
          }
        }
      }

      return Math.min(closestIndex, blocks.length);
    },
    [blocks],
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      const blockElement = target.closest('[id]') as HTMLElement;

      if (!blockElement || !blockElement.id) return;

      const blockId = blockElement.id;
      const block = findDraggableBlock(blockId);

      // Only allow dragging uneditable styled blocks, images and documents
      if (!block) {
        e.preventDefault();
        return;
      }

      setDraggedBlockId(blockId);
      setIsDragging(true);

      // Set drag data
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', blockId);

      // Add visual feedback
      if (blockElement) {
        blockElement.style.opacity = '0.5';
      }
    },
    [blocks],
  );

  const handleDragEnd = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const blockElement = target.closest('[id]') as HTMLElement;

    if (blockElement) {
      blockElement.style.opacity = '1';
    }

    setIsDragging(false);
    setDropIndicatorPos(null);
    setDraggedBlockId(null);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLPreElement>): boolean => {
      if (!isDragging) return false;
      if (!draggedBlockId) return false;

      const dropZone = editorRef.current;
      const editorElement = dropZone?.querySelector('pre');

      if (!editorElement || !dropZone) return false;

      const dropZoneRect = dropZone.getBoundingClientRect();

      // Get line height for indicator sizing
      const lineHeight =
        parseFloat(getComputedStyle(editorElement).lineHeight) || 20;

      // Get the precise caret position
      const range = getCaretRangeFromPoint(e.clientX, e.clientY);

      if (range) {
        const rect = range.getBoundingClientRect();

        // Position indicator at the exact caret position
        const indicatorX = rect.left - dropZoneRect.left;
        const indicatorY = rect.top - dropZoneRect.top;

        const targetIndex = getBlockIndexFromPosition(e.clientX, e.clientY);

        setDropIndicatorPos({
          x: indicatorX,
          y: indicatorY,
          height: lineHeight,
          index: targetIndex,
        });
      } else {
        // Fallback to block-based positioning if range is not available
        const editorRect = editorElement.getBoundingClientRect();
        const targetIndex = getBlockIndexFromPosition(e.clientX, e.clientY);
        let indicatorY = editorRect.top - dropZoneRect.top;
        const indicatorX = editorRect.left - dropZoneRect.left;

        if (targetIndex === 0) {
          indicatorY = editorRect.top - dropZoneRect.top;
        } else if (targetIndex >= blocks.length) {
          indicatorY = editorRect.bottom - dropZoneRect.top - lineHeight;
        } else {
          const children = Array.from(editorElement.childNodes);
          let nodeIndex = 0;

          for (let i = 0; i < children.length && nodeIndex < targetIndex; i++) {
            const node = children[i];
            if (!node) continue;
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              if (nodeIndex === targetIndex - 1) {
                const rect = element.getBoundingClientRect();
                indicatorY = rect.bottom - dropZoneRect.top;
                break;
              }
              nodeIndex++;
            }
          }
        }

        setDropIndicatorPos({
          x: indicatorX,
          y: indicatorY,
          height: lineHeight,
          index: targetIndex,
        });
      }
      return true;
    },
    [isDragging, draggedBlockId, blocks, getBlockIndexFromPosition],
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLPreElement>): boolean => {
      if (!isDragging) return false;

      // Only clear if we're leaving the drop zone entirely
      const relatedTarget = e.relatedTarget as Node;
      if (!editorRef.current?.contains(relatedTarget)) {
        setDropIndicatorPos(null);
      }
      return true;
    },
    [isDragging],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLPreElement>): boolean => {
      if (!isDragging) return false;

      if (!draggedBlockId || !dropIndicatorPos) {
        setIsDragging(false);
        setDropIndicatorPos(null);
        setDraggedBlockId(null);
        return false;
      }

      const draggedBlock = findDraggableBlock(draggedBlockId);
      if (!draggedBlock) return false;

      const currentIndex = blocks.findIndex((b) =>
        isDraggableBlock(b, draggedBlockId),
      );

      // Calculate the character position from the drop coordinates
      let dropCharacterPosition = 0;
      const editorElement = editorRef.current?.querySelector('pre');

      if (editorElement) {
        const range = getCaretRangeFromPoint(e.clientX, e.clientY);

        // Calculate character position from the range
        if (range && editorElement.contains(range.startContainer)) {
          // Count only top-level text nodes and text/BR in top-level elements
          let charCount = 0;
          const walker = document.createTreeWalker(
            editorElement,
            NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
            {
              acceptNode: (node) => {
                // Accept top-level text nodes
                if (
                  node.nodeType === Node.TEXT_NODE &&
                  node.parentNode === editorElement
                ) {
                  return NodeFilter.FILTER_ACCEPT;
                }
                // Accept text nodes that are children of top-level elements
                if (
                  node.nodeType === Node.TEXT_NODE &&
                  node.parentNode?.parentNode === editorElement
                ) {
                  return NodeFilter.FILTER_ACCEPT;
                }
                // Skip everything else
                return NodeFilter.FILTER_SKIP;
              },
            },
          );

          let currentNode: Node | null;
          while ((currentNode = walker.nextNode()) !== null) {
            if (currentNode === range.startContainer) {
              charCount += range.startOffset;
              break;
            } else if (currentNode.nodeType === Node.TEXT_NODE) {
              charCount += currentNode.textContent?.length || 0;
            } else if (currentNode.nodeName === 'BR') {
              charCount += 1; // Count BR as a single character (newline)
            }

            // Stop if we've passed the target
            if (
              range.startContainer.compareDocumentPosition(currentNode) &
              Node.DOCUMENT_POSITION_FOLLOWING
            ) {
              break;
            }
          }

          dropCharacterPosition = charCount;
        }
      }

      // Calculate total character count to check if dropping at the very end
      const totalCharCount = blocks.reduce((sum, block) => {
        if ('text' in block) {
          return sum + (block.text?.length || 0);
        }
        return sum;
      }, 0);

      // If dropping after the last character, move to the end
      if (dropCharacterPosition >= totalCharCount) {
        const newBlocks = blocks.filter((_, idx) => idx !== currentIndex);
        newBlocks.push(draggedBlock);
        setBlocks(newBlocks);
        setIsDragging(false);
        setDropIndicatorPos(null);
        setDraggedBlockId(null);
        return true;
      }

      // Find the block index at the drop position
      const blockInfo = getBlockIndexAtPosition(dropCharacterPosition, blocks);

      if (blockInfo !== null) {
        const targetBlock = blocks[blockInfo.index];
        if (!targetBlock) {
          setIsDragging(false);
          setDropIndicatorPos(null);
          setDraggedBlockId(null);
          return false;
        }

        // Check if we're dropping at the end of a text block
        if (
          targetBlock.type === BlockType.Text &&
          'text' in targetBlock &&
          blockInfo.offset === targetBlock.text.length
        ) {
          // Dropping at the end - insert after this block
          const newBlocks = blocks.filter((_, idx) => idx !== currentIndex);
          const adjustedTargetIndex =
            currentIndex < blockInfo.index
              ? blockInfo.index
              : blockInfo.index + 1;
          newBlocks.splice(adjustedTargetIndex, 0, draggedBlock);
          setBlocks(newBlocks);
        } else if (
          targetBlock.type === BlockType.Text &&
          'text' in targetBlock &&
          blockInfo.offset > 0 &&
          blockInfo.offset < targetBlock.text.length
        ) {
          // Split the text block
          const beforeText = targetBlock.text.substring(0, blockInfo.offset);
          const afterText = targetBlock.text.substring(blockInfo.offset);

          // Remove the dragged block from its current position
          const newBlocks = blocks.filter((_, idx) => idx !== currentIndex);

          // Adjust target index if the dragged block was before the target
          const adjustedTargetIndex =
            currentIndex < blockInfo.index
              ? blockInfo.index - 1
              : blockInfo.index;

          // Build the new blocks array with the split text
          const result: Block[] = [
            ...newBlocks.slice(0, adjustedTargetIndex),
            { type: BlockType.Text, text: beforeText } as TextBlock,
            draggedBlock,
            { type: BlockType.Text, text: afterText } as TextBlock,
            ...newBlocks.slice(adjustedTargetIndex + 1),
          ];

          setBlocks(result);
        } else {
          // Not in the middle of a text block, use the original logic
          let targetIndex = dropIndicatorPos.index;

          // Adjust target index if moving from before to after
          if (currentIndex < targetIndex) {
            targetIndex--;
          }

          if (currentIndex === targetIndex) {
            setIsDragging(false);
            setDropIndicatorPos(null);
            setDraggedBlockId(null);
            return true;
          }

          // Create new blocks array with reordered blocks
          const newBlocks = [...blocks];
          newBlocks.splice(currentIndex, 1);
          newBlocks.splice(targetIndex, 0, draggedBlock);

          setBlocks(newBlocks);
        }
      } else {
        // Fallback to original behavior if blockInfo is null
        let targetIndex = dropIndicatorPos.index;

        if (currentIndex < targetIndex) {
          targetIndex--;
        }

        if (currentIndex === targetIndex) {
          setIsDragging(false);
          setDropIndicatorPos(null);
          setDraggedBlockId(null);
          return true;
        }

        const newBlocks = [...blocks];
        newBlocks.splice(currentIndex, 1);
        newBlocks.splice(targetIndex, 0, draggedBlock);

        setBlocks(newBlocks);
      }

      setIsDragging(false);
      setDropIndicatorPos(null);
      setDraggedBlockId(null);
      return true;
    },
    [
      isDragging,
      blocks,
      setBlocks,
      draggedBlockId,
      dropIndicatorPos,
      findDraggableBlock,
      getBlockIndexFromPosition,
      isDraggableBlock,
    ],
  );

  // Register drag event handlers with the DragHandlerState
  useEffect(() => {
    addDragHandler(DragEventType.DragOver, handleDragOver);
    addDragHandler(DragEventType.DragLeave, handleDragLeave);
    addDragHandler(DragEventType.Drop, handleDrop);

    return () => {
      removeDragHandler(DragEventType.DragOver, handleDragOver);
      removeDragHandler(DragEventType.DragLeave, handleDragLeave);
      removeDragHandler(DragEventType.Drop, handleDrop);
    };
  }, [
    addDragHandler,
    removeDragHandler,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  ]);

  // Add drag event handlers to styled blocks
  const attachDragHandlers = useCallback(
    (elements: HTMLElement[]) => {
      const handleDragStartCapture = (e: DragEvent) => {
        handleDragStart(e as unknown as React.DragEvent<HTMLDivElement>);
      };

      const handleDragEndCapture = (e: DragEvent) => {
        handleDragEnd(e as unknown as React.DragEvent<HTMLDivElement>);
      };

      const handleMouseDownCapture = (e: MouseEvent) => {
        // For contenteditable=false elements, we need to prevent text selection
        // to allow dragging to work properly
        const target = e.target as HTMLElement;
        const blockElement = target.closest('[id]') as HTMLElement;
        if (
          blockElement &&
          blockElement.hasAttribute('draggable') &&
          blockElement.contentEditable === 'false'
        ) {
          // Don't prevent default entirely - just ensure selection doesn't interfere
          e.stopPropagation();
        }
      };

      elements.forEach((element) => {
        element.setAttribute('draggable', 'true');
        element.style.cursor = 'grab';
        // @ts-expect-error - webkitUserDrag is a non-standard property not in TypeScript types
        element.style.webkitUserDrag = 'element';
        element.addEventListener('mousedown', handleMouseDownCapture, true);
        element.addEventListener('dragstart', handleDragStartCapture);
        element.addEventListener('dragend', handleDragEndCapture);
      });
    },
    [handleDragStart, handleDragEnd],
  );

  // Attach handlers initially and when blocks change
  React.useEffect(() => {
    const editorElement = editorRef.current?.querySelector('pre');
    if (!editorElement) return;
    const styledElements = editorElement.querySelectorAll<HTMLElement>('[id]');
    const elements = Array.from(styledElements).filter(
      (element) =>
        !element.draggable &&
        findDraggableBlock(element.id)?.type === BlockType.Styled,
    );
    attachDragHandlers(elements);
  }, [attachDragHandlers, findDraggableBlock]);

  useEffect(() => {
    const reattachDragHandlers = (blocksElements: StyledBlockElement[]) => {
      const elements = blocksElements
        .filter(
          (be) =>
            be.block.uneditable &&
            be.element !== null &&
            (be.element.style.cursor !== 'grab' || !be.element.draggable),
        )
        .map((be) => be.element);
      attachDragHandlers(elements as HTMLElement[]);
    };
    addBlockRerenderHandlers(reattachDragHandlers);
    return () => {
      removeBlockRerenderHandlers(reattachDragHandlers);
    };
  }, [
    attachDragHandlers,
    addBlockRerenderHandlers,
    removeBlockRerenderHandlers,
  ]);

  return (
    <div
      ref={editorRef}
      className={`${styles['dragZone']} ${
        isDragging ? styles['dragging'] : ''
      }`}
    >
      {children}
      {isDragging && dropIndicatorPos && (
        <div
          className={styles['dropIndicator']}
          style={{
            left: `${dropIndicatorPos.x}px`,
            top: `${dropIndicatorPos.y}px`,
            height: `${dropIndicatorPos.height}px`,
          }}
        />
      )}
    </div>
  );
};
