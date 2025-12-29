import React, { FC, PropsWithChildren } from 'react';
import { createBlocksStore } from './blocksStore';
import { StateContext } from './state';
import { ComponentProps } from '@atypes/componentProps';
import { useChangeNotify } from '@hooks/useChangeNotify';
import { createBufferStore } from './bufferStore';
import { createCursorPositionStore } from './cursorPosition';
import { useCursorChangeNotify } from '@hooks/useCursorChangeNotify';
import { createApiStore } from './apiStore';
import { createBehaviourStore } from './behaviourStore';
import { createKeyHandlerStore } from './keyHandlerStore';
import { createDragHandlerStore } from './dragHandlerStore';
import { createBlockRerenderHandlerStore } from '@src/state/blockRerenderHandlerStore';

interface StateProviderProps {
  value: ComponentProps;
}

export const StateProvider: FC<PropsWithChildren<StateProviderProps>> =
  React.memo(({ value, children }) => {
    const { blocks, onBlocksChange, onCursorPositionChange } = value;

    const keyHandlerStore = React.useMemo(createKeyHandlerStore, []);
    const bufferStore = React.useMemo(createBufferStore, []);
    const blocksStore = React.useMemo(createBlocksStore, []);
    const cursorPositionStore = React.useMemo(createCursorPositionStore, []);
    const apiStore = React.useMemo(createApiStore, []);
    const behaviourStore = React.useMemo(createBehaviourStore, []);
    const dragHandlerStore = React.useMemo(createDragHandlerStore, []);
    const blockRerenderHandlerStore = React.useMemo(
      createBlockRerenderHandlerStore,
      [],
    );

    useChangeNotify(blocksStore, cursorPositionStore, onBlocksChange);
    useCursorChangeNotify(
      cursorPositionStore,
      blocksStore,
      onCursorPositionChange,
    );

    if (
      blocks &&
      JSON.stringify(blocksStore.getState().blocks) !== JSON.stringify(blocks)
    ) {
      blocksStore.getState().setBlocks(blocks);
      bufferStore.getState().appendToBuffer(blocks);
    }

    const stateValue = React.useMemo(
      () => ({
        blocksStore,
        bufferStore,
        cursorPositionStore,
        apiStore,
        behaviourStore,
        keyHandlerStore,
        dragHandlerStore,
        blockRerenderHandlerStore,
      }),
      [
        blocksStore,
        bufferStore,
        cursorPositionStore,
        apiStore,
        behaviourStore,
        keyHandlerStore,
        dragHandlerStore,
        blockRerenderHandlerStore,
      ],
    );

    return (
      <StateContext.Provider value={stateValue}>
        {children}
      </StateContext.Provider>
    );
  });

StateProvider.displayName = 'StateProvider';
