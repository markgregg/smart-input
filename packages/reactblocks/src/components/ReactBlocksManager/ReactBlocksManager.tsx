import React, { useCallback, useEffect, useState } from 'react';
import {
  useBlocks,
  BlockType,
  useBlockRerenderHandlers,
  StyledBlockElement,
  Block,
  StyledBlock,
} from '@smart-input/core';
import { ReactBlockComponent } from '../../types';
import { ReactBlockRenderer } from '../ReactBlockRenderer';

/**
 * Props for the ReactBlocksManager component.
 */
export type ReactBlocksManagerProps = {
  /** Array of React components to render inside styled blocks */
  reactBlocks?: ReactBlockComponent[];
};
/**
 * Component that automatically renders React components for all styled blocks
 * that have registered components. This should be placed within your editor
 * component tree and inside a ReactBlocksProvider.
 *
 * @example
 * ```tsx
 * <ReactBlocksProvider>
 *   <SmartInput>
 *     <Editor />
 *     <ReactBlocksManager />
 *   </SmartInput>
 * </ReactBlocksProvider>
 * ```
 */

/**
 * Extended ReactBlockComponent with a render key for forcing re-renders.
 * @internal
 */
export interface ReactBlockComponentKey extends ReactBlockComponent {
  /** Unique key to force re-renders when blocks are recreated */
  renderKey?: string;
}

export const ReactBlocksManager: React.FC<ReactBlocksManagerProps> = ({
  reactBlocks = [],
}) => {
  const [readyBlocks, setReadyBlocks] = useState<ReactBlockComponentKey[]>([]);
  const { blocks } = useBlocks((s: any) => s);
  const { addBlockRerenderHandlers, removeBlockRerenderHandlers } =
    useBlockRerenderHandlers((s: any) => s);

  useEffect(() => {
    const blockIds = (
      blocks.filter((b: Block) => b.type === BlockType.Styled) as StyledBlock[]
    ).map((b) => b.id);

    const newBlocks = reactBlocks.filter(({ blockId }) =>
      blockIds.includes(blockId),
    );
    if (reactBlocks.length !== newBlocks.length) {
      setReadyBlocks(newBlocks);
    }
  }, [blocks, reactBlocks, setReadyBlocks]);

  // Helper function to check if element has non-text children
  const hasNonTextChildren = useCallback((blockId: string): boolean => {
    const element = document.getElementById(blockId);
    if (!element) return false;
    return Array.from(element.childNodes).some(
      (child) => child.nodeType !== Node.TEXT_NODE,
    );
  }, []);

  const handleMutations = useCallback(
    (styledBlockElements: StyledBlockElement[]) => {
      console.log('react block mutat');
      // Get the block IDs that were affected
      const affectedBlockIds = new Set(
        styledBlockElements.map((sbe) => sbe.block.id),
      );

      // First check if all readyBlocks exist and have non-text children
      if (readyBlocks.length === reactBlocks.length) {
        const allExistWithContent = readyBlocks.every(({ blockId }) =>
          hasNonTextChildren(blockId),
        );

        // If all ready blocks exist and have content, do nothing
        if (readyBlocks.length > 0 && allExistWithContent) {
          return true;
        }

        // Check which blocks need to be recreated (only check affected blocks)
        const blocksNeedingRecreation = readyBlocks.filter(
          ({ blockId }) =>
            affectedBlockIds.has(blockId) &&
            document.getElementById(blockId) !== null &&
            !hasNonTextChildren(blockId),
        );

        // If some blocks need recreation, recreate them with new keys
        if (blocksNeedingRecreation.length > 0) {
          setReadyBlocks((prev) =>
            prev.map((block) => {
              if (
                blocksNeedingRecreation.find((b) => b.blockId === block.blockId)
              ) {
                // Add a timestamp to force re-render
                return { ...block, key: `${block.blockId}-${Date.now()}` };
              }
              return block;
            }),
          );
          return true;
        }
      }

      // Otherwise, update ready blocks based on what exists in the DOM
      const newReadyBlocks = reactBlocks
        .filter(({ blockId }) => document.getElementById(blockId) !== null)
        .map((block) => {
          // Find if this block was already in readyBlocks
          const existingBlock = readyBlocks.find(
            (rb) => rb.blockId === block.blockId,
          );

          if (existingBlock) {
            // If block was affected and has no non-text children, update key to force re-render
            if (
              affectedBlockIds.has(block.blockId) &&
              !hasNonTextChildren(block.blockId)
            ) {
              return { ...block, key: `${block.blockId}-${Date.now()}` };
            }

            // Otherwise preserve the existing key
            return 'key' in existingBlock
              ? { ...block, key: existingBlock.key }
              : block;
          }

          // New block - assign initial key
          return { ...block, key: `${block.blockId}-${Date.now()}` };
        });

      if (
        newReadyBlocks.length !== readyBlocks.length ||
        newReadyBlocks.some((nb, idx) => {
          const rb = readyBlocks[idx];
          return (
            !rb ||
            nb.blockId !== rb.blockId ||
            ('key' in nb && 'key' in rb && nb.key !== rb.key)
          );
        })
      ) {
        setReadyBlocks(newReadyBlocks);
      }

      return true;
    },
    [readyBlocks, reactBlocks, setReadyBlocks, hasNonTextChildren],
  );

  useEffect(() => {
    addBlockRerenderHandlers(handleMutations);
    return () => {
      removeBlockRerenderHandlers(handleMutations);
    };
  }, [handleMutations, addBlockRerenderHandlers, removeBlockRerenderHandlers]);

  return (
    <>
      {readyBlocks.map((block) => {
        const { blockId, component } = block;
        const renderKey = ('key' in block ? block.key : blockId) as string;
        return (
          <ReactBlockRenderer
            key={renderKey}
            blockId={blockId}
            component={component}
          />
        );
      })}
    </>
  );
};

ReactBlocksManager.displayName = 'ReactBlocksManager';
