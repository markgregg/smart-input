import React, { useEffect } from 'react';
import { StoreApi, UseBoundStore, useStore } from 'zustand';
import { StateContext } from '@state/state';

import {
  BehaviourState,
  BlocksState,
  BufferState,
  CursorPositionState,
  State,
} from '@atypes/state';
import { ApiState } from '@src/types/state/api';
import { KeyHandlerState } from '@src/types/state/keyHandler';
import { DragHandlerState } from '@src/types/state/dragHandler';
import { BlockRerenderHandlerState } from '@src/types/state/blockRerenderHandler';

const useState = <T extends object, U = unknown>(
  storeSelector: (state: State) => UseBoundStore<StoreApi<T>>,
  selector: (state: T) => U,
) => {
  const store = storeSelector(React.useContext(StateContext));

  if (store === null) {
    throw new Error('useState must be used within StateProvider');
  }
  return useStore<UseBoundStore<StoreApi<T>>, U>(store, selector);
};

const useTopLevelSubscribe = <T extends object, U = unknown>(
  store: UseBoundStore<StoreApi<T>>,
  selector: (state: T) => U,
  callback: (current: U, previous: U) => void,
) => {
  useEffect(() => {
    // @ts-expect-error not a genuine error
    const unsubscribe = store.subscribe(selector, callback);
    return () => {
      unsubscribe();
    };
  }, [store, selector, callback]);
};

const useSubscribe = <T extends object, U = unknown>(
  storeSelector: (state: State) => UseBoundStore<StoreApi<T>>,
  selector: (state: T) => U,
  callback: (current: U, previous: U) => void,
) => {
  const store = storeSelector(React.useContext(StateContext));

  if (store === null) {
    throw new Error('useState must be used within StateProvider');
  }
  useEffect(() => {
    // @ts-expect-error not a genuine error
    const unsubscribe = store.subscribe(selector, callback);
    return () => {
      unsubscribe();
    };
  }, [store, selector, callback]);
};

const useBlocks = <U = unknown>(selector: (state: BlocksState) => U) =>
  useState((s) => s.blocksStore, selector);

const useBuffer = <U = unknown>(selector: (state: BufferState) => U) =>
  useState((s) => s.bufferStore, selector);

const useCursorPosition = <U = unknown>(
  selector: (state: CursorPositionState) => U,
) => useState((s) => s.cursorPositionStore, selector);

const useApi = <U = unknown>(selector: (state: ApiState) => U) =>
  useState((s) => s.apiStore, selector);

const useBehaviour = <U = unknown>(selector: (state: BehaviourState) => U) =>
  useState((s) => s.behaviourStore, selector);

const useKeyHandlers = <U = unknown>(selector: (state: KeyHandlerState) => U) =>
  useState((s) => s.keyHandlerStore, selector);

const useDragHandlers = <U = unknown>(
  selector: (state: DragHandlerState) => U,
) => useState((s) => s.dragHandlerStore, selector);

const useBlockRerenderHandlers = <U = unknown>(
  selector: (state: BlockRerenderHandlerState) => U,
) => useState((s) => s.blockRerenderHandlerStore, selector);

const useTopLevelBlocksSubscriber = <U = unknown>(
  store: UseBoundStore<StoreApi<BlocksState>>,
  selector: (state: BlocksState) => U,
  callback: (current: U, previous: U) => void,
) => useTopLevelSubscribe(store, selector, callback);

const useBlocksSubscriber = <U = unknown>(
  selector: (state: BlocksState) => U,
  callback: (current: U, previous: U) => void,
) => useSubscribe((s) => s.blocksStore, selector, callback);

const useTopLevelCursorPositionSubscriber = <U = unknown>(
  store: UseBoundStore<StoreApi<CursorPositionState>>,
  selector: (state: CursorPositionState) => U,
  callback: (current: U, previous: U) => void,
) => useTopLevelSubscribe(store, selector, callback);

const useCursorPositionSubscriber = <U = unknown>(
  selector: (state: CursorPositionState) => U,
  callback: (current: U, previous: U) => void,
) => useSubscribe((s) => s.cursorPositionStore, selector, callback);

export {
  useBlocks,
  useBuffer,
  useCursorPosition,
  useApi,
  useBehaviour,
  useKeyHandlers,
  useDragHandlers,
  useBlockRerenderHandlers,
  useBlocksSubscriber,
  useTopLevelBlocksSubscriber,
  useCursorPositionSubscriber,
  useTopLevelCursorPositionSubscriber,
};
