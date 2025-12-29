import { Block } from '@atypes/block';

export interface BufferState {
  buffer: Block[][];
  appendToBuffer: (blocks: Block[]) => void;
  undoBuffer: () => Block[] | null;
}
