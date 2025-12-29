import { DragHandlerState } from '@src/types/state/dragHandler';
import { createSubscriberStore } from './utils';
import { DragEventType } from '@src/types';

export const createDragHandlerStore = () =>
  createSubscriberStore<DragHandlerState>((set) => ({
    dragOverHandlers: [],
    dragLeaveHandlers: [],
    dropHandlers: [],
    addDragHandler: (
      eventType: DragEventType,
      handler: (event: React.DragEvent<HTMLPreElement>) => boolean,
    ) => {
      switch (eventType) {
        case DragEventType.DragOver:
          set((state) => ({
            dragOverHandlers: [...state.dragOverHandlers, handler],
          }));
          break;
        case DragEventType.DragLeave:
          set((state) => ({
            dragLeaveHandlers: [...state.dragLeaveHandlers, handler],
          }));
          break;
        case DragEventType.Drop:
          set((state) => ({ dropHandlers: [...state.dropHandlers, handler] }));
          break;
      }
    },
    removeDragHandler: (
      eventType: DragEventType,
      handler: (event: React.DragEvent<HTMLPreElement>) => boolean,
    ) => {
      switch (eventType) {
        case DragEventType.DragOver:
          set((state) => ({
            dragOverHandlers: state.dragOverHandlers.filter(
              (h) => h !== handler,
            ),
          }));
          break;
        case DragEventType.DragLeave:
          set((state) => ({
            dragLeaveHandlers: state.dragLeaveHandlers.filter(
              (h) => h !== handler,
            ),
          }));
          break;
        case DragEventType.Drop:
          set((state) => ({
            dropHandlers: state.dropHandlers.filter((h) => h !== handler),
          }));
          break;
      }
    },
  }));
