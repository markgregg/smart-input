import { Block, BlockType, StyledBlock } from '@atypes/block';
import { CommitItem } from '@src/types';
import { BlockIndex } from '@src/types/api';

import { stringifyCSSProperties } from 'react-style-stringify';

const convertBlocksToCommitItems = (blocks: Block[]): CommitItem[] => {
  const items: CommitItem[] = [];
  let currentText = '';

  blocks.forEach((block) => {
    if (block.type === BlockType.Text || block.type === BlockType.Styled) {
      // Accumulate text from text and styled blocks
      currentText += 'text' in block ? block.text : '';
    } else if (block.type === BlockType.Document) {
      // When we hit a document, push accumulated text first
      if (currentText) {
        items.push(currentText);
        currentText = '';
      }
      // Transform DocumentBlock to Document type
      items.push({
        type: 'document',
        name: block.name,
        file: block.file,
        url: block.url,
        contentType: block.contentType,
      });
    } else if (block.type === BlockType.Image) {
      // When we hit an image, push accumulated text first
      if (currentText) {
        items.push(currentText);
        currentText = '';
      }
      // Transform ImageBlock to Image type
      items.push({
        type: 'image',
        name: block.name,
        file: block.file,
        url: block.url,
        ...(block.alt !== undefined ? { alt: block.alt } : {}),
        contentType: block.contentType,
      });
    }
  });

  // Push any remaining text at the end
  if (currentText) {
    items.push(currentText);
  }

  return items;
};

const getCursorPosition = (preElement: HTMLPreElement, selRange: Range) => {
  let charCount = 0;

  // Walk through only direct children and their direct text nodes
  for (let i = 0; i < preElement.childNodes.length; i++) {
    const node = preElement.childNodes[i];
    if (!node) continue;

    // Check if we've reached the selection container
    if (node === selRange.startContainer) {
      return charCount + selRange.startOffset;
    }

    // If the selection is inside this node, we need to check its direct children only
    if (node.contains(selRange.startContainer)) {
      // For elements, check their direct text children only
      if (node.nodeType === Node.ELEMENT_NODE) {
        for (let j = 0; j < node.childNodes.length; j++) {
          const childNode = node.childNodes[j];
          if (!childNode) continue;
          if (childNode === selRange.startContainer) {
            return charCount + selRange.startOffset;
          }
          if (childNode.nodeType === Node.TEXT_NODE) {
            if (childNode.contains(selRange.startContainer)) {
              return charCount + selRange.startOffset;
            }
            charCount += (childNode as Text).length;
          }
        }
        // If we didn't find it in direct children, just return current count
        return charCount;
      } else if (node.nodeType === Node.TEXT_NODE) {
        return charCount + selRange.startOffset;
      }
    }

    // Count characters in this top-level node
    if (node.nodeType === Node.TEXT_NODE) {
      charCount += (node as Text).length;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      // Count BR elements as single characters
      if (element.tagName === 'BR') {
        charCount += 1;
      } else {
        // Only count direct text node children of this element
        for (let j = 0; j < node.childNodes.length; j++) {
          const childNode = node.childNodes[j];
          if (!childNode) continue;
          if (childNode.nodeType === Node.TEXT_NODE) {
            charCount += (childNode as Text).length;
          } else if (childNode.nodeType === Node.ELEMENT_NODE) {
            const childElement = childNode as HTMLElement;
            if (childElement.tagName === 'BR') {
              charCount += 1;
            }
          }
        }
      }
    }
  }

  return charCount;
};

const getPositionAndRect = (range: Range, pre: HTMLPreElement | null) => {
  const rect = range.getBoundingClientRect();
  const characterPosition = pre ? getCursorPosition(pre, range) : 0;

  return {
    characterPosition,
    rect: {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
    },
  };
};

// Document icon as data URI (simple document/file icon)
const DOCUMENT_ICON =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIGZpbGw9IiNGNUY1RjUiLz48cGF0aCBkPSJNMTIgOEMxMiA2Ljg5NTQzIDEyLjg5NTQgNiAxNCA2SDI2TDM2IDE2VjQwQzM2IDQxLjEwNDYgMzUuMTA0NiA0MiAzNCA0MkgxNEMxMi44OTU0IDQyIDEyIDQxLjEwNDYgMTIgNDBWOFoiIGZpbGw9IiM0Mjg1RjQiLz48cGF0aCBkPSJNMjYgNlYxNEgyNlYxNkgzNkwyNiA2WiIgZmlsbD0iIzFBNzNFOCIvPjxwYXRoIGQ9Ik0xOCAyMkgzME0xOCAyNkgzME0xOCAzMEgyNiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=';

interface CreateElementOptions {
  imageWidth?: string;
  imageHeight?: string;
  documentWidth?: string;
  documentHeight?: string;
  onDeleteBlock?: (blockId: string) => void;
}

const createElement = (block: Block, options?: CreateElementOptions): Node => {
  if (block.type === BlockType.Text) {
    return document.createTextNode(block.text);
  }
  if (block.type === BlockType.Document) {
    const container = document.createElement('span');
    container.id = block.id;
    container.style.cssText =
      'position: relative; display: inline-block; vertical-align: middle; margin: 2px; cursor: pointer;';
    container.setAttribute('data-block-type', 'document');
    container.setAttribute('contenteditable', 'false');
    container.classList.add('media-block-container');

    // Open in new window on double click
    container.ondblclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (block.url) {
        window.open(block.url, '_blank');
      }
    };

    const img = document.createElement('img');
    img.src = DOCUMENT_ICON;
    img.alt = block.name;
    img.title = block.name;
    const width = options?.documentWidth || '32px';
    const height = options?.documentHeight || '32px';
    img.style.cssText = `width: ${width}; height: ${height}; display: block;`;
    img.setAttribute('contenteditable', 'false');

    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '×';
    deleteBtn.className = 'media-delete-btn';
    deleteBtn.setAttribute('contenteditable', 'false');
    deleteBtn.style.cssText =
      'position: absolute; top: -8px; right: -8px; width: 20px; height: 20px; border-radius: 50%; background: #ff4444; color: white; border: 2px solid white; cursor: pointer; font-size: 16px; line-height: 16px; padding: 0; display: none; z-index: 10;';
    if (options?.onDeleteBlock) {
      deleteBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        options.onDeleteBlock?.(block.id);
      };
    }

    container.appendChild(img);
    container.appendChild(deleteBtn);
    return container;
  }
  if (block.type === BlockType.Image) {
    const container = document.createElement('span');
    container.id = block.id;
    container.style.cssText =
      'position: relative; display: inline-block; vertical-align: middle; margin: 2px; cursor: pointer;';
    container.setAttribute('data-block-type', 'image');
    container.setAttribute('contenteditable', 'false');
    container.classList.add('media-block-container');

    // Open in new window on double click
    container.ondblclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (block.url) {
        window.open(block.url, '_blank');
      }
    };

    const img = document.createElement('img');
    img.src = block.url;
    img.alt = block.alt || block.name;
    img.title = block.name;
    const width = options?.imageWidth || '32px';
    const height = options?.imageHeight || '32px';
    img.style.cssText = `max-width: ${width}; max-height: ${height}; display: block;`;
    img.setAttribute('contenteditable', 'false');

    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '×';
    deleteBtn.className = 'media-delete-btn';
    deleteBtn.setAttribute('contenteditable', 'false');
    deleteBtn.style.cssText =
      'position: absolute; top: -8px; right: -8px; width: 20px; height: 20px; border-radius: 50%; background: #ff4444; color: white; border: 2px solid white; cursor: pointer; font-size: 16px; line-height: 16px; padding: 0; display: none; z-index: 10;';
    if (options?.onDeleteBlock) {
      deleteBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        options.onDeleteBlock?.(block.id);
      };
    }

    container.appendChild(img);
    container.appendChild(deleteBtn);
    return container;
  }
  const element = document.createElement('span');
  element.id = block.id;
  element.textContent = block.text;
  if ('style' in block && block.style) {
    element.style.cssText = stringifyCSSProperties(block.style);
  }
  return element;
};

const preContainsTextNode = (
  preElement: HTMLPreElement,
  text: string,
  start: number,
): boolean => {
  for (let i = start; i < preElement.childNodes.length; i++) {
    const element = preElement.childNodes[i];
    if (!element) continue;
    if (element.nodeName === '#text' && element.textContent === text) {
      return true;
    }
  }
  return false;
};

const preContainsNode = (
  preElement: HTMLPreElement,
  id: string,
  start: number,
): boolean => {
  for (let i = start; i < preElement.childNodes.length; i++) {
    const element = preElement.childNodes[i];
    if (!element) continue;
    if ('id' in element && element.id === id) {
      return true;
    }
  }
  return false;
};

const getSelectionRange = (preElement: HTMLPreElement) => {
  const selection = document.getSelection();
  if (!selection) return null;
  if (selection.anchorNode === preElement && preElement.lastChild) {
    const range = document.createRange();
    if (preElement.lastChild) {
      if (preElement.lastChild.nodeType === Node.ELEMENT_NODE) {
        range.setStartAfter(preElement.lastChild);
      }
      // If it's a text node, place cursor at the end of the text
      else if (preElement.lastChild.nodeType === Node.TEXT_NODE) {
        range.setStart(
          preElement.lastChild,
          (preElement.lastChild as Text).length,
        );
      }
      range.collapse(true);
      return range;
    }
  }
  if (selection.rangeCount > 0) {
    return selection.getRangeAt(0);
  }
  return null;
};

const replaceLineFeeds = (text: string) => {
  return text.replaceAll('\r\n', '\n').replaceAll('\r', '\n');
};

const getBlockAndOffset = (position: number, blocks: Block[]) => {
  let pos = Math.max(0, Math.floor(position));
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (!b) continue;
    if (b.type !== BlockType.Text && b.type !== BlockType.Styled) {
      continue;
    }
    const len = 'text' in b ? (b.text?.length ?? 0) : 0;
    if (pos <= len) {
      return { index: i, offset: pos, block: b };
    }
    pos -= len;
  }
  // position beyond end -> return last block end (or empty)
  if (blocks.length === 0)
    return { index: 0, offset: 0, block: undefined as unknown as Block };
  const last = blocks[blocks.length - 1];
  if (!last) {
    return { index: 0, offset: 0, block: undefined as unknown as Block };
  }
  const lastLen =
    last.type === BlockType.Text
      ? 'text' in last
        ? (last.text?.length ?? 0)
        : 0
      : 'text' in last
        ? (last.text?.length ?? 0)
        : 0;
  return { index: blocks.length - 1, offset: lastLen, block: last };
};

const insertCarridgeReturnInString = (text: string, offset: number) => {
  const start = offset > 0 ? text.substring(0, offset) : '';
  const end = offset < text.length ? text.substring(offset, text.length) : '';
  return start + '\n' + end;
};

const insertCarridgeReturn = (pre: HTMLPreElement, blocks: Block[]) => {
  const range = getSelectionRange(pre);
  const characterPosition = range ? getCursorPosition(pre, range) : 0;
  const { index, block, offset } = getBlockAndOffset(characterPosition, blocks);
  if (
    !block ||
    (block.type !== BlockType.Text && block.type !== BlockType.Styled)
  ) {
    return blocks;
  }
  const newBlock = {
    ...block,
    text: insertCarridgeReturnInString(block.text, offset),
  };
  setCursorPosition(pre, characterPosition + 1);
  return blocks.map((b, idx) => (idx === index ? newBlock : b));
};

const isCarridgeReturn = (childNode: ChildNode) => {
  return (
    childNode.nodeName === 'DIV' &&
    childNode.childNodes.length > 0 &&
    childNode.firstChild?.nodeName === 'BR'
  );
};

const setCursorPosition = (
  preElement: HTMLElement,
  characterPosition: number,
) => {
  // set cursor position to characterPosition
  const newRange = document.createRange();
  const sel = window.getSelection();
  let charCount = 0;
  let foundStart = false;

  // Walk through only direct children and their direct text nodes
  for (let i = 0; i < preElement.childNodes.length; i++) {
    const node = preElement.childNodes[i];
    if (!node) continue;

    if (node.nodeType === Node.TEXT_NODE) {
      // Top-level text node
      const nodeLength = (node as Text).length;
      const nextCharCount = charCount + nodeLength;
      if (
        characterPosition === nextCharCount &&
        node.nextSibling &&
        'contentEditable' in node.nextSibling &&
        node.nextSibling.contentEditable !== 'true'
      ) {
        foundStart = true;
        newRange.setStartAfter(node.nextSibling);
        break;
      }
      if (characterPosition <= nextCharCount) {
        foundStart = true;
        newRange.setStart(node, characterPosition - charCount);
        break;
      }
      charCount = nextCharCount;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      // Handle BR elements as single characters
      if (element.tagName === 'BR') {
        const nextCharCount = charCount + 1;
        if (characterPosition <= nextCharCount) {
          foundStart = true;
          newRange.setStart(node, 0);
          break;
        }
        charCount = nextCharCount;
      } else {
        // Only count direct text node children of this element
        for (let j = 0; j < node.childNodes.length; j++) {
          const childNode = node.childNodes[j];
          if (!childNode) continue;
          if (childNode.nodeType === Node.TEXT_NODE) {
            const nodeLength = (childNode as Text).length;
            const nextCharCount = charCount + nodeLength;
            if (characterPosition <= nextCharCount) {
              foundStart = true;
              newRange.setStart(childNode, characterPosition - charCount);
              break;
            }
            charCount = nextCharCount;
          } else if (childNode.nodeType === Node.ELEMENT_NODE) {
            const childElement = childNode as HTMLElement;
            if (childElement.tagName === 'BR') {
              const nextCharCount = charCount + 1;
              if (characterPosition <= nextCharCount) {
                foundStart = true;
                newRange.setStart(childNode, 0);
                break;
              }
              charCount = nextCharCount;
            }
          }
        }
        if (foundStart) {
          break;
        }
      }
    }
  }

  if (!foundStart && preElement.lastChild) {
    newRange.setStartAfter(preElement.lastChild);
  }
  newRange.collapse(true);
  if (sel) {
    sel.removeAllRanges();
    sel.addRange(newRange);
  }
};

const removeMatchedText = (text: string, matchedText: string): string => {
  const regex = new RegExp(
    matchedText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    'i',
  );
  return text.replace(regex, '');
};

const getBlockIndexAtPosition = (
  position: number,
  blocks: Block[],
): { index: number; offset: number } | null => {
  let blockStart = 0;
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (!block) continue;
    const blockLength = 'text' in block ? block.text.length : 0;
    if (position >= blockStart && position < blockStart + blockLength) {
      return {
        index: i,
        offset: position - blockStart,
      };
    }
    blockStart += blockLength;
  }
  return null;
};

const replaceTextAtPosition = (
  blocks: Block[],
  position: number,
  oldText: string,
  newText: string,
) => {
  const currentBlocks = blocks ?? [];
  const pos = Math.max(0, position ?? 0);

  // Find the block that contains the position
  let blockIndex = -1;
  let blockStart = 0;
  for (let i = 0; i < currentBlocks.length; i++) {
    const block = currentBlocks[i];
    if (!block) continue;
    const blockLength = 'text' in block ? block.text.length : 0;
    if (pos >= blockStart && pos < blockStart + blockLength) {
      blockIndex = i;
      break;
    }
    blockStart += blockLength;
  }

  // If no block found or oldText is not in the block, return false
  if (blockIndex === -1) {
    return null;
  }

  const currentBlock = currentBlocks[blockIndex];
  if (!currentBlock || !('text' in currentBlock)) {
    return null; // Can't replace text in non-text blocks
  }

  const blockText = currentBlock.text;
  const blockPos = pos - blockStart; // position within the block

  // Check if oldText is completely within the block
  const oldTextIndex = blockText.indexOf(oldText, blockPos);
  if (oldTextIndex !== blockPos) {
    return null; // oldText not found at the correct position
  }

  const newBlockText =
    blockText.slice(0, oldTextIndex) +
    newText +
    blockText.slice(oldTextIndex + oldText.length);
  const newBlocks = [...currentBlocks];
  newBlocks[blockIndex] = {
    ...currentBlock,
    text: newBlockText,
  };
  return {
    newBlocks,
    newPosition: position + newText.length,
  };
};

const insertStyledBlockAtPosition = (
  blocks: Block[],
  position: number,
  oldText: string,
  id: string,
  text: string,
  style: React.CSSProperties,
) => {
  const currentBlocks = blocks ?? [];
  let blockIndex = -1;
  let blockStart = 0;

  // Find the block that contains the position
  for (let i = 0; i < currentBlocks.length; i++) {
    const block = currentBlocks[i];
    if (!block) continue;
    const blockLength = 'text' in block ? block.text.length : 0;
    if (position >= blockStart && position < blockStart + blockLength) {
      blockIndex = i;
      break;
    }
    blockStart += blockLength;
  }

  const newBlocks = [...currentBlocks];
  const posInBlock = position - blockStart;

  if (blockIndex === -1) {
    // Position is at the end or before any blocks
    newBlocks.push({
      id,
      type: BlockType.Styled,
      text: text,
      style: style,
    } as Block);
  } else {
    // Split the current block and insert the styled block
    const currentBlock = newBlocks[blockIndex];
    if (!currentBlock) {
      return { newBlocks: currentBlocks, newPosition: position };
    }

    // Only process blocks that have text
    if (!('text' in currentBlock)) {
      return { newBlocks: currentBlocks, newPosition: position };
    }

    const beforeText = currentBlock.text.slice(0, posInBlock);
    const afterText = currentBlock.text.slice(posInBlock + oldText.length);

    if (posInBlock > 0) {
      newBlocks[blockIndex] = { ...currentBlock, text: beforeText };
    } else {
      newBlocks.splice(blockIndex, 1);
      blockIndex -= 1;
    }
    newBlocks.splice(blockIndex + 1, 0, {
      id,
      type: BlockType.Styled,
      text: text,
      style: style,
    } as Block);

    if (afterText) {
      newBlocks.splice(blockIndex + 2, 0, { ...currentBlock, text: afterText });
    }
  }

  return {
    newBlocks,
    newPosition: position + text.length,
  };
};

const transformToTextBlocks = (blocks: Block[], blockIndexes: BlockIndex[]) => {
  const currentBlocks = blocks ?? [];

  // Sort indices in descending order to safely remove blocks without affecting earlier indices
  const sortedIndices = blockIndexes
    .map((bi) => (typeof bi === 'number' ? bi : bi.idx))
    .sort((a, b) => b - a);

  const newBlocks = [...currentBlocks];

  for (const idx of sortedIndices) {
    if (idx < 0 || idx >= newBlocks.length) continue;

    const blockToTransform = newBlocks[idx];
    if (!blockToTransform) continue;

    // Skip blocks without text property
    if (!('text' in blockToTransform)) continue;

    const precedingBlock = idx > 0 ? newBlocks[idx - 1] : null;

    // If there's a preceding text block, merge with it
    if (precedingBlock && precedingBlock.type === BlockType.Text) {
      const mergedText = precedingBlock.text + blockToTransform.text;
      newBlocks[idx - 1] = { ...precedingBlock, text: mergedText };
      newBlocks.splice(idx, 1);
    } else {
      // Otherwise, convert to text block
      newBlocks[idx] = { ...blockToTransform, type: BlockType.Text };
    }
  }
  return {
    newBlocks,
  };
};

const splitTextFromStyledBlock = (
  blocks: Block[],
  styled: StyledBlock,
  index: number,
  lookup: string,
) => {
  const isAfter = styled.text.indexOf(lookup) === 0;
  const newText = styled.text.replace(lookup, '');
  const newBlocks: Block[] = [
    ...blocks.slice(0, index),
    ...(!isAfter
      ? [
          {
            type: BlockType.Text,
            text: newText,
          } as Block,
        ]
      : []),
    {
      ...styled,
      text: lookup,
    } as Block,
    ...(isAfter
      ? [
          {
            type: BlockType.Text,
            text: newText,
          } as Block,
        ]
      : []),
    ...blocks.slice(index + 1),
  ];
  return {
    newBlocks,
  };
};

/**
 * Generate a unique ID for blocks
 */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if a file is an image
 */
const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

/**
 * Get caret range from point with cross-browser support
 */
const getCaretRangeFromPoint = (
  clientX: number,
  clientY: number,
): Range | null => {
  if (document.caretRangeFromPoint) {
    return document.caretRangeFromPoint(clientX, clientY);
  } else if ((document as any).caretPositionFromPoint) {
    const position = (document as any).caretPositionFromPoint(clientX, clientY);
    if (position) {
      const range = document.createRange();
      range.setStart(position.offsetNode, position.offset);
      return range;
    }
  }
  return null;
};

/**
 * Check if a DataTransfer contains valid file content
 */
const hasValidContent = (dataTransfer: DataTransfer): boolean => {
  // During dragover, files array may be empty for security reasons
  // Check types or items instead
  if (dataTransfer.types && dataTransfer.types.includes('Files')) {
    return true;
  }
  // Fallback to checking files (available in drop event)
  return dataTransfer.files && dataTransfer.files.length > 0;
};

/**
 * Check if a block is draggable (Image, Document, or uneditable Styled blocks)
 */
const isDraggableBlock = (block: Block, blockId: string): boolean => {
  if (!('id' in block) || block.id !== blockId) return false;
  // Allow dragging of Image and Document blocks
  if (block.type === BlockType.Image || block.type === BlockType.Document)
    return true;
  // For Styled blocks, only allow dragging if they are uneditable
  if (block.type === BlockType.Styled) return block.uneditable === true;
  return false;
};

export {
  convertBlocksToCommitItems,
  getCursorPosition,
  getPositionAndRect,
  setCursorPosition,
  preContainsTextNode,
  createElement,
  preContainsNode,
  getSelectionRange,
  replaceLineFeeds,
  insertCarridgeReturn,
  isCarridgeReturn,
  removeMatchedText,
  getBlockIndexAtPosition,
  replaceTextAtPosition,
  insertStyledBlockAtPosition,
  transformToTextBlocks,
  splitTextFromStyledBlock,
  generateId,
  isImageFile,
  getCaretRangeFromPoint,
  hasValidContent,
  isDraggableBlock,
};
