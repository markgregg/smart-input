import { Block } from '@atypes/block';
import { BlocksState } from '@atypes/state';
import { createSubscriberStore } from './utils';

export const createBlocksStore = () =>
  createSubscriberStore<BlocksState>((set) => ({
    blocks: [],
    setBlocks: (newBlocks: Block[]) => set({ blocks: newBlocks }),
  }));
