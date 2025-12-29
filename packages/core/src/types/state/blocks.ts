import { Block } from '@atypes/block';

export interface BlocksState {
  blocks: Block[];
  setBlocks: (newBlocks: Block[]) => void;
}
