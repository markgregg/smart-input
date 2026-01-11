import { CSSProperties } from 'react';
import { Block, StyledBlock } from './block';
import { CommitItem, Document, Image } from './editorProps';

/**
 * Associates a styled block with its index in the blocks array.
 */
export type BlockIndex = {
  /** The styled block */
  block: StyledBlock;
  /** The index of the block in the blocks array */
  idx: number;
};
/**
 * Functions available for manipulating the editor content.
 * These functions are passed to the apply callback in the SmartInputApi.
 */
export type SmartInputFunctions = {
  /** Clears all blocks from the editor */
  clear: () => void;
  /** Inserts text at a given character position */
  insert: (text: string, position: number) => void;
  /** Deletes text from start to end character position */
  delete: (start: number, end: number) => void;
  /** Replaces text from start to end position with new text */
  replace: (start: number, end: number, text: string) => void;
  /** Replaces first occurrence of oldText with new text */
  replaceText: (oldText: string, text: string) => void;
  /** Replaces all occurrences of oldText with new text */
  replaceAll: (oldText: string, text: string) => void;
  /** Gets the current array of blocks */
  getBlocks: () => Block[];
  /** Sets the blocks array (replacing existing content) */
  setBlocks: (blocks: Block[]) => void;
  /** Appends a styled block at the end of the content */
  appendStyledBlock: (block: StyledBlock) => void;
  /** Inserts a styled block at a given character position */
  insertStyledBlock: (block: StyledBlock, position: number) => void;
  /** Inserts a document block at a given character position */
  insertDocument: (block: Document, position: number) => void;
  /** Inserts an image block at a given character position */
  insertImage: (block: Image, position: number) => void;
  /** Removes text matching the given text and inserts a styled block in its place */
  styleText: (
    text: string,
    id: string,
    style?: CSSProperties | undefined,
  ) => void;
  /** Gets the logical cursor position (character index) from the editor */
  getCharacterPosition: () => number;
  /** Updates the logical cursor position (character index) in the editor */
  setCharacterPosition: (position: number) => void;
};

/**
 * API for interacting with the SmartInput editor.
 * Provides methods to manipulate content, get state, and control the editor.
 */
export type SmartInputApi = {
  /** Applies multiple operations in a single batch using the provided function */
  apply: (fn: (api: SmartInputFunctions) => void) => void;
  /** Gets the block at the specified character position */
  getBlockAtPosition: (position: number) => Block | null;
  /** Gets all commit items (strings, documents, images) from the editor */
  get: () => CommitItem[];
  /** Gets the HTML element associated with a block by its ID */
  getElementById: (id: string) => HTMLElement | null;
  /** Sets focus on the editor */
  focus: () => void;
  /** Gets the cursor position directly from the editable element */
  getCursorPosition: () => number;
  /** Updates the cursor position directly in the editable element */
  setCursorPosition: (position: number) => void;
  /** Gets the full text content of the editor as a string */
  getText: () => string;
  /** Gets the total character length of the editor content */
  getTextLength: () => number;
  /** Clears all content from the editor */
  clear: () => void;
};
