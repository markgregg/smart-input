export interface Rect {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

export const ZERO_RECT: Rect = {
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
};

export interface CursorPositionState {
  characterPosition: number;
  cursorRect: Rect;
  updateCharacterPosition: (characterPosition: number) => void;
  updatePosition: (characterPosition: number, cursorRect: Rect) => void;
}
