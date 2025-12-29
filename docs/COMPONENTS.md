# Component Reference

This document provides detailed information about all components in the smart-input library.

## Table of Contents
- [Core Components](#core-components)
  - [SmartInput](#SmartInput)
  - [Editor](#editor)
  - [UnmanagedEditor](#unmanagedEditor)
- [Extension Components](#extension-components)
  - [TypeaheadLookup](#typeaheadlookup)
  - [ReactBlocksManager](#reactblocksmanager)
  - [DragBlocksHandler](#dragblockshandler)
  - [DropContentHandler](#dropcontenthandler)
  - [CommitNotifier](#commitnotifier)

---

## Core Components

### SmartInput

**Package**: `@smart-input/core`

**Purpose**: The SmartInput is the top-level container component that provides state management and context for all child editor components. It acts as a state provider and coordinates between the Editor component and any extension components.

**When to use**: Use SmartInput as the root component when you need:
- State management across multiple child components
- Access to the API for programmatic control
- Integration with extension components (TypeaheadLookup, DropContentHandler, etc.)

**Example**:
```tsx
import { SmartInput } from '@smart-input/core';
import { useRef } from 'react';

function MyComponent() {
  const apiRef = useRef(null);

  return (
    <SmartInput ref={apiRef}>
      {/* Child components go here */}
    </SmartInput>
  );
}
```

**Props**:
- `blocks?: Block[]` - Initial blocks to populate the editor
- `onBlocksChange?: (blocks: Block[], characterPosition: number, cursorRect: Rect) => void` - Callback fired when blocks change
- `onCursorPositionChange?: (characterPosition: number, cursorRect: Rect, blocks: Block[]) => void` - Callback fired when cursor moves
- `className?: string` - Custom CSS class name to apply alongside the default `.SmartInput` class
- `children: ReactNode` - Child components (typically Editor and extension components)

**Ref API**: Returns a `SmartInputApi` object with methods for programmatic control (see [API Reference](./API.md))

---

### Editor

**Package**: `@smart-input/core`

**Purpose**: The Editor component provides the actual editable input area. It renders blocks as DOM elements and handles user input events like typing, pasting, and keyboard navigation.

**When to use**: Use Editor inside a SmartInput to provide the actual editing interface. This is the component that users interact with directly.

**Example**:
```tsx
import { SmartInput, Editor } from '@smart-input/core';
import '@smart-input/core/style.css';

function MyComponent() {
  return (
    <SmartInput>
      <Editor 
        placeholder="Start typing..."
        enableLineBreaks={true}
        imageWidth="200px"
        imageHeight="200px"
      />
    </SmartInput>
  );
}
```

**Props**:
- `enableLineBreaks?: boolean` (default: `false`) - Allow multi-line input with Enter key
- `className?: string` - Additional CSS class for styling
- `imageWidth?: string` - Width for image blocks (e.g., "200px")
- `imageHeight?: string` - Height for image blocks (e.g., "200px")
- `documentWidth?: string` - Width for document blocks
- `documentHeight?: string` - Height for document blocks
- `placeholder?: string` (default: `"Start typing"`) - Placeholder text when editor is empty

**Features**:
- Text input and editing
- Copy/paste support
- Undo/redo with Ctrl+Z/Ctrl+Y
- Support for text, styled, image, and document blocks
- Line break support (when enabled)
- Keyboard navigation (arrow keys, Home, End, etc.)

---

### UnmanagedEditor

**Package**: `@smart-input/core`

**Purpose**: A lower-level editor component that doesn't rely on the SmartInput state management. It manages its own state and provides direct block manipulation.

**When to use**: Use UnmanagedEditor when:
- You need a standalone editor without the SmartInput wrapper
- You want to manage state externally
- You're building a custom editor with different state management

**Note**: Most users should use SmartInput + Editor instead. UnmanagedEditor is for advanced use cases.

---

## Extension Components

### TypeaheadLookup

**Package**: `@smart-input/typeahead`

**Purpose**: Provides autocomplete/typeahead functionality as the user types. It displays a dropdown with suggestions based on customizable lookup functions and allows users to select suggestions to insert styled text blocks.

**When to use**: Use TypeaheadLookup when you need:
- Autocomplete functionality
- Tag or mention suggestions (@mentions, #hashtags)
- Context-aware suggestions based on what the user is typing
- Auto-insertion of styled blocks

**Example**:
```tsx
import { SmartInput, Editor } from '@smart-input/core';
import { TypeaheadLookup } from '@smart-input/typeahead';

const lookups = [
  {
    category: 'Users',
    lookup: async (text) => {
      // Fetch users matching the text
      const users = await fetchUsers(text);
      return users.map(u => ({
        id: u.id,
        text: u.name,
        score: u.relevance
      }));
    },
    style: { color: '#0066cc', fontWeight: 'bold' }
  }
];

function MyComponent() {
  return (
    <SmartInput>
      <TypeaheadLookup 
        lookups={lookups}
        autoHighlight={true}
        minSearchLength={2}
        onSelect={(item) => console.log('Selected:', item)}
      />
      <Editor placeholder="Type @ to mention someone" />
    </SmartInput>
  );
}
```

**Props**:
- `lookups: TypeaheadLookup[]` (required) - Array of lookup configurations
- `debounce?: number` (default: `200`) - Debounce delay in ms before searching
- `autoHighlight?: boolean` (default: `false`) - Auto-highlight first suggestion
- `wordsToCheck?: number` (default: `1`) - Number of words before cursor to check
- `maxHeight?: number` (default: `240`) - Maximum dropdown height in pixels
- `maxWidth?: number` (default: `380`) - Maximum dropdown width in pixels
- `autoInsert?: boolean` (default: `false`) - Auto-insert best match on space/tab
- `minSearchLength?: number` (default: `3`) - Minimum characters before showing suggestions
- `showCategory?: boolean` (default: `false`) - Show category labels in dropdown
- `showScore?: boolean` (default: `false`) - Show match scores in dropdown
- `highlightMatch?: boolean` (default: `false`) - Highlight matching text in suggestions
- `itemClassname?: string` - Custom CSS class for suggestion items
- `position?: 'above' | 'below'` (default: `'below'`) - Dropdown position relative to cursor
- `onSelect?: (item: LookupResult) => void` - Callback when suggestion is selected

**Lookup Configuration**:
```typescript
interface TypeaheadLookup {
  category: string;                           // Category name
  lookup: (text: string) => Promise<LookupResult[]>;  // Async lookup function
  style?: React.CSSProperties;                // CSS style for inserted styled blocks
}

interface LookupResult {
  id: string;      // Unique identifier
  text: string;    // Display text
  score?: number;  // Relevance score (0-1)
}
```

---

### ReactBlocksManager

**Package**: `@smart-input/reactblocks`

**Purpose**: Automatically renders React components inside styled blocks using React Portals. **React blocks are always linked to a StyledBlock** - each React component is associated with a specific StyledBlock via its unique `id` property. The manager monitors the editor for styled blocks and renders registered React components into their corresponding DOM elements.

**Key Concept**: React blocks are not standalone block types. They are React components rendered *inside* existing `StyledBlock` elements using React Portals. You must create a `StyledBlock` first, then register a React component for that block's `id`.

**When to use**: Use ReactBlocksManager when you need:
- Rich interactive components inside the editor (pills, tags, tooltips, custom UI)
- React components that respond to user interactions within blocks
- Dynamic content that updates based on external state
- Custom visualizations or widgets inline with text

**Example**:
```tsx
import { SmartInput, Editor, BlockType } from '@smart-input/core';
import { ReactBlocksManager, ReactBlocksManagerApi } from '@smart-input/reactblocks';
import { useRef } from 'react';

function FilterPill({ field, operator, value, onRemove }) {
  return (
    <div className="filter-pill">
      <span>{field} {operator} {value}</span>
      <button onClick={onRemove}>×</button>
    </div>
  );
}

function MyComponent() {
  const reactBlocksRef = useRef<ReactBlocksManagerApi>(null);
  const apiRef = useRef(null);

  const addFilter = () => {
    const blockId = `filter-${Date.now()}`;
    
    // Insert styled block
    apiRef.current?.apply(api => {
      api.insertStyledBlock({
        type: BlockType.Styled,
        id: blockId,
        text: 'filter',
        className: 'filter-block'
      }, 0);
    });

    // Register React component for this block
    reactBlocksRef.current?.registerReactBlock({
      blockId,
      component: (
        <FilterPill
          field="Name"
          operator="equals"
          value="John"
          onRemove={() => handleRemove(blockId)}
        />
      )
    });
  };

  const handleRemove = (blockId) => {
    reactBlocksRef.current?.unregisterReactBlock(blockId);
  };

  return (
    <SmartInput ref={apiRef}>
      <Editor />
      <ReactBlocksManager ref={reactBlocksRef} />
    </SmartInput>
  );
}
```

**Props**:

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `reactBlocks` | `ReactBlockComponent[]` | No | `[]` | Array of React components linked to StyledBlocks |
| `targetElementId` | `string` | No | `document.body` | ID of element to monitor for StyledBlock DOM mutations |

**Ref API** (`ReactBlocksManagerApi`):
- `registerReactBlock(reactBlock: ReactBlockComponent): void` - Register a React component for a StyledBlock
- `unregisterReactBlock(blockId: string): void` - Remove a React component from a StyledBlock

**ReactBlockComponent Interface**:
```typescript
interface ReactBlockComponent {
  /** The unique ID of the StyledBlock this React component is linked to */
  blockId: string;
  /** The React component to render inside the StyledBlock */
  component: ReactNode;
}
```

**How It Works**:
1. Create a `StyledBlock` with a unique `id` using the SmartInput API
2. Register a React component for that StyledBlock's `id` using `ReactBlocksManager`
3. The manager automatically finds the StyledBlock's DOM element and renders your component using a React Portal
4. When the StyledBlock is removed from the editor, unregister the React component

**Important Notes**:
- **React blocks are linked to StyledBlocks** - they don't exist as independent block types
- The `blockId` must match the `id` property of an existing `StyledBlock`
- StyledBlocks must have a unique `id` property for React component linkage
- The StyledBlock must exist in the DOM before registering a React component
- React components are rendered via React Portals into the StyledBlock's DOM element
- Changes to the component will trigger re-renders automatically

---

### DragBlocksHandler

**Package**: `@smart-input/dragblocks`

**Purpose**: Enables drag-and-drop reordering of styled, image, and document blocks within the editor. Provides visual feedback during drag operations and automatically updates block order.

**When to use**: Use DragBlocksHandler when you need:
- Reorderable pills, tags, or tokens
- Drag-and-drop for images and documents
- Visual block arrangement
- User-controlled content organization

**Example**:
```tsx
import { SmartInput, Editor } from '@smart-input/core';
import { DragBlocksHandler } from '@smart-input/dragblocks';

function MyComponent() {
  return (
    <SmartInput>
      <Editor />
      <DragBlocksHandler>
        <></>
      </DragBlocksHandler>
    </SmartInput>
  );
}
```

**Props**:
- `children: ReactNode` (required) - Must provide children (can be empty fragment `<></>`)

**Features**:
- Drag styled blocks (with `uneditable: true` recommended)
- Drag image blocks
- Drag document blocks
- Visual drop indicator showing insertion point
- Smooth animations
- Automatic state updates

**Draggable Block Types**:
- ✅ `StyledBlock` (especially with `uneditable: true`)
- ✅ `ImageBlock`
- ✅ `DocumentBlock`
- ❌ `TextBlock` (not draggable)

**Visual Feedback**:
- Dragging block becomes semi-transparent (50% opacity)
- Blue animated line shows drop position
- Cursor changes to indicate draggable items

**Best Practices**:
- Set `uneditable: true` on styled blocks that should be draggable pills
- Use with ReactBlocksManager for interactive draggable components
- Combine with className for custom drag styling

**Example with Interactive Pills**:
```tsx
import { SmartInput, Editor, BlockType } from '@smart-input/core';
import { ReactBlocksManager } from '@smart-input/reactblocks';
import { DragBlocksHandler } from '@smart-input/dragblocks';

function MyComponent() {
  const addPill = (text) => {
    const blockId = `pill-${Date.now()}`;
    apiRef.current?.apply(api => {
      api.insertStyledBlock({
        type: BlockType.Styled,
        id: blockId,
        text: text,
        uneditable: true,  // Make it draggable
        className: 'pill'
      }, 0);
    });

    reactBlocksRef.current?.registerReactBlock({
      blockId,
      component: <Pill text={text} />
    });
  };

  return (
    <SmartInput>
      <Editor />
      <ReactBlocksManager ref={reactBlocksRef} />
      <DragBlocksHandler>
        <></>
      </DragBlocksHandler>
    </SmartInput>
  );
}
```

---

### DropContentHandler

**Package**: `@smart-input/dropcontent`

**Purpose**: Enables drag-and-drop functionality for files (images and documents). It provides visual feedback during drag operations and automatically inserts appropriate blocks (ImageBlock or DocumentBlock) when files are dropped.

**When to use**: Use DropContentHandler when you need:
- File upload via drag and drop
- Image insertion into the editor
- Document attachment functionality
- Visual feedback during drag operations

**Example**:
```tsx
import { SmartInput, Editor } from '@smart-input/core';
import { DropContentHandler } from '@smart-input/dropcontent';

function MyComponent() {
  return (
    <SmartInput>
      <DropContentHandler
        acceptedTypes={['image/*', 'application/pdf']}
        onDropSuccess={(files) => console.log('Dropped:', files)}
        onDropError={(error) => console.error('Drop error:', error)}
      >
        <Editor placeholder="Drag and drop files here" />
      </DropContentHandler>
    </SmartInput>
  );
}
```

**Props**:
- `children: ReactNode` (required) - Child components to wrap (typically Editor)
- `acceptedTypes?: string[]` (default: `['image/*', 'application/pdf', '.doc', '.docx', '.txt']`) - Accepted MIME types and file extensions
- `onDropSuccess?: (files: File[]) => void` - Callback fired when files are successfully dropped
- `onDropError?: (error: Error) => void` - Callback fired when drop operation fails

**Features**:
- Visual drop indicator showing where files will be inserted
- Automatic block type detection (image vs document)
- Support for multiple file drops
- Cursor position-aware insertion
- Drag over/leave state management

**Supported Block Types**:
- **ImageBlock**: Created for image files (image/png, image/jpeg, etc.)
  - Displays as inline image with configurable dimensions
  - Can be deleted by selecting and pressing Delete key
- **DocumentBlock**: Created for non-image files (PDFs, docs, etc.)
  - Displays as document icon with file name
  - Can be deleted by selecting and pressing Delete key

---

### CommitNotifier

**Package**: `@smart-input/commitnotifier`

**Purpose**: Handles content submission (commit) with configurable key combinations and optional history management. It's similar to how chat applications or terminal inputs work - press Enter to submit, with optional history navigation.

**When to use**: Use CommitNotifier when you need:
- Submit/send functionality (like in chat or terminal apps)
- History navigation (up/down arrows to recall previous entries)
- Custom commit key combinations
- Clear editor after submission

**Example**:
```tsx
import { SmartInput, Editor } from '@smart-input/core';
import { CommitNotifier } from '@smart-input/commitnotifier';

function ChatInput() {
  const handleCommit = (items) => {
    console.log('Sending message:', items);
    // Send message to server
  };

  return (
    <SmartInput>
      <CommitNotifier
        onCommit={handleCommit}
        commitKeyCombination={{ key: 'Enter' }}
        enableHistory={true}
        maxHistory={50}
        historyStorageKey="chat-history"
      />
      <Editor placeholder="Type a message..." />
    </SmartInput>
  );
}
```

**Props**:
- `onCommit: (items: CommitItem[]) => void` (required) - Callback fired when content is committed
- `commitKeyCombination?: KeyCombination` - Key combination to trigger commit (default: Enter)
- `maxHistory?: number` (default: `50`) - Maximum number of history entries to keep
- `historyStorageKey?: string` (default: `'commit-history'`) - localStorage key for history persistence
- `enableHistory?: boolean` (default: `false`) - Enable history navigation with arrow keys

**KeyCombination Interface**:
```typescript
interface KeyCombination {
  key: string;           // e.g., 'Enter', 'Tab', 's'
  code?: string;         // e.g., 'Enter', 'Tab', 'KeyS'
  altKey?: boolean;      // Alt/Option modifier
  ctrlKey?: boolean;     // Control modifier
  shiftKey?: boolean;    // Shift modifier
  metaKey?: boolean;     // Command (Mac) / Windows key
}
```

**CommitItem Interface**:
```typescript
interface CommitItem {
  type: 'text' | 'styled' | 'image' | 'document';
  text?: string;                    // For text and styled blocks
  id?: string;                      // For styled, image, and document blocks
  style?: React.CSSProperties;      // For styled blocks
  name?: string;                    // For image and document blocks
  file?: File;                      // For image and document blocks
  url?: string;                     // For image and document blocks
  alt?: string;                     // For image blocks
}
```

**History Navigation**:
- **Arrow Up** on first line: Navigate to previous (more recent) history entry, starting from the most recent. Stops at the oldest entry.
- **Arrow Down** on last line: Navigate to next (newer) history entry. Returns to current input when reaching the most recent entry. Does nothing if not currently in history mode.
- History is saved to localStorage (when enabled)
- Only commits that result in actual submission are added to history
- History respects `maxHistory` limit (oldest entries are removed)

**Behavior**:
1. User types content in the editor
2. User presses commit key combination (default: Enter)
3. `onCommit` callback is fired with current blocks converted to CommitItems
4. Editor is cleared (blocks reset to empty)
5. If history is enabled, entry is added to history
6. User can navigate history with Arrow Up (goes back to most recent, then older) and Arrow Down (goes forward to newer, then current)

---

## Block Types

All components work with the following block types:

### TextBlock
```typescript
interface TextBlock {
  type: BlockType.Text;
  text: string;
}
```

Plain text content with no special formatting or behavior.

**Properties:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | `BlockType.Text` | Yes | Block type identifier - always `BlockType.Text` |
| `text` | `string` | Yes | The plain text content |

### StyledBlock
```typescript
interface StyledBlock {
  type: BlockType.Styled;
  id: string;
  text: string;
  style?: React.CSSProperties;
  className?: string;
  uneditable?: boolean;
  undeletable?: boolean;
}
```

Styled text with custom CSS and optional behavior controls. **StyledBlocks can be linked to React components** using the `ReactBlocksManager` from `@smart-input/reactblocks`.

**Properties:**

| Property | Type | Required | Description |\n|----------|------|----------|-------------|\n| `type` | `BlockType.Styled` | Yes | Block type identifier |\n| `id` | `string` | Yes | Unique identifier - used to link React components via `ReactBlocksManager` |\n| `text` | `string` | Yes | Text content displayed in the block |\n| `style` | `React.CSSProperties` | No | Inline CSS styles applied to the block |\n| `className` | `string` | No | CSS class name for styling via stylesheets |\n| `uneditable` | `boolean` | No | If true, prevents editing the block's text content |\n| `undeletable` | `boolean` | No | If true, prevents deleting the block |

**Common Uses:**
- Tags, pills, and chips created by TypeaheadLookup
- Custom styled tokens and mentions
- Interactive components (when linked with ReactBlocksManager)
- Read-only labels and badges (using `uneditable` and `undeletable`)

### ImageBlock
```typescript
interface ImageBlock {
  type: BlockType.Image;
  id: string;
  name: string;
  file: File;
  url: string;
  alt?: string;
  contentType: string;
  undeletable?: boolean;
}
```

Image content created by DropContentHandler or programmatically via API.

**Properties:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | `BlockType.Image` | Yes | Block type identifier - always `BlockType.Image` |
| `id` | `string` | Yes | Unique identifier for the image block |
| `name` | `string` | Yes | Original filename of the image |
| `file` | `File` | Yes | The File object containing the image data |
| `url` | `string` | Yes | Blob URL for preview/display |
| `alt` | `string` | No | Alternative text for accessibility |
| `contentType` | `string` | Yes | MIME type of the image (e.g., 'image/png') |
| `undeletable` | `boolean` | No | If true, prevents deleting the image block |

### DocumentBlock
```typescript
interface DocumentBlock {
  type: BlockType.Document;
  id: string;
  name: string;
  file: File;
  url: string;
  contentType: string;
  undeletable?: boolean;
}
```

Document/file attachment created by DropContentHandler or programmatically via API.

**Properties:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | `BlockType.Document` | Yes | Block type identifier - always `BlockType.Document` |
| `id` | `string` | Yes | Unique identifier for the document block |
| `name` | `string` | Yes | Original filename of the document |
| `file` | `File` | Yes | The File object containing the document data |
| `url` | `string` | Yes | Blob URL for download/access |
| `contentType` | `string` | Yes | MIME type of the document (e.g., 'application/pdf') |
| `undeletable` | `boolean` | No | If true, prevents deleting the document block |

---

## Styling

All packages include CSS that needs to be imported:

```tsx
// Core styles (required)
import '@smart-input/core/style.css';

// Optional: Import extension styles if using those components
// Note: TypeaheadLookup and DropContentHandler include their styles in the component
```

You can also provide custom `className` props to most components for additional styling.
