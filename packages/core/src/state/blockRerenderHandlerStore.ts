import { StyledBlockElement } from '@src/types';
import { createSubscriberStore } from './utils';
import { BlockRerenderHandlerState } from '@src/types/state/blockRerenderHandler';

export const createBlockRerenderHandlerStore = () =>
  createSubscriberStore<BlockRerenderHandlerState>((set) => ({
    blockRerenderHandlers: [],
    addBlockRerenderHandlers: (
      handler: (blocks: StyledBlockElement[]) => void,
    ) =>
      set((state) => ({
        blockRerenderHandlers: [...state.blockRerenderHandlers, handler],
      })),
    removeBlockRerenderHandlers: (
      handler: (blocks: StyledBlockElement[]) => void,
    ) =>
      set((state) => ({
        blockRerenderHandlers: state.blockRerenderHandlers.filter(
          (h) => h !== handler,
        ),
      })),
  }));
