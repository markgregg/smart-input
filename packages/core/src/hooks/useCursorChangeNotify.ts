import { CursorPositionChangeHanlder } from '@atypes/componentProps';
import { BlocksState, CursorPositionState } from '@atypes/state';
import { useTopLevelCursorPositionSubscriber } from '@state/useState';

import { useCallback } from 'react';
import { StoreApi, UseBoundStore } from 'zustand';

export const useCursorChangeNotify = (
  store: UseBoundStore<StoreApi<CursorPositionState>>,
  blockStore: UseBoundStore<StoreApi<BlocksState>>,
  onCursorPositionChange?: CursorPositionChangeHanlder,
) => {
  const changeCallback = useCallback(
    (current: CursorPositionState, previous: CursorPositionState) => {
      if (
        current.characterPosition !== previous.characterPosition ||
        current.cursorRect.top !== previous.cursorRect.top ||
        current.cursorRect.left !== previous.cursorRect.left ||
        current.cursorRect.bottom !== previous.cursorRect.bottom ||
        current.cursorRect.right !== previous.cursorRect.right
      ) {
        const blocks = blockStore.getState().blocks;
        onCursorPositionChange?.(
          current.characterPosition,
          current.cursorRect,
          blocks,
        );
      }
    },
    [onCursorPositionChange, blockStore],
  );

  useTopLevelCursorPositionSubscriber(store, (state) => state, changeCallback);
};
