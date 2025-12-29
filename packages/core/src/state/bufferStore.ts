import { Block } from '@atypes/block';
import { BufferState } from '@atypes/state';
import { createSubscriberStore } from './utils';

const MAX_BUFFER_LENGTH = 50;
export const createBufferStore = () =>
  createSubscriberStore<BufferState>((set, get) => ({
    buffer: [],
    appendToBuffer: (blocks: Block[]) => {
      if (
        JSON.stringify(blocks) !==
        JSON.stringify(get().buffer[get().buffer.length - 1])
      ) {
        set((state) => ({
          buffer: [...state.buffer.slice(0, MAX_BUFFER_LENGTH - 1), blocks],
        }));
      }
    },
    undoBuffer: () => {
      const { buffer } = get();
      const last = buffer.pop();
      set({ buffer: [...buffer] });
      return last ?? null;
    },
  }));
