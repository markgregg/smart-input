import { Block, BlockType, Document, Image, StyledBlock } from '@src/types';
import { SmartInputFunctions } from '@src/types/api';

type ApiState = {
  blocks: Block[];
  characterPosition: number;
  buffer: Block[][];
  appendToBuffer: (b: Block[]) => void;
};

/**
 * Creates an internal state object for managing editor content.
 * This state holds the current blocks, cursor position, and undo/redo buffer.
 *
 * @param blocksI - Initial array of content blocks
 * @param characterPositionI - Initial character position of the cursor
 * @returns An ApiState object with getters/setters for blocks, position, and buffer
 *
 * @example
 * ```typescript
 * const state = createState([{ type: 'Text', text: 'Hello' }], 0);
 * ```
 */
export const createState = (
  blocksI: Block[],
  characterPositionI: number,
): ApiState => {
  let blocks = blocksI;
  let characterPosition = characterPositionI;
  const buffer: Block[][] = [];
  const state = {
    get blocks() {
      return blocks;
    },
    set blocks(value: Block[]) {
      blocks = value;
    },
    get characterPosition() {
      return characterPosition;
    },
    set characterPosition(value: number) {
      characterPosition = value;
    },
    appendToBuffer: (b: Block[]) => {
      buffer.push(b);
    },
    get buffer() {
      return buffer;
    },
  };
  return state;
};

/**
 * Finds the block and offset within that block for a given character position.
 * Iterates through blocks to calculate which block contains the position.
 *
 * @param blocks - Array of content blocks to search
 * @param position - Character position to find (0-based)
 * @returns Object with blockIndex and offset within that block
 *
 * @internal
 */
const findBlockAtPosition = (
  blocks: Block[],
  position: number,
): { blockIndex: number; offset: number } => {
  let currentPos = 0;
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (!block) continue;
    if (block.type === BlockType.Text || block.type === BlockType.Styled) {
      const blockLength = block.text.length;
      if (currentPos + blockLength >= position) {
        return { blockIndex: i, offset: position - currentPos };
      }
      currentPos += blockLength;
    }
  }
  return { blockIndex: blocks.length, offset: 0 };
};

/**
 * Extracts plain text from an array of blocks.
 * Filters Text and Styled blocks and concatenates their text content.
 *
 * @param blocks - Array of content blocks
 * @returns Concatenated plain text string from all text blocks
 *
 * @internal
 */
const extractText = (blocks: Block[]): string => {
  return blocks
    .filter(
      (b) => b && (b.type === BlockType.Text || b.type === BlockType.Styled),
    )
    .map((b) => {
      if (b.type === BlockType.Text || b.type === BlockType.Styled) {
        return b.text;
      }
      return '';
    })
    .join('');
};

/**
 * Creates the public API for manipulating editor content.
 * Provides methods for inserting, deleting, replacing text, and managing blocks.
 *
 * @param state - Internal ApiState object to operate on
 * @returns SmartInputFunctions object with all API methods
 *
 * @example
 * ```typescript
 * const state = createState([], 0);
 * const api = createApi(state);
 * api.insert('Hello', 0);
 * api.apply();
 * ```
 */
export const createApi = (state: ApiState): SmartInputFunctions => ({
  /**
   * Clears all content from the editor.
   * Removes all blocks and resets cursor position to 0.
   * This operation is buffered and can be undone.
   *
   * @example
   * ```typescript
   * api.clear();
   * api.apply();
   * ```
   */
  clear: () => {
    state.blocks = [];
    state.characterPosition = 0;
    state.appendToBuffer([...state.blocks]);
  },

  /**
   * Inserts text at the specified position.
   * If the position is within a text block, the text is inserted into that block.
   * Otherwise, a new text block is created.
   *
   * @param text - The text string to insert
   * @param position - Character position where text should be inserted (0-based)
   *
   * @example
   * ```typescript
   * api.insert('World', 5);
   * api.apply();
   * ```
   */
  insert: (text: string, position: number) => {
    const { blockIndex, offset } = findBlockAtPosition(state.blocks, position);
    const newBlocks = [...state.blocks];

    if (blockIndex >= newBlocks.length) {
      // Insert at the end
      newBlocks.push({ type: BlockType.Text, text });
    } else {
      const block = newBlocks[blockIndex];
      if (!block) {
        newBlocks.push({ type: BlockType.Text, text });
      } else if (
        block.type === BlockType.Text ||
        block.type === BlockType.Styled
      ) {
        const beforeText = block.text.substring(0, offset);
        const afterText = block.text.substring(offset);
        newBlocks[blockIndex] = {
          ...block,
          text: beforeText + text + afterText,
        };
      } else {
        // Insert as new text block before non-text block
        newBlocks.splice(blockIndex, 0, { type: BlockType.Text, text });
      }
    }

    state.blocks = newBlocks;
    state.appendToBuffer([...state.blocks]);
  },

  /**
   * Deletes text within the specified range.
   * Handles deletion across multiple blocks intelligently.
   *
   * @param start - Starting character position of deletion range (0-based, inclusive)
   * @param end - Ending character position of deletion range (0-based, exclusive)
   *
   * @example
   * ```typescript
   * api.delete(5, 10); // Deletes characters 5-9
   * api.apply();
   * ```
   */
  delete: (start: number, end: number) => {
    if (start >= end) return;

    const startInfo = findBlockAtPosition(state.blocks, start);
    const endInfo = findBlockAtPosition(state.blocks, end);
    const newBlocks: Block[] = [];

    for (let i = 0; i < state.blocks.length; i++) {
      const block = state.blocks[i];
      if (!block) continue;

      if (i < startInfo.blockIndex || i > endInfo.blockIndex) {
        // Block is completely outside the deletion range
        newBlocks.push(block);
      } else if (i === startInfo.blockIndex && i === endInfo.blockIndex) {
        // Deletion is within a single block
        if (block.type === BlockType.Text || block.type === BlockType.Styled) {
          const beforeText = block.text.substring(0, startInfo.offset);
          const afterText = block.text.substring(endInfo.offset);
          const newText = beforeText + afterText;
          if (newText.length > 0) {
            newBlocks.push({ ...block, text: newText });
          }
        }
      } else if (i === startInfo.blockIndex) {
        // First block in deletion range
        if (block.type === BlockType.Text || block.type === BlockType.Styled) {
          const beforeText = block.text.substring(0, startInfo.offset);
          if (beforeText.length > 0) {
            newBlocks.push({ ...block, text: beforeText });
          }
        }
      } else if (i === endInfo.blockIndex) {
        // Last block in deletion range
        if (block.type === BlockType.Text || block.type === BlockType.Styled) {
          const afterText = block.text.substring(endInfo.offset);
          if (afterText.length > 0) {
            newBlocks.push({ ...block, text: afterText });
          }
        }
      }
      // Blocks between start and end are completely deleted (not added to newBlocks)
    }

    state.blocks = newBlocks;
    state.appendToBuffer([...state.blocks]);
  },

  /**
   * Replaces text in the specified range with new text.
   * Equivalent to deleting the range and inserting new text.
   *
   * @param start - Starting character position of range to replace (0-based, inclusive)
   * @param end - Ending character position of range to replace (0-based, exclusive)
   * @param text - New text to insert in place of the deleted range
   *
   * @example
   * ```typescript
   * api.replace(0, 5, 'Hi'); // Replaces first 5 characters with 'Hi'
   * api.apply();
   * ```
   */
  replace: (start: number, end: number, text: string) => {
    // Delete the range first, then insert the new text
    if (start >= end) {
      createApi(state).insert(text, start);
      return;
    }

    createApi(state).delete(start, end);
    createApi(state).insert(text, start);
  },

  /**
   * Replaces the first occurrence of specified text.
   * Searches through all blocks to find and replace the text.
   *
   * @param oldText - The text string to find and replace
   * @param text - The new text to replace it with
   *
   * @example
   * ```typescript
   * api.replaceText('Hello', 'Hi');
   * api.apply();
   * ```
   */
  replaceText: (oldText: string, text: string) => {
    const fullText = extractText(state.blocks);
    const index = fullText.indexOf(oldText);

    if (index !== -1) {
      createApi(state).replace(index, index + oldText.length, text);
    }
  },

  /**
   * Replaces all occurrences of specified text.
   * Continues replacing until no more matches are found.
   *
   * @param oldText - The text string to find and replace
   * @param text - The new text to replace all occurrences with
   *
   * @example
   * ```typescript
   * api.replaceAll('foo', 'bar'); // Replaces all 'foo' with 'bar'
   * api.apply();
   * ```
   */
  replaceAll: (oldText: string, text: string) => {
    let fullText = extractText(state.blocks);
    let offset = 0;

    while (true) {
      const index = fullText.indexOf(oldText);
      if (index === -1) break;

      createApi(state).replace(
        offset + index,
        offset + index + oldText.length,
        text,
      );
      offset += index + text.length;
      fullText = fullText.substring(index + oldText.length);
    }
  },

  /**
   * Returns a copy of the current blocks array.
   * Useful for inspecting current editor state.
   *
   * @returns Array of Block objects representing current content
   *
   * @example
   * ```typescript
   * const blocks = api.getBlocks();
   * console.log(blocks);
   * ```
   */
  getBlocks: () => {
    return [...state.blocks];
  },

  setBlocks: (blocks: Block[]) => {
    state.blocks = blocks;
  },

  appendStyledBlock: (block: StyledBlock) => {
    const newBlocks = [...state.blocks];
    newBlocks.push(block);
    state.blocks = newBlocks;
    state.appendToBuffer([...state.blocks]);
  },

  /**
   * Inserts a styled block at the specified position.
   * Styled blocks contain segments with individual styling.
   *
   * @param block - StyledBlock object with segments and styles
   * @param position - Character position where block should be inserted (0-based)
   *
   * @example
   * ```typescript
   * const styledBlock: StyledBlock = {
   *   type: 'Styled',
   *   text: 'Hello',
   *   segments: [{ id: '1', text: 'Hello', style: { color: 'red' } }]
   * };
   * api.insertStyledBlock(styledBlock, 0);
   * api.apply();
   * ```
   */
  insertStyledBlock: (block: StyledBlock, position: number) => {
    const { blockIndex, offset } = findBlockAtPosition(state.blocks, position);
    const newBlocks = [...state.blocks];

    if (blockIndex >= newBlocks.length) {
      // Insert at the end
      newBlocks.push(block);
    } else {
      const currentBlock = newBlocks[blockIndex];
      if (
        currentBlock &&
        (currentBlock.type === BlockType.Text ||
          currentBlock.type === BlockType.Styled)
      ) {
        const beforeText = currentBlock.text.substring(0, offset);
        const afterText = currentBlock.text.substring(offset);

        // Split the current block
        const splitBlocks: Block[] = [];
        if (beforeText.length > 0) {
          splitBlocks.push({ ...currentBlock, text: beforeText });
        }
        splitBlocks.push(block);
        if (afterText.length > 0) {
          splitBlocks.push({ ...currentBlock, text: afterText });
        }

        newBlocks.splice(blockIndex, 1, ...splitBlocks);
      } else {
        // Insert before non-text block
        newBlocks.splice(blockIndex, 0, block);
      }
    }

    state.blocks = newBlocks;
    state.appendToBuffer([...state.blocks]);
  },

  /**
   * Inserts a document block at the specified position.
   * Document blocks represent file attachments.
   *
   * @param document - Document object with name, file, and optional URL
   * @param position - Character position where document should be inserted (0-based)
   *
   * @example
   * ```typescript
   * const doc: Document = {
   *   name: 'report.pdf',
   *   file: pdfFile,
   *   url: 'https://example.com/report.pdf'
   * };
   * api.insertDocument(doc, 0);
   * api.apply();
   * ```
   */
  insertDocument: (document: Document, position: number) => {
    const docBlock: Block = {
      type: BlockType.Document,
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: document.name,
      file: document.file,
      url: document.url,
      contentType: document.contentType,
    };

    const { blockIndex, offset } = findBlockAtPosition(state.blocks, position);
    const newBlocks = [...state.blocks];

    if (blockIndex >= newBlocks.length) {
      newBlocks.push(docBlock);
    } else {
      const currentBlock = newBlocks[blockIndex];
      if (
        currentBlock &&
        (currentBlock.type === BlockType.Text ||
          currentBlock.type === BlockType.Styled)
      ) {
        const beforeText = currentBlock.text.substring(0, offset);
        const afterText = currentBlock.text.substring(offset);

        const splitBlocks: Block[] = [];
        if (beforeText.length > 0) {
          splitBlocks.push({ ...currentBlock, text: beforeText });
        }
        splitBlocks.push(docBlock);
        if (afterText.length > 0) {
          splitBlocks.push({ ...currentBlock, text: afterText });
        }

        newBlocks.splice(blockIndex, 1, ...splitBlocks);
      } else {
        newBlocks.splice(blockIndex, 0, docBlock);
      }
    }

    state.blocks = newBlocks;
    state.appendToBuffer([...state.blocks]);
  },

  /**
   * Inserts an image block at the specified position.
   * Image blocks represent embedded images.
   *
   * @param image - Image object with name, file, url, and optional alt text
   * @param position - Character position where image should be inserted (0-based)
   *
   * @example
   * ```typescript
   * const img: Image = {
   *   name: 'photo.jpg',
   *   file: imageFile,
   *   url: 'https://example.com/photo.jpg',
   *   alt: 'A photo'
   * };
   * api.insertImage(img, 0);
   * api.apply();
   * ```
   */
  insertImage: (image: Image, position: number) => {
    const imgBlock: Block = {
      type: BlockType.Image,
      id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: image.name,
      file: image.file,
      url: image.url,
      ...(image.alt !== undefined ? { alt: image.alt } : {}),
      contentType: image.contentType,
    };

    const { blockIndex, offset } = findBlockAtPosition(state.blocks, position);
    const newBlocks = [...state.blocks];

    if (blockIndex >= newBlocks.length) {
      newBlocks.push(imgBlock);
    } else {
      const currentBlock = newBlocks[blockIndex];
      if (
        currentBlock &&
        (currentBlock.type === BlockType.Text ||
          currentBlock.type === BlockType.Styled)
      ) {
        const beforeText = currentBlock.text.substring(0, offset);
        const afterText = currentBlock.text.substring(offset);

        const splitBlocks: Block[] = [];
        if (beforeText.length > 0) {
          splitBlocks.push({ ...currentBlock, text: beforeText });
        }
        splitBlocks.push(imgBlock);
        if (afterText.length > 0) {
          splitBlocks.push({ ...currentBlock, text: afterText });
        }

        newBlocks.splice(blockIndex, 1, ...splitBlocks);
      } else {
        newBlocks.splice(blockIndex, 0, imgBlock);
      }
    }

    state.blocks = newBlocks;
    state.appendToBuffer([...state.blocks]);
  },

  /**
   * Applies styling to the first occurrence of specified text.
   * Converts Text blocks to Styled blocks with the specified style.
   *
   * @param text - The text string to find and style
   * @param id - Unique identifier for the styled segment
   * @param style - Optional React CSSProperties object for styling
   *
   * @example
   * ```typescript
   * api.styleText('important', 'style-1', { fontWeight: 'bold', color: 'red' });
   * api.apply();
   * ```
   */
  styleText: (text: string, id: string, style?: React.CSSProperties) => {
    const fullText = extractText(state.blocks);
    const index = fullText.indexOf(text);

    if (index === -1) return;

    const startInfo = findBlockAtPosition(state.blocks, index);
    const endInfo = findBlockAtPosition(state.blocks, index + text.length);
    const newBlocks: Block[] = [];

    for (let i = 0; i < state.blocks.length; i++) {
      const block = state.blocks[i];
      if (!block) continue;

      if (i < startInfo.blockIndex || i > endInfo.blockIndex) {
        // Block is outside the style range
        newBlocks.push(block);
      } else if (i === startInfo.blockIndex && i === endInfo.blockIndex) {
        // Style is within a single block
        if (block.type === BlockType.Text || block.type === BlockType.Styled) {
          const beforeText = block.text.substring(0, startInfo.offset);
          const styledText = block.text.substring(
            startInfo.offset,
            endInfo.offset,
          );
          const afterText = block.text.substring(endInfo.offset);

          if (beforeText.length > 0) {
            newBlocks.push({ type: BlockType.Text, text: beforeText });
          }
          newBlocks.push({
            type: BlockType.Styled,
            id,
            text: styledText,
            ...(style ? { style } : {}),
          } as StyledBlock);
          if (afterText.length > 0) {
            newBlocks.push({ type: BlockType.Text, text: afterText });
          }
        }
      } else if (i === startInfo.blockIndex) {
        // First block in style range
        if (block.type === BlockType.Text || block.type === BlockType.Styled) {
          const beforeText = block.text.substring(0, startInfo.offset);
          const styledText = block.text.substring(startInfo.offset);

          if (beforeText.length > 0) {
            newBlocks.push({ type: BlockType.Text, text: beforeText });
          }
          if (styledText.length > 0) {
            newBlocks.push({
              type: BlockType.Styled,
              id: `${id}-${i}`,
              text: styledText,
              ...(style ? { style } : {}),
            } as StyledBlock);
          }
        }
      } else if (i === endInfo.blockIndex) {
        // Last block in style range
        if (block.type === BlockType.Text || block.type === BlockType.Styled) {
          const styledText = block.text.substring(0, endInfo.offset);
          const afterText = block.text.substring(endInfo.offset);

          if (styledText.length > 0) {
            newBlocks.push({
              type: BlockType.Styled,
              id: `${id}-${i}`,
              text: styledText,
              ...(style ? { style } : {}),
            } as StyledBlock);
          }
          if (afterText.length > 0) {
            newBlocks.push({ type: BlockType.Text, text: afterText });
          }
        }
      } else {
        // Middle block - convert entirely to styled
        if (block.type === BlockType.Text || block.type === BlockType.Styled) {
          newBlocks.push({
            type: BlockType.Styled,
            id: `${id}-${i}`,
            text: block.text,
            ...(style ? { style } : {}),
          } as StyledBlock);
        } else {
          newBlocks.push(block);
        }
      }
    }

    state.blocks = newBlocks;
    state.appendToBuffer([...state.blocks]);
  },

  getCharacterPosition: () => {
    return state.characterPosition;
  },
  setCharacterPosition: (position: number) => {
    state.characterPosition = position;
  },
});
