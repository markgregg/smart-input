# @smart-input/core

The core package for Open Input - a powerful, extensible React rich text input component library.

## Features

- 🎨 **Rich Content Support** - Text, styled blocks, images, and documents
- 🎭 **Styled Blocks** - Apply custom CSS to text selections
- ⌨️ **Keyboard Navigation** - Full keyboard support with customizable shortcuts
- ↩️ **Undo/Redo** - Built-in history management
- 🔄 **State Management** - Zustand-based state for seamless integration
- 📱 **Responsive** - Works on desktop and mobile
- ♿ **Accessible** - WCAG 2.1 AA compliant with ARIA support

## Installation

```bash
npm install @smart-input/core zustand
# or
pnpm add @smart-input/core zustand
# or
yarn add @smart-input/core zustand
```

> **Note**: `zustand` is a peer dependency required for state management.

## Quick Start

### Managed Editor (Recommended)

The `SmartInput` component manages state internally:

```tsx
import { SmartInput, Editor } from '@smart-input/core';
import '@smart-input/core/style.css';

function App() {
  return (
    <SmartInput>
      <Editor placeholder="Start typing..." />
    </SmartInput>
  );
}
```

### Unmanaged Editor (Advanced)

For full control over state:

```tsx
import { useState } from 'react';
import { StateContext, Editor, Block, BlockType } from '@smart-input/core';
import '@smart-input/core/style.css';

function App() {
  const [blocks, setBlocks] = useState<Block[]>([
    { id: '1', type: BlockType.Text, text: '' }
  ]);

  return (
    <StateContext blocks={blocks} setBlocks={setBlocks}>
      <Editor placeholder="Start typing..." />
    </StateContext>
  );
}
```

## Core Components

### SmartInput

A convenience wrapper that manages editor state internally.

```tsx
<SmartInput
  onCommit={(blocks) => console.log('Committed:', blocks)}
  showPlaceholder={true}
>
  <Editor placeholder="Type here..." />
</SmartInput>
```

**Props:**
- `children`: ReactNode (required) - Editor component to wrap
- `onCommit?: (blocks: Block[]) => void` - Callback when content is submitted
- `showPlaceholder?: boolean` - Show/hide placeholder (default: true)

### StateContext

Provides state management context for unmanaged editors.

```tsx
<StateContext 
  blocks={blocks} 
  setBlocks={setBlocks}
  options={{ maxHistorySteps: 50 }}
>
  <Editor />
</StateContext>
```

**Props:**
- `blocks`: Block[] (required) - Current block array
- `setBlocks`: (blocks: Block[]) => void (required) - State setter
- `options?: StateOptions` - Configuration options
- `children`: ReactNode (required)

### Editor

The main editable component.

```tsx
<Editor
  placeholder="Start typing..."
  readOnly={false}
  autoFocus={true}
  onFocus={() => console.log('Focused')}
  onBlur={() => console.log('Blurred')}
/>
```

**Props:**
- `placeholder?: string` - Placeholder text
- `readOnly?: boolean` - Disable editing
- `autoFocus?: boolean` - Auto-focus on mount
- `onFocus?: () => void` - Focus event handler
- `onBlur?: () => void` - Blur event handler
- `className?: string` - Custom CSS class
- `style?: CSSProperties` - Inline styles

## Block Types

The editor works with different types of blocks:

```typescript
enum BlockType {
  Text = 'text',          // Plain text
  Styled = 'styled',      // Text with custom styling (can be linked to React components)
  Document = 'document',  // File attachment
  Image = 'image'         // Embedded image
}

interface TextBlock {
  id: string;
  type: BlockType.Text;
  text: string;
}

interface StyledBlock {
  id: string;              // Unique identifier - used to link React components via @smart-input/reactblocks
  type: BlockType.Styled;
  text: string;
  style?: CSSProperties;   // Inline CSS styles
  className?: string;      // CSS class name
  uneditable?: boolean;    // Prevents editing the text
  undeletable?: boolean;   // Prevents deletion
}

interface DocumentBlock {
  id: string;
  type: BlockType.Document;
  name: string;            // Original filename
  file: File;              // File object
  url: string;             // Blob URL for download
  contentType: string;     // MIME type
  undeletable?: boolean;   // Prevents deletion
}

interface ImageBlock {
  id: string;
  type: BlockType.Image;
  name: string;            // Original filename
  file: File;              // File object
  url: string;             // Blob URL for preview
  alt?: string;            // Accessibility text
  contentType: string;     // MIME type
  undeletable?: boolean;   // Prevents deletion
}
```

**Note about StyledBlocks**: StyledBlocks can be linked to React components using the `@smart-input/reactblocks` package. The `id` property is used to associate a React component with a specific StyledBlock, allowing you to render interactive components inside the editor.

## Programmatic API

Access the editor API using the `SmartInputApi`:

```tsx
import { SmartInputApi } from '@smart-input/core';

function MyComponent() {
  const addStyledBlock = () => {
    SmartInputApi.addStyledBlock({
      id: 'block-1',
      text: 'Important',
      style: { fontWeight: 'bold', color: 'red' }
    });
  };

  const getBlocks = () => {
    const blocks = SmartInputApi.getBlocks();
    console.log(blocks);
  };

  return (
    <SmartInput>
      <Editor />
      <button onClick={addStyledBlock}>Add Block</button>
      <button onClick={getBlocks}>Get Blocks</button>
    </SmartInput>
  );
}
```

### Available API Methods

- `getBlocks()` - Get current blocks
- `setBlocks(blocks)` - Set blocks
- `addBlock(block, position?)` - Add a block
- `addStyledBlock(block, position?)` - Add a styled block
- `removeBlock(id)` - Remove a block
- `updateBlock(id, updates)` - Update a block
- `clear()` - Clear all blocks
- `undo()` - Undo last change
- `redo()` - Redo last undone change
- `focus()` - Focus the editor

See the [API Reference](../../docs/API.md) for complete documentation.

## Hooks

### useBlocks

Access and modify blocks from within the editor context:

```tsx
import { useBlocks } from '@smart-input/core';

function MyComponent() {
  const { blocks, setBlocks, addBlock, removeBlock } = useBlocks();
  
  return <div>{blocks.length} blocks</div>;
}
```

### useMutationObserver

Monitor DOM mutations in the editor:

```tsx
import { useMutationObserver } from '@smart-input/core';

function MyComponent() {
  const handleMutation = (mutations: MutationRecord[]) => {
    console.log('DOM changed:', mutations);
  };

  useMutationObserver(elementRef, handleMutation);
}
```

## Keyboard Shortcuts

The editor includes built-in keyboard shortcuts:

- `Ctrl/Cmd + Z` - Undo
- `Ctrl/Cmd + Shift + Z` - Redo
- `Ctrl/Cmd + Y` - Redo (alternative)
- `Backspace` - Delete block when empty
- `Enter` - Insert new line or commit (with extensions)
- `Arrow Keys` - Navigate between blocks

## Styling

Import the default stylesheet:

```tsx
import '@smart-input/core/style.css';
```

Or create custom styles by targeting these classes:

- `.editor` - Main editor container
- `.editor-block` - Individual block wrapper
- `.editor-block--text` - Text blocks
- `.editor-block--styled` - Styled blocks
- `.editor-block--document` - Document blocks
- `.editor-block--image` - Image blocks
- `.editor-placeholder` - Placeholder text

## TypeScript Support

Full TypeScript definitions are included. Import types:

```typescript
import type {
  Block,
  TextBlock,
  StyledBlock,
  DocumentBlock,
  ImageBlock,
  BlockType,
  StateOptions,
  EditorProps
} from '@smart-input/core';
```

## Extensions

The core package is designed to work with extensions:

- **[@smart-input/typeahead](../typeahead)** - Autocomplete suggestions
- **[@smart-input/reactblocks](../reactblocks)** - Render React components in blocks
- **[@smart-input/dragblocks](../dragblocks)** - Drag-and-drop block reordering
- **[@smart-input/dropcontent](../dropcontent)** - File drop handling
- **[@smart-input/commitnotifier](../commitnotifier)** - Commit/submit functionality

## Examples

Check out the [examples](../../examples) directory for complete working examples:

- **chat-input** - Simple chat interface with message history

## Documentation

For detailed documentation, see:

- **[User Guide](../../docs/USER_GUIDE.md)** - Comprehensive usage guide
- **[API Reference](../../docs/API.md)** - Complete API documentation
- **[Component Reference](../../docs/COMPONENTS.md)** - Component details
- **[Extension Development](../../docs/EXTENSION_DEVELOPMENT.md)** - Creating extensions

## Requirements

- React 18.0.0 or higher
- zustand 5.0.0 or higher

## License

MIT © Mark Gregg
