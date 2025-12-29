import React, { PropsWithChildren, useState } from 'react';
import { useBlocks, BlockType, useApi } from '@smart-input/core';
import {
  ReactBlocksManager,
  type ReactBlockComponent,
} from '@smart-input/reactblocks';

/**
 * Component that demonstrates React components rendered in styled blocks.
 * It finds styled blocks and attaches custom React components to them via Portal.
 */
export const ReactBlocksDemo: React.FC = () => {
  const { blocks, setBlocks } = useBlocks((s) => s);
  const [reactBlocks, setReactBlocks] = useState<ReactBlockComponent[]>([]);
  const [blockCounter, setBlockCounter] = useState(0);
  const api = useApi((s) => s.api);

  const handleAddBlock = () => {
    const blockId = `react-block-${blockCounter}`;
    setBlockCounter((c) => c + 1);

    // Add a styled block using setBlocks
    setBlocks([
      ...blocks,
      {
        id: blockId,
        type: BlockType.Styled,
        text: 'react block -', // Zero-width space to maintain the element
        style: {
          display: 'inline-block',
          verticalAlign: 'middle',
          padding: '2px 4px',
          borderRadius: '3px',
          backgroundColor: 'rgba(0, 150, 255, 0.1)',
          border: '1px solid rgba(0, 150, 255, 0.3)',
        },
        uneditable: true,
      },
    ]);

    // Add the react widget to the reactBlocks array
    setReactBlocks((prev) => [
      ...prev,
      {
        blockId,
        component: <BlockWidget blockId={blockId} />,
      },
    ]);
    setTimeout(() => {
      api?.setCursorPosition(api.getTextLength());
    }, 0);
  };

  return (
    <BlocksProvider>
      <div style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
        <button
          onClick={handleAddBlock}
          style={{
            position: 'relative',
            padding: '8px 16px',
            background: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
          data-testid="add-react-block-button"
        >
          Add React Block
        </button>
      </div>
      <ReactBlocksManager reactBlocks={reactBlocks} />
    </BlocksProvider>
  );
};

interface BlockContextValue {
  getValue: (blockId: string) => number;
  increment: (blockId: string) => void;
}

// @ts-expect-error null initial value
const BlockContext = React.createContext<BlockContextValue>(null);

const BlocksProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [values, setValues] = useState<Map<string, number>>(new Map());

  const increment = (blockId: string) => {
    setValues((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(blockId) || 0;
      newMap.set(blockId, current + 1);
      return newMap;
    });
  };

  const getValue = (blockId: string) => {
    return values.get(blockId) || 0;
  };

  return (
    <BlockContext.Provider value={{ getValue, increment }}>
      {children}
    </BlockContext.Provider>
  );
};

/**
 * The actual widget component that gets rendered in the Portal
 */
const BlockWidget: React.FC<{ blockId: string }> = ({ blockId }) => {
  const { getValue, increment } = React.useContext(BlockContext);

  return (
    <span data-testid={`react-block-${blockId}`}>
      <span style={{ fontWeight: 'bold' }}>✨</span>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          increment(blockId);
        }}
        style={{
          background: 'blue',
          color: 'white',
          border: 'none',
          borderRadius: '3px',
          padding: '2px 6px',
          cursor: 'pointer',
          fontSize: '11px',
        }}
        data-testid={`react-block-button-${blockId}`}
      >
        Clicked: {getValue(blockId)}
      </button>
    </span>
  );
};
