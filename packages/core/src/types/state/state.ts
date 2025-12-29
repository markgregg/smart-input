import { StoreApi, UseBoundStore } from 'zustand';
import { BlocksState } from './blocks';
import { BufferState } from './buffer';
import { CursorPositionState } from './cursorPosition';
import { ApiState } from './api';
import { BehaviourState } from './behaviour';
import { KeyHandlerState } from './keyHandler';
import { DragHandlerState } from './dragHandler';
import { BlockRerenderHandlerState } from './blockRerenderHandler';

export interface State {
  blocksStore: UseBoundStore<StoreApi<BlocksState>>;
  bufferStore: UseBoundStore<StoreApi<BufferState>>;
  cursorPositionStore: UseBoundStore<StoreApi<CursorPositionState>>;
  apiStore: UseBoundStore<StoreApi<ApiState>>;
  behaviourStore: UseBoundStore<StoreApi<BehaviourState>>;
  keyHandlerStore: UseBoundStore<StoreApi<KeyHandlerState>>;
  dragHandlerStore: UseBoundStore<StoreApi<DragHandlerState>>;
  blockRerenderHandlerStore: UseBoundStore<StoreApi<BlockRerenderHandlerState>>;
}
