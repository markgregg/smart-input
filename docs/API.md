# API Reference

This document provides detailed information about the SmartInput API for programmatic control of the editor.

## Table of Contents
- [Overview](#overview)
- [Getting the API Reference](#getting-the-api-reference)
- [API Methods](#api-methods)
  - [apply](#apply)
  - [getBlockAtPosition](#getblockatposition)
  - [get](#get)
  - [getElementById](#getelementbyid)
  - [focus](#focus)
- [Function API](#function-api)
  - [clear](#clear)
  - [insert](#insert)
  - [delete](#delete)
  - [replace](#replace)
  - [replaceText](#replacetext)
  - [replaceAll](#replaceall)
  - [getBlocks](#getblocks)
  - [insertStyledBlock](#insertstyledblock)
  - [insertDocument](#insertdocument)
  - [insertImage](#insertimage)
  - [styleText](#styletext)

---

## Overview

The SmartInput API provides programmatic access to the editor's content and functionality. You can use it to:
- Insert, delete, or replace text
- Add styled blocks, images, or documents
- Query the current state
- Manipulate content based on user interactions or external events

---

## Getting the API Reference

To access the API, pass a ref to the SmartInput component:

```tsx
import { SmartInput, Editor, SmartInputApi } from '@smart-input/core';
import { useRef, useEffect } from 'react';

function MyComponent() {
  const apiRef = useRef<SmartInputApi>(null);

  useEffect(() => {
    if (apiRef.current) {
      // API is ready to use
      apiRef.current.apply(api => {
        api.insert('Hello, World!', 0);
      });
    }
  }, []);

  return (
    <SmartInput ref={apiRef}>
      <Editor />
    </SmartInput>
  );
}
```

---

## API Methods

### apply

Execute one or more operations on the editor content.

**Signature**:
```typescript
apply: (fn: (api: SmartInputFunctions) => void) => void
```

**Parameters**:
- `fn`: Function that receives the SmartInputFunctions API and performs operations

**Description**:
The `apply` method is the primary way to modify editor content. It receives a callback function with access to all manipulation methods. All operations within the callback are batched and applied together, ensuring consistent state updates.

**Example**:
```tsx
// Insert text
apiRef.current?.apply(api => {
  api.insert('Hello', 0);
});

// Multiple operations
apiRef.current?.apply(api => {
  api.clear();
  api.insert('New content', 0);
  api.styleText('content', 'highlight-1', { 
    backgroundColor: 'yellow' 
  });
});
```

---

### getBlockAtPosition

Get the block at a specific character position.

**Signature**:
```typescript
getBlockAtPosition: (position: number) => Block | null
```

**Parameters**:
- `position`: Character position in the editor (0-based)

**Returns**: The Block at that position, or null if position is invalid

**Example**:
```tsx
const block = apiRef.current?.getBlockAtPosition(5);
if (block?.type === BlockType.Text) {
  console.log('Text at position 5:', block.text);
}
```

---

### get

Get all current blocks as CommitItems.

**Signature**:
```typescript
get: () => CommitItem[]
```

**Returns**: Array of CommitItems representing the current editor content

**Description**:
Converts the internal block representation to CommitItems, which are simplified objects suitable for serialization or transmission. This is the same format used by the CommitNotifier component.

**Example**:
```tsx
const items = apiRef.current?.get();
console.log('Current content:', items);

// Save to server
fetch('/api/save', {
  method: 'POST',
  body: JSON.stringify(items)
});
```

---

### getElementById

Get a DOM element by its block ID.

**Signature**:
```typescript
getElementById: (id: string) => HTMLElement | null
```

**Parameters**:
- `id`: Block ID (used for styled, image, and document blocks)

**Returns**: HTML element with that ID, or null if not found

**Description**:
Useful for accessing the actual DOM element for a block, which can be used for measurements, animations, or direct DOM manipulation.

**Example**:
```tsx
// Get a styled block element
const element = apiRef.current?.getElementById('styled-block-123');
if (element) {
  element.scrollIntoView({ behavior: 'smooth' });
}
```

---

### focus

Set focus on the editor and position the cursor at the end of content.

**Signature**:
```typescript
focus: () => void
```

**Description**:
Sets focus on the contentEditable editor element and automatically positions the cursor at the end of the content. If the editor is empty, positions the cursor at the start. This is useful after programmatic changes or when you want to ensure the user can immediately start typing.

**Example**:
```tsx
// Focus after clearing or committing
const handleSubmit = (items: CommitItem[]) => {
  // Process submission
  console.log('Submitted:', items);
  
  // Restore focus for next input
  setTimeout(() => {
    apiRef.current?.focus();
  }, 0);
  
  return true; // Clear editor
};

// Focus when component mounts
useEffect(() => {
  apiRef.current?.focus();
}, []);

// Focus after programmatic changes
apiRef.current?.apply(api => {
  api.clear();
  api.insert('New content', 0);
});
apiRef.current?.focus(); // Focus after applying changes
```

---

## Function API

The following methods are available within the `apply` callback:

### clear

Clear all content from the editor.

**Signature**:
```typescript
clear: () => void
```

**Example**:
```tsx
apiRef.current?.apply(api => {
  api.clear();
});
```

---

### insert

Insert text at a specific position.

**Signature**:
```typescript
insert: (text: string, position: number) => void
```

**Parameters**:
- `text`: Text to insert
- `position`: Character position where text should be inserted (0-based)

**Description**:
Inserts text at the specified position. If inserting in the middle of a text block, it splits the block. If inserting at a non-text block, it creates a new text block before it.

**Example**:
```tsx
apiRef.current?.apply(api => {
  // Insert at the beginning
  api.insert('Hello ', 0);
  
  // Insert at the end (get current length first)
  const blocks = api.getBlocks();
  const length = blocks
    .filter(b => b.type === BlockType.Text || b.type === BlockType.Styled)
    .reduce((sum, b) => sum + (b as any).text.length, 0);
  api.insert(' World!', length);
});
```

---

### delete

Delete text from a range.

**Signature**:
```typescript
delete: (start: number, end: number) => void
```

**Parameters**:
- `start`: Start position (inclusive, 0-based)
- `end`: End position (exclusive, 0-based)

**Description**:
Deletes all text between start and end positions. Handles block boundaries automatically, potentially removing or merging blocks as needed.

**Example**:
```tsx
apiRef.current?.apply(api => {
  // Delete characters 5-10
  api.delete(5, 10);
  
  // Delete from position 0 to 5 (first 5 characters)
  api.delete(0, 5);
});
```

---

### replace

Replace text in a range with new text.

**Signature**:
```typescript
replace: (start: number, end: number, text: string) => void
```

**Parameters**:
- `start`: Start position (inclusive, 0-based)
- `end`: End position (exclusive, 0-based)
- `text`: New text to insert

**Description**:
Combination of delete and insert. Deletes the text in the range and inserts new text at the start position.

**Example**:
```tsx
apiRef.current?.apply(api => {
  // Replace characters 5-10 with "NEW"
  api.replace(5, 10, 'NEW');
});
```

---

### replaceText

Replace the first occurrence of text with new text.

**Signature**:
```typescript
replaceText: (oldText: string, text: string) => void
```

**Parameters**:
- `oldText`: Text to find and replace
- `text`: Replacement text

**Description**:
Searches for the first occurrence of `oldText` and replaces it with `text`. If `oldText` is not found, no changes are made.

**Example**:
```tsx
apiRef.current?.apply(api => {
  // Replace first "hello" with "hi"
  api.replaceText('hello', 'hi');
});
```

---

### replaceAll

Replace all occurrences of text with new text.

**Signature**:
```typescript
replaceAll: (oldText: string, text: string) => void
```

**Parameters**:
- `oldText`: Text to find and replace
- `text`: Replacement text

**Description**:
Searches for all occurrences of `oldText` and replaces them with `text`. Processes from beginning to end, adjusting positions as replacements are made.

**Example**:
```tsx
apiRef.current?.apply(api => {
  // Replace all "color" with "colour"
  api.replaceAll('color', 'colour');
});
```

---

### getBlocks

Get the current blocks array.

**Signature**:
```typescript
getBlocks: () => Block[]
```

**Returns**: Array of current blocks

**Description**:
Returns a copy of the current blocks array. Useful for inspecting state before making changes.

**Example**:
```tsx
apiRef.current?.apply(api => {
  const blocks = api.getBlocks();
  console.log('Current blocks:', blocks);
  
  // Calculate total text length
  const totalLength = blocks
    .filter(b => b.type === BlockType.Text || b.type === BlockType.Styled)
    .reduce((sum, b) => sum + (b as any).text.length, 0);
});
```

---

### insertStyledBlock

Insert a styled text block at a specific position.

**Signature**:
```typescript
insertStyledBlock: (block: StyledBlock, position: number) => void
```

**Parameters**:
- `block`: StyledBlock object to insert
- `position`: Character position where block should be inserted

**Description**:
Inserts a styled block (text with custom CSS) at the specified position. If inserting in the middle of a text block, it splits the block around the styled block.

**Example**:
```tsx
apiRef.current?.apply(api => {
  api.insertStyledBlock({
    type: BlockType.Styled,
    id: 'mention-123',
    text: '@john',
    style: {
      color: '#0066cc',
      fontWeight: 'bold',
      backgroundColor: '#e6f2ff',
      padding: '2px 4px',
      borderRadius: '3px'
    }
  }, 0);
});
```

---

### insertDocument

Insert a document block at a specific position.

**Signature**:
```typescript
insertDocument: (document: Document, position: number) => void
```

**Parameters**:
- `document`: Document object with file information
- `position`: Character position where document should be inserted

**Document Interface**:
```typescript
interface Document {
  name: string;
  file: File;
  url: string;     // Blob URL or download URL
}
```

**Example**:
```tsx
apiRef.current?.apply(api => {
  const file = new File(['content'], 'report.pdf', { 
    type: 'application/pdf' 
  });
  
  api.insertDocument({
    name: 'report.pdf',
    file: file,
    url: URL.createObjectURL(file)
  }, 0);
});
```

---

### insertImage

Insert an image block at a specific position.

**Signature**:
```typescript
insertImage: (image: Image, position: number) => void
```

**Parameters**:
- `image`: Image object with file information
- `position`: Character position where image should be inserted

**Image Interface**:
```typescript
interface Image {
  name: string;
  file: File;
  url: string;     // Blob URL or image URL
  alt?: string;    // Alt text for accessibility
}
```

**Example**:
```tsx
apiRef.current?.apply(api => {
  const file = new File(['...'], 'photo.jpg', { 
    type: 'image/jpeg' 
  });
  
  api.insertImage({
    name: 'photo.jpg',
    file: file,
    url: URL.createObjectURL(file),
    alt: 'User photo'
  }, 0);
});
```

---

### styleText

Find and style text by converting it to a styled block.

**Signature**:
```typescript
styleText: (text: string, id: string, style?: React.CSSProperties) => void
```

**Parameters**:
- `text`: Text to find and style
- `id`: Unique identifier for the styled block
- `style`: Optional CSS properties to apply

**Description**:
Searches for the specified text and converts it to a styled block. The text is removed from surrounding text blocks and replaced with a styled block. Only the first occurrence is styled.

**Example**:
```tsx
apiRef.current?.apply(api => {
  // Style the word "important"
  api.styleText('important', 'highlight-1', {
    backgroundColor: 'yellow',
    fontWeight: 'bold'
  });
  
  // Style without custom CSS (uses default styling)
  api.styleText('@mention', 'mention-1');
});
```

---

## Complete Example

Here's a complete example showing various API operations:

```tsx
import { 
  SmartInput, 
  Editor, 
  SmartInputApi,
  BlockType 
} from '@smart-input/core';
import '@smart-input/core/style.css';
import { useRef } from 'react';

function RichEditor() {
  const apiRef = useRef<SmartInputApi>(null);

  const handleFormat = (format: string) => {
    apiRef.current?.apply(api => {
      const blocks = api.getBlocks();
      const selectedText = getSelectedText(); // Your selection logic
      
      if (selectedText && format === 'bold') {
        api.styleText(selectedText, `bold-${Date.now()}`, {
          fontWeight: 'bold'
        });
      }
    });
  };

  const handleInsertMention = (username: string) => {
    apiRef.current?.apply(api => {
      // Get cursor position (you'd get this from state)
      const cursorPos = 10; // Example
      
      api.insertStyledBlock({
        type: BlockType.Styled,
        id: `mention-${Date.now()}`,
        text: `@${username}`,
        style: {
          color: '#0066cc',
          backgroundColor: '#e6f2ff',
          padding: '2px 4px',
          borderRadius: '3px',
          cursor: 'pointer'
        }
      }, cursorPos);
    });
  };

  const handleClear = () => {
    apiRef.current?.apply(api => {
      api.clear();
    });
  };

  const handleSave = () => {
    const items = apiRef.current?.get();
    console.log('Saving:', items);
    // Save to server...
  };

  return (
    <div>
      <div>
        <button onClick={() => handleFormat('bold')}>Bold</button>
        <button onClick={() => handleInsertMention('john')}>
          Mention @john
        </button>
        <button onClick={handleClear}>Clear</button>
        <button onClick={handleSave}>Save</button>
      </div>
      
      <SmartInput ref={apiRef}>
        <Editor placeholder="Start typing..." />
      </SmartInput>
    </div>
  );
}
```

---

## Tips and Best Practices

1. **Always use `apply`**: All content modifications must be done through the `apply` method to ensure proper state management.

2. **Batch operations**: Multiple operations within a single `apply` call are more efficient than multiple `apply` calls.

3. **Get state first**: Use `getBlocks()` to inspect current state before making changes:
   ```tsx
   apiRef.current?.apply(api => {
     const blocks = api.getBlocks();
     // Analyze blocks, then make changes
   });
   ```

4. **Position calculations**: Text positions are based on character indices. Images and documents don't contribute to position counting:
   ```tsx
   // "Hello[image]World" has positions:
   // H(0) e(1) l(2) l(3) o(4) [image] W(5) o(6) r(7) l(8) d(9)
   ```

5. **Styled block IDs**: Use unique IDs for styled blocks to allow later manipulation:
   ```tsx
   api.insertStyledBlock({
     type: BlockType.Styled,
     id: `unique-${Date.now()}-${Math.random()}`,
     text: 'styled text',
     style: {}
   }, position);
   ```

6. **Error handling**: API methods don't throw errors, but invalid operations (like inserting at invalid positions) may have no effect.

7. **Async operations**: The API itself is synchronous, but you can use it in async contexts:
   ```tsx
   const handleFetch = async () => {
     const data = await fetchData();
     apiRef.current?.apply(api => {
       api.insert(data.text, 0);
     });
   };
   ```
