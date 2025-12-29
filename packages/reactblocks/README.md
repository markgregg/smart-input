# ReactBlocks Package

The ReactBlocks package allows you to attach React components to **styled blocks** in the Open Input editor. **React blocks are always linked to a StyledBlock** - each React component is associated with a specific StyledBlock via its unique `id` property. Components are rendered using React Portals into the DOM elements created by the styled blocks.

## Key Concept

**React blocks are not standalone blocks** - they are React components that are rendered *inside* existing `StyledBlock` elements. The workflow is:

1. Create a `StyledBlock` with a unique `id` in the editor
2. Register a React component for that `blockId` using `ReactBlocksManager`
3. The React component is rendered via Portal into the StyledBlock's DOM element
4. When the StyledBlock is removed, the React component should also be unregistered

## Installation

```bash
pnpm add @smart-input/reactblocks
```

## Basic Usage

### Using ReactBlocksManager with React Component Array

```tsx
import { useState } from 'react';
import { SmartInput, Editor, BlockType, SmartInputApi } from '@smart-input/core';
import { ReactBlocksManager, ReactBlockComponent } from '@smart-input/reactblocks';

function App() {
  const [reactBlocks, setReactBlocks] = useState<ReactBlockComponent[]>([]);

  const addMention = (userId: string) => {
    const blockId = `mention-${Date.now()}`;
    
    // Add styled block to editor (using SmartInputApi)
    // ... code to add styled block ...
    
    // Add React component to render in the block
    setReactBlocks(prev => [...prev, {
      blockId,
      component: <UserMention userId={userId} />
    }]);
  };

  return (
    <SmartInput>
      <Editor />
      <ReactBlocksManager reactBlocks={reactBlocks} />
    </SmartInput>
  );
}
```

## Advanced Usage

### Manual Portal Rendering

If you need more control, you can manually render portals:

```tsx
import { ReactBlockRenderer } from '@smart-input/reactblocks';

function MyComponent() {
  return (
    <>
      <ReactBlockRenderer 
        blockId="user-123"
        component={<UserCard userId={123} />}
      />
      <ReactBlockRenderer 
        blockId="tag-456"
        component={<Tag label="important" />}
      />
    </>
  );
}
```

### Managing Multiple Blocks

```tsx
import { useState } from 'react';
import { ReactBlocksManager, ReactBlockComponent } from '@smart-input/reactblocks';

function MyComponent() {
  const [reactBlocks, setReactBlocks] = useState<ReactBlockComponent[]>([
    { blockId: 'user-1', component: <UserCard id={1} /> },
    { blockId: 'user-2', component: <UserCard id={2} /> },
    { blockId: 'tag-1', component: <Tag label="urgent" /> },
  ]);
  
  return <ReactBlocksManager reactBlocks={reactBlocks} />;
}
```

## API Reference

### Components

#### `ReactBlocksManager`
Automatically renders React components into their corresponding styled blocks.

**Props:**

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `reactBlocks` | `ReactBlockComponent[]` | No | `[]` | Array of React block components to render. Each component is linked to a StyledBlock via `blockId` |
| `targetElementId` | `string` | No | `document.body` | ID of the DOM element to monitor for StyledBlock mutations |

#### `ReactBlockRenderer`
Manually renders a React component into a specific styled block using a Portal. Use this for more granular control over individual block rendering.

**Props:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `blockId` | `string` | Yes | The unique ID of the StyledBlock where the React component will be rendered |
| `component` | `ReactNode` | Yes | The React component to render inside the StyledBlock |

### Types

#### `ReactBlockComponent`
Configuration object that links a React component to a StyledBlock.

```tsx
interface ReactBlockComponent {
  /** The unique ID of the StyledBlock this React component is linked to */
  blockId: string;
  /** The React component to render inside the StyledBlock */
  component: ReactNode;
}
```

#### `StyledBlock` Properties
Since React blocks are always linked to StyledBlocks, understanding StyledBlock properties is essential:

```tsx
interface StyledBlock {
  /** Block type identifier - always BlockType.Styled */
  type: BlockType.Styled;
  /** Unique identifier for the block - used to link React components */
  id: string;
  /** Text content displayed in the block */
  text: string;
  /** Optional CSS properties to apply to the block */
  style?: React.CSSProperties;
  /** Optional CSS class name to apply to the block */
  className?: string;
  /** If true, the block text cannot be edited by the user */
  uneditable?: boolean;
  /** If true, the block cannot be deleted by the user */
  undeletable?: boolean;
}
```

**Property Details:**

- **`id`** (required): Must be unique across all blocks. This is the key that links the StyledBlock to its React component via `ReactBlockComponent.blockId`.
- **`text`** (required): The text shown in the editor. This is what users see as the block's content.
- **`style`**: Inline CSS styles applied directly to the block element. Use for dynamic styling.
- **`className`**: CSS class for styling via stylesheets. Use for consistent styling across blocks.
- **`uneditable`**: Prevents users from modifying the block's text content while still allowing deletion.
- **`undeletable`**: Prevents users from deleting the block. Combine with `uneditable` for fully protected blocks.

## Important Notes

### React Blocks are Linked to StyledBlocks
- **Every React component must be associated with a StyledBlock** - React blocks don't exist independently
- The `blockId` in `ReactBlockComponent` must match the `id` of an existing `StyledBlock`
- Create the StyledBlock first, then register the React component for that block

### Portal Rendering Requirements
- StyledBlocks automatically create DOM elements with an `id` attribute matching their block ID
- The StyledBlock's DOM element must exist before the portal can render the React component
- React components are rendered *inside* the StyledBlock's DOM element using React Portals

### State Management
- React components are managed via the `reactBlocks` prop array
- When removing a block, remove it from both the editor's blocks and the `reactBlocks` array
- The ReactBlocksManager automatically handles rendering when blocks appear/disappear in the DOM

## Example: Filter Pills

```tsx
import { useState, useRef } from 'react';
import { 
  SmartInput, 
  Editor,
  SmartInputApi,
  BlockType 
} from '@smart-input/core';
import { 
  ReactBlocksManager,
  ReactBlockComponent 
} from '@smart-input/reactblocks';

interface Filter {
  id: string;
  blockId: string;
  field: string;
  value: string;
}

function FilterPill({ field, value, onRemove }) {
  return (
    <div className="filter-pill">
      <span>{field}: {value}</span>
      <button onClick={onRemove}>×</button>
    </div>
  );
}

function App() {
  const [filters, setFilters] = useState<Filter[]>([]);
  const [reactBlocks, setReactBlocks] = useState<ReactBlockComponent[]>([]);
  const apiRef = useRef<SmartInputApi>(null);
  
  const addFilter = (field: string, value: string) => {
    const blockId = `filter-${Date.now()}`;
    const filterId = blockId;
    
    // Add styled block to editor
    apiRef.current?.apply(a => {
      a.insertStyledBlock({
        type: BlockType.Styled,
        id: blockId,
        text: `${field}: ${value}`,
        className: 'filter-pill-block',
      }, 0);
    });
    
    // Add to filters state
    const newFilter = { id: filterId, blockId, field, value };
    setFilters(prev => [...prev, newFilter]);
    
    // Add React component
    setReactBlocks(prev => [...prev, {
      blockId,
      component: (
        <FilterPill
          field={field}
          value={value}
          onRemove={() => removeFilter(filterId, blockId)}
        />
      ),
    }]);
  };
  
  const removeFilter = (filterId: string, blockId: string) => {
    setFilters(prev => prev.filter(f => f.id !== filterId));
    setReactBlocks(prev => prev.filter(rb => rb.blockId !== blockId));
  };
  
  return (
    <SmartInput ref={apiRef}>
      <Editor />
      <ReactBlocksManager reactBlocks={reactBlocks} />
    </SmartInput>
  );
}
```
