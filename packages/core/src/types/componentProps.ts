import { Block } from './block';
import { Rect } from './state';

/**
 * Callback function invoked when the blocks in the editor change.
 * @param blocks - The updated array of blocks
 * @param characterPosition - The current character position of the cursor
 * @param cursorRect - The bounding rectangle of the cursor
 */
export type BlocksChangeHandler = (
  blocks: Block[],
  characterPosition: number,
  cursorRect: Rect,
) => void;

/**
 * Callback function invoked when the cursor position changes.
 * @param characterPosition - The new character position of the cursor
 * @param cursorRect - The bounding rectangle of the cursor
 * @param blocks - The current array of blocks
 */
export type CursorPositionChangeHanlder = (
  characterPosition: number,
  cursorRect: Rect,
  blocks: Block[],
) => void;

/**
 * Props for the SmartInput component.
 */
export interface ComponentProps {
  /** element id */
  id?: string;
  /** Initial blocks to populate the editor with */
  blocks?: Block[];
  /** Callback invoked when the blocks in the editor change */
  onBlocksChange?: BlocksChangeHandler;
  /** Callback invoked when the cursor position changes */
  onCursorPositionChange?: CursorPositionChangeHanlder;
  /** Custom CSS class name to apply to the editor container */
  className?: string;
}
