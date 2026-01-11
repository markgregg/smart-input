import { Block, StyledBlock } from './block';

/**
 * Associates a styled block with its corresponding HTML element.
 */
export type StyledBlockElement = {
  /** The styled block */
  block: StyledBlock;
  /** The HTML element rendering the block, or null if not yet rendered */
  element: HTMLElement | null;
};

/**
 * Represents a document file in the editor.
 */
export interface Document {
  /** The type identifier for document items */
  type: 'document';
  /** The name of the document file */
  name: string;
  /** The File object */
  file: File;
  /** The URL for accessing the document (e.g., blob URL) */
  url: string;
  /** The content type of the image */
  contentType: string;
}

/**
 * Represents an image file in the editor.
 */
export interface Image {
  /** The type identifier for image items */
  type: 'image';
  /** The name of the image file */
  name: string;
  /** The File object */
  file: File;
  /** The URL for displaying the image (e.g., blob URL) */
  url: string;
  /** Alternative text for the image */
  alt?: string;
  /** The content type of the image */
  contentType: string;
}

/**
 * A commit item can be a text string, document, or image.
 */
export type CommitItem = string | Document | Image;

/**
 * Represents a keyboard key combination for triggering commits.
 */
export interface CommitKeyCombination {
  /** The key value (e.g., 'Enter') */
  key: string;
  /** Whether the Alt key must be pressed */
  altKey?: boolean;
  /** Whether the Ctrl key must be pressed */
  ctrlKey?: boolean;
  /** Whether the Shift key must be pressed */
  shiftKey?: boolean;
  /** Whether the Meta/Command key must be pressed */
  metaKey?: boolean;
}

/**
 * Represents a keyboard key combination for custom key handlers.
 */
export interface KeyCombination {
  /** The key value (e.g., 'a', 'Enter') */
  key: string;
  /** The physical key code */
  code: string;
  /** Whether the Alt key is pressed */
  altKey?: boolean;
  /** Whether the Ctrl key is pressed */
  ctrlKey?: boolean;
  /** Whether the Shift key is pressed */
  shiftKey?: boolean;
  /** Whether the Meta/Command key is pressed */
  metaKey?: boolean;
}

/**
 * Types of drag events that can occur in the editor.
 */
export enum DragEventType {
  /** Fired when an element is being dragged over a valid drop target */
  DragOver = 'dragover',
  /** Fired when a dragged element leaves a valid drop target */
  DragLeave = 'dragleave',
  /** Fired when an element is dropped on a valid drop target */
  Drop = 'drop',
}

/**
 * Props for the Editor component.
 */
export interface EditorProps {
  /** Whether to allow line breaks in the editor (default: false) */
  enableLineBreaks?: boolean;
  /** CSS class name to apply to the editor container */
  className?: string;
  /** Custom CSS class name to apply to the editor area */
  editorClassName?: string;
  /** Width of embedded images (CSS value, e.g., '200px', '50%') */
  imageWidth?: string;
  /** Height of embedded images (CSS value) */
  imageHeight?: string;
  /** Width of embedded documents (CSS value) */
  documentWidth?: string;
  /** Height of embedded documents (CSS value) */
  documentHeight?: string;
  /** Placeholder text shown when the editor is empty */
  placeholder?: string;
  /** Whether the editor is disabled */
  disabled?: boolean | undefined;
  /** Called when the content of the editor changes */
  onChange?: (text: string, blocks: Block[]) => void;
  /** Called when a block is clicked */
  onBlockClick?: (block: Block, event: MouseEvent) => void;
  /** Called when a block is double-clicked */
  onBlockDblClick?: (block: Block, event: MouseEvent) => void;
  /** Called when the mouse button is released over a block */
  onBlockMouseUp?: (block: Block, event: MouseEvent) => void;
  /** Called when the mouse button is pressed over a block */
  onBlockMouseDown?: (block: Block, event: MouseEvent) => void;
  /** Called when the mouse moves over a block */
  onBlockMouseMove?: (block: Block, event: MouseEvent) => void;
  /** Called when the mouse enters a block */
  onBlockMouseEnter?: (block: Block, event: MouseEvent) => void;
  /** Called when the mouse leaves a block */
  onBlockMouseLeave?: (block: Block, event: MouseEvent) => void;
  /** Called when the mouse moves over a block (similar to onBlockMouseEnter but fires more frequently) */
  onBlockMouseOver?: (block: Block, event: MouseEvent) => void;
}
