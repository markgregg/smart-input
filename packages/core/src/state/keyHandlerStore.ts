import { KeyCombination } from '@src/types';
import { createSubscriberStore } from './utils';
import { KeyHandlerState } from '@src/types/state/keyHandler';

export const createKeyHandlerStore = () =>
  createSubscriberStore<KeyHandlerState>((set) => ({
    keyHandlers: [],
    addKeyboardHandler: (handler: (keys: KeyCombination) => boolean) => set((state) => ({ keyHandlers: [...state.keyHandlers, handler] })),
    removeKeyboardHandler: (handler: (keys: KeyCombination) => boolean) => set((state) => ({ keyHandlers: state.keyHandlers.filter(h => h !== handler) })),
  }));
