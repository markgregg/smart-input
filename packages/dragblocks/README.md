# @smart-input/dragblocks

A React component that enables drag-and-drop reordering of styled blocks within the smart-input editor.

## Features

- 🎯 Drag and drop styled blocks (StyledBlock, DocumentBlock, ImageBlock) to reorder them
- 📍 Visual drop indicator showing where blocks will be placed
- 🎨 Smooth animations and visual feedback during drag operations
- 🔒 Plain text blocks remain fixed and cannot be dragged
- ⚡ Integrates seamlessly with @smart-input/core state management

## Installation

```bash
npm install @smart-input/dragblocks
# or
pnpm add @smart-input/dragblocks
# or
yarn add @smart-input/dragblocks
```

## Usage

```tsx
import { Editor, StateContext } from '@smart-input/core';
import { DragBlocksHandler } from '@smart-input/dragblocks';
import '@smart-input/dragblocks/style.css';

function MyComponent() {
  const [blocks, setBlocks] = useState<Block[]>([
    { id: '1', type: BlockType.Text, text: 'Hello ' },
    {
      id: '2',
      type: BlockType.Styled,
      text: 'draggable',
      style: { fontWeight: 'bold' },
    },
    { id: '3', type: BlockType.Text, text: ' world!' },
  ]);

  return (
    <StateContext blocks={blocks} setBlocks={setBlocks}>
      <DragBlocksHandler>
        <Editor placeholder="Start typing..." />
      </DragBlocksHandler>
    </StateContext>
  );
}
```

## How It Works

1. **Wrap your Editor**: Place the `DragBlocksHandler` component around your `Editor` component
2. **Drag styled blocks**: Click and drag any styled block (colored, formatted, or media blocks)
3. **See drop indicator**: A blue horizontal line shows where the block will be dropped
4. **Drop to reorder**: Release the mouse to drop the block in its new position

## Visual Indicators

- **Dragging**: The dragged block becomes semi-transparent (50% opacity)
- **Drop Zone**: A blue animated line indicates the drop position
- **Cursor**: Styled blocks show a "grab" cursor when hoverable

## Block Types

The handler works with these block types from @smart-input/core:

- ✅ `StyledBlock` - Text with custom styling
- ✅ `DocumentBlock` - File attachments
- ✅ `ImageBlock` - Embedded images
- ❌ `TextBlock` - Plain text (not draggable)

## Props

### DragBlocksHandler

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| children | ReactNode | Yes | The Editor component to wrap |

## State Management

The component integrates with @smart-input/core's zustand-based state management using the `useBlocks` hook. Block order changes are automatically synchronized with your application state.

## Styling

Import the default styles:

```tsx
import '@smart-input/dragblocks/style.css';
```

The package includes:
- Animated drop indicator
- Smooth transitions
- Responsive hover states

## Requirements

- `@smart-input/core`: ^1.0.0
- `react`: ^18.3.1
- `react-dom`: ^18.3.1

## License

MIT © Mark Gregg
