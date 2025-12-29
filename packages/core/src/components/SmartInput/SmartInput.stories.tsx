import type { Story } from '@ladle/react';
import { SmartInput } from './SmartInput';
import { Editor } from '../Editor';
import { Block, BlockType } from '@src/types';
import { useState } from 'react';

export const BasicEditor: Story = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <SmartInput blocks={blocks} onBlocksChange={setBlocks}>
        <Editor placeholder="Type something..." />
      </SmartInput>
    </div>
  );
};

BasicEditor.meta = {
  description: 'Basic SmartInput with default settings',
};

export const WithLineBreaks: Story = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <SmartInput blocks={blocks} onBlocksChange={setBlocks}>
        <Editor
          placeholder="Type something (Shift+Enter for line breaks)..."
          enableLineBreaks
        />
      </SmartInput>
    </div>
  );
};

WithLineBreaks.meta = {
  description: 'SmartInput with line breaks enabled',
};

export const WithInitialContent: Story = () => {
  const [blocks, setBlocks] = useState<Block[]>([
    { type: BlockType.Text, text: 'Hello ' },
    {
      type: BlockType.Styled,
      id: '2',
      text: 'World',
      style: { fontWeight: 'bold' },
    },
    { type: BlockType.Text, text: '!' },
  ]);

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <SmartInput blocks={blocks} onBlocksChange={setBlocks}>
        <Editor placeholder="Edit the content..." />
      </SmartInput>
    </div>
  );
};

WithInitialContent.meta = {
  description: 'SmartInput with pre-populated content',
};

export const CustomStyling: Story = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <SmartInput
        blocks={blocks}
        onBlocksChange={setBlocks}
        className="custom-editor"
      >
        <Editor placeholder="Custom styled editor..." />
      </SmartInput>
      <div
        style={{
          marginTop: '20px',
          padding: '12px',
          border: '2px solid #4a90e2',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#666',
        }}
      >
        <p style={{ margin: 0 }}>
          Note: Custom styling can be applied to the SmartInput container
        </p>
      </div>
    </div>
  );
};

CustomStyling.meta = {
  description: 'SmartInput with custom styling',
};

export const MultipleEditors: Story = () => {
  const [blocks1, setBlocks1] = useState<Block[]>([]);
  const [blocks2, setBlocks2] = useState<Block[]>([]);

  return (
    <div
      style={{
        padding: '20px',
        maxWidth: '800px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <div>
        <h3>Editor 1</h3>
        <SmartInput blocks={blocks1} onBlocksChange={setBlocks1}>
          <Editor placeholder="First editor..." />
        </SmartInput>
      </div>
      <div>
        <h3>Editor 2</h3>
        <SmartInput blocks={blocks2} onBlocksChange={setBlocks2}>
          <Editor placeholder="Second editor..." />
        </SmartInput>
      </div>
    </div>
  );
};

MultipleEditors.meta = {
  description: 'Multiple independent SmartInput instances',
};
