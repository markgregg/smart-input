import React, { useCallback, useState, useRef, useEffect } from 'react';
import {
  Block,
  BlockType,
  DocumentBlock,
  ImageBlock,
  TextBlock,
  useBlocks,
  useCursorPosition,
  getBlockIndexAtPosition,
  useDragHandlers,
  DragEventType,
  generateId,
  isImageFile,
  getCaretRangeFromPoint,
  hasValidContent,
  setCursorPosition,
  useApi,
} from '@smart-input/core';
import { DropContentHandlerProps } from './dropContentHandlerProps';
import styles from './DropContentHandler.module.less';

/**
 * DropContentHandler adds drag-and-drop file support to the Editor.
 * It allows users to drag images and documents into the editor, automatically
 * inserting them as blocks at the drop position or cursor location.
 *
 * @component
 * @example
 * ```tsx
 * <SmartInput>
 *   <DropContentHandler
 *     acceptedTypes={['image/*', 'application/pdf']}
 *     onDropSuccess={(files) => console.log('Dropped:', files)}
 *   >
 *     <Editor />
 *   </DropContentHandler>
 * </SmartInput>
 * ```
 */
export const DropContentHandler: React.FC<DropContentHandlerProps> = ({
  children,
  acceptedTypes: _acceptedTypes = [
    'image/*',
    'application/pdf',
    '.doc',
    '.docx',
    '.txt',
  ],
  contentUndeletable,
  onDropSuccess,
  onDropError,
}) => {
  const { blocks, setBlocks } = useBlocks((state) => state);
  const { characterPosition } = useCursorPosition((state) => state);
  const { addDragHandler, removeDragHandler } = useDragHandlers(
    (state) => state,
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dropIndicatorPos, setDropIndicatorPos] = useState<{
    x: number;
    y: number;
    height: number;
  } | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const api = useApi((s) => s.api);

  const handleFiles = useCallback(
    (
      files: FileList | null,
      insertInfo?: { index: number; splitOffset?: number },
    ) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      const newBlocks: (DocumentBlock | ImageBlock)[] = [];

      fileArray.forEach((file) => {
        if (isImageFile(file)) {
          const imageBlock: ImageBlock = {
            type: BlockType.Image,
            id: generateId(),
            name: file.name,
            file: file,
            url: URL.createObjectURL(file),
            alt: file.name,
            contentType: file.type,
            undeletable: contentUndeletable,
          };
          newBlocks.push(imageBlock);
        } else {
          const documentBlock: DocumentBlock = {
            type: BlockType.Document,
            id: generateId(),
            name: file.name,
            file: file,
            url: URL.createObjectURL(file),
            contentType: file.type,
            undeletable: contentUndeletable,
          };
          newBlocks.push(documentBlock);
        }
      });

      // Calculate character position after insertion
      let newCursorPosition = 0;

      // Insert at the specified position or at the end
      if (
        insertInfo !== undefined &&
        insertInfo.index >= 0 &&
        insertInfo.index <= blocks.length
      ) {
        // Check if we need to split a text block
        if (
          insertInfo.splitOffset !== undefined &&
          insertInfo.index < blocks.length
        ) {
          const blockAtIndex = blocks[insertInfo.index];
          if (blockAtIndex && blockAtIndex.type === BlockType.Text) {
            const textBlock = blockAtIndex as TextBlock;
            const beforeText = textBlock.text.substring(
              0,
              insertInfo.splitOffset,
            );
            const afterText = textBlock.text.substring(insertInfo.splitOffset);

            const updatedBlocks: Block[] = [
              ...blocks.slice(0, insertInfo.index),
            ];

            // Count characters before insertion point
            for (let i = 0; i < insertInfo.index; i++) {
              const block = blocks[i];
              if (
                block &&
                (block.type === BlockType.Text ||
                  block.type === BlockType.Styled)
              ) {
                newCursorPosition += block.text.length;
              }
            }

            // Add the before text block if not empty
            if (beforeText.length > 0) {
              updatedBlocks.push({
                type: BlockType.Text,
                text: beforeText,
              });
              newCursorPosition += beforeText.length;
            }

            // Add the new image/document blocks
            updatedBlocks.push(...newBlocks);

            // Add the after text block if not empty
            if (afterText.length > 0) {
              updatedBlocks.push({
                type: BlockType.Text,
                text: afterText,
              });
            }

            // Add remaining blocks
            updatedBlocks.push(...blocks.slice(insertInfo.index + 1));

            setBlocks(updatedBlocks);
          } else {
            // blockAtIndex doesn't exist or is not a text block - simple insertion
            const updatedBlocks = [
              ...blocks.slice(0, insertInfo.index),
              ...newBlocks,
              ...blocks.slice(insertInfo.index),
            ];

            // Count characters up to insertion point
            for (let i = 0; i < insertInfo.index; i++) {
              const block = blocks[i];
              if (
                block &&
                (block.type === BlockType.Text ||
                  block.type === BlockType.Styled)
              ) {
                newCursorPosition += block.text.length;
              }
            }

            setBlocks(updatedBlocks);
          }
        } else {
          // Simple insertion without splitting
          const updatedBlocks = [
            ...blocks.slice(0, insertInfo.index),
            ...newBlocks,
            ...blocks.slice(insertInfo.index),
          ];

          // Count characters up to insertion point
          for (let i = 0; i < insertInfo.index; i++) {
            const block = blocks[i];
            if (
              block &&
              (block.type === BlockType.Text || block.type === BlockType.Styled)
            ) {
              newCursorPosition += block.text.length;
            }
          }

          setBlocks(updatedBlocks);
        }
      } else {
        // No valid insert position - append at end
        setBlocks([...blocks, ...newBlocks]);

        // Count all characters in existing blocks
        for (const block of blocks) {
          if (
            block &&
            (block.type === BlockType.Text || block.type === BlockType.Styled)
          ) {
            newCursorPosition += block.text.length;
          }
        }
      }

      // Update cursor position after the inserted blocks
      setTimeout(() => {
        api?.setCursorPosition(newCursorPosition);
      }, 0);

      onDropSuccess?.(fileArray);
    },
    [api, blocks, setBlocks, onDropSuccess, setCursorPosition],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLPreElement>): boolean => {
      if (!hasValidContent(e.dataTransfer)) {
        return false;
      }

      setIsDragging(true);

      // Get the editor element and drop zone
      const dropZone = editorRef.current;
      const editorElement = dropZone?.querySelector('pre');

      if (editorElement && dropZone) {
        const dropZoneRect = dropZone.getBoundingClientRect();
        const editorRect = editorElement.getBoundingClientRect();

        // Get line height for better indicator sizing
        const lineHeight =
          parseFloat(getComputedStyle(editorElement).lineHeight) || 20;

        // Check if there are no blocks - show indicator at start of editor
        if (blocks.length === 0) {
          const x = editorRect.left - dropZoneRect.left;
          const y = editorRect.top - dropZoneRect.top;

          setDropIndicatorPos({
            x,
            y,
            height: lineHeight,
          });
          return true;
        }

        const range = getCaretRangeFromPoint(e.clientX, e.clientY);

        if (range) {
          const rect = range.getBoundingClientRect();

          // Calculate position relative to the dropZone element
          const x = rect.left - dropZoneRect.left;
          const y = rect.top - dropZoneRect.top;

          setDropIndicatorPos({
            x,
            y,
            height: lineHeight,
          });
        } else {
          // If we can't get a range, position at the cursor location within editor bounds
          const x = e.clientX - dropZoneRect.left;
          const y = e.clientY - dropZoneRect.top;

          setDropIndicatorPos({
            x,
            y,
            height: lineHeight,
          });
        }
      }

      return true;
    },
    [blocks.length],
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLPreElement>): boolean => {
      if (!hasValidContent(e.dataTransfer)) {
        return false;
      }

      setIsDragging(false);
      setDropIndicatorPos(null);

      return true;
    },
    [],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLPreElement>): boolean => {
      if (!hasValidContent(e.dataTransfer)) {
        return false;
      }

      setIsDragging(false);
      setDropIndicatorPos(null);

      const files = e.dataTransfer.files;

      if (files && files.length > 0) {
        try {
          // Calculate the insertion index based on drop position
          let insertInfo: { index: number; splitOffset?: number } | undefined =
            undefined;
          let dropCharacterPosition = characterPosition;

          // Try to get the character position from the drop coordinates
          const editorElement = editorRef.current?.querySelector('pre');
          if (editorElement) {
            const range = getCaretRangeFromPoint(e.clientX, e.clientY);

            // Calculate character position from the range
            if (range && editorElement.contains(range.startContainer)) {
              const tempRange = document.createRange();
              tempRange.selectNodeContents(editorElement);
              tempRange.setEnd(range.startContainer, range.startOffset);
              dropCharacterPosition = tempRange.toString().length;
            }
          }

          if (blocks.length > 0) {
            // Find the block index at the drop position
            const blockInfo = getBlockIndexAtPosition(
              dropCharacterPosition,
              blocks,
            );
            if (blockInfo !== null) {
              const currentBlock = blocks[blockInfo.index];
              if (!currentBlock) {
                insertInfo = { index: blocks.length };
              } else if (
                currentBlock.type === BlockType.Text &&
                blockInfo.offset > 0
              ) {
                insertInfo = {
                  index: blockInfo.index,
                  splitOffset: blockInfo.offset,
                };
              } else {
                // Insert after the current block for styled blocks or at start of text block
                insertInfo = { index: blockInfo.index + 1 };
              }
            } else {
              // If cursor position is beyond all blocks, append at the end
              insertInfo = { index: blocks.length };
            }
          } else {
            // No blocks exist, insert at the beginning
            insertInfo = { index: 0 };
          }

          handleFiles(files, insertInfo);
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to handle dropped files';
          onDropError?.(errorMessage);
        }
      }

      return true;
    },
    [handleFiles, onDropError, blocks, characterPosition],
  );

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

  return (
    <div
      ref={editorRef}
      className={`${styles['dropZone']} ${
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

DropContentHandler.displayName = 'DropContentHandler';
export default DropContentHandler;
