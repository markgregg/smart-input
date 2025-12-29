import { CSSProperties } from 'react';

/**
 * The type of block in the editor.
 */
export enum BlockType {
  /** Plain text block */
  Text = 'text',
  /** Styled block with custom styling and behavior */
  Styled = 'styled',
  /** Document/file attachment block */
  Document = 'document',
  /** Image block */
  Image = 'image',
}

/**
 * Represents a plain text block in the editor.
 */
export interface TextBlock {
  /** The block type identifier */
  type: BlockType.Text;
  /** The text content of the block */
  text: string;
}

/**
 * Represents a styled block in the editor with custom styling and behavior.
 * Styled blocks can have custom CSS styles, classes, and can be made uneditable or undeletable.
 */
export interface StyledBlock {
  /** The block type identifier */
  type: BlockType.Styled;
  /** Unique identifier for the block */
  id: string;
  /** The text content of the block */
  text: string;
  /** Custom CSS styles to apply to the block */
  style?: CSSProperties | undefined;
  /** CSS class name to apply to the block */
  className?: string;
  /** If true, the block's content cannot be edited */
  uneditable?: boolean | undefined;
  /** If true, the block cannot be deleted by the user */
  undeletable?: boolean | undefined;
}

/**
 * Represents a document/file attachment block in the editor.
 */
export interface DocumentBlock {
  /** The block type identifier */
  type: BlockType.Document;
  /** Unique identifier for the block */
  id: string;
  /** The name of the document file */
  name: string;
  /** The File object representing the document */
  file: File;
  /** The URL for accessing the document (e.g., blob URL) */
  url: string;
  /** The MIME content type of the document */
  contentType: string;
  /** If true, the block cannot be deleted by the user */
  undeletable?: boolean | undefined;
}

/**
 * Represents an image block in the editor.
 */
export interface ImageBlock {
  /** The block type identifier */
  type: BlockType.Image;
  /** Unique identifier for the block */
  id: string;
  /** The name of the image file */
  name: string;
  /** The File object representing the image */
  file: File;
  /** The URL for displaying the image (e.g., blob URL) */
  url: string;
  /** Alternative text for accessibility */
  alt?: string | undefined;
  /** The MIME content type of the image */
  contentType: string;
  /** If true, the block cannot be deleted by the user */
  undeletable?: boolean | undefined;
}

/**
 * A block can be any of the supported block types in the editor.
 */
export type Block = TextBlock | StyledBlock | DocumentBlock | ImageBlock;
