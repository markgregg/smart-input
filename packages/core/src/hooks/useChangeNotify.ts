import { Block } from '@atypes/block';
import { BlocksChangeHandler } from '@atypes/componentProps';
import { BlocksState, CursorPositionState } from '@atypes/state';
import { useTopLevelBlocksSubscriber } from '@state/useState';
import { useCallback } from 'react';
import { StoreApi, UseBoundStore } from 'zustand';

export const useChangeNotify = (
  store: UseBoundStore<StoreApi<BlocksState>>,
  cursorPositionStore: UseBoundStore<StoreApi<CursorPositionState>>,
  onBlocksChange?: BlocksChangeHandler,
) => {
  const changeCallback = useCallback(
    (current: Block[], previous: Block[]) => {
      if (
        onBlocksChange &&
        JSON.stringify(current) !== JSON.stringify(previous)
      ) {
        const { characterPosition, cursorRect } =
          cursorPositionStore.getState();
        onBlocksChange(current, characterPosition, cursorRect);
      }
    },
    [onBlocksChange, cursorPositionStore],
  );

  useTopLevelBlocksSubscriber(store, (state) => state.blocks, changeCallback);
};
