import { CursorPositionState, Rect, ZERO_RECT } from '@atypes/state';
import { createSubscriberStore } from './utils';

export const createCursorPositionStore = () =>
  createSubscriberStore<CursorPositionState>((set) => ({
    characterPosition: 0,
    cursorRect: ZERO_RECT,
    updateCharacterPosition: (characterPosition: number) =>
      set({ characterPosition }),
    updatePosition: (characterPosition: number, cursorRect: Rect) =>
      set({ characterPosition, cursorRect }),
  }));
