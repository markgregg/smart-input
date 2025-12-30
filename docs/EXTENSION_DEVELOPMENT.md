# Extension Component Development Guide

This guide explains how to create custom extension components for the smart-input library, following the patterns used by TypeaheadLookup, DropContentHandler, and CommitNotifier.

## Table of Contents
- [Overview](#overview)
- [Extension Architecture](#extension-architecture)
- [Core Concepts](#core-concepts)
- [State Management](#state-management)
- [Creating Your First Extension](#creating-your-first-extension)
- [Advanced Patterns](#advanced-patterns)
- [Best Practices](#best-practices)
- [Testing Extensions](#testing-extensions)
- [Publishing Extensions](#publishing-extensions)

---

## Overview

Extension components are React components that:
- Live alongside the Editor within a SmartInput
- Access shared state through Zustand stores
- Manipulate blocks programmatically
- Handle keyboard events
- React to cursor position and content changes

**Extension Benefits**:
- Modular and reusable
- Don't require Editor modifications
- Can be combined together
- Access the same state management system

---

## Extension Architecture

### Component Hierarchy

```
<SmartInput>           ← State Provider
  <ExtensionA />        ← Your extension
  <ExtensionB />        ← Another extension
  <Editor />            ← Core editor
</SmartInput>
```

### State Flow

```
User Input → Editor → State Stores → Extensions React
                ↓                          ↓
          Extensions ← Modify Blocks ← Extension Logic
```

---

## Core Concepts

### 1. Zustand Stores

The library uses Zustand for state management. Key stores:

**BlocksStore**:
```typescript
interface BlocksState {
  blocks: Block[];
  setBlocks: (blocks: Block[]) => void;
}
```

**CursorPositionStore**:
```typescript
interface CursorPositionState {
  characterPosition: number;
  cursorRect: Rect;
  updateCharacterPosition: (position: number) => void;
}
```

**BufferStore** (for undo/redo):
```typescript
interface BufferState {
  undoBuffer: Block[][];
  appendToBuffer: (blocks: Block[]) => void;
  undo: () => Block[] | null;
  redo: () => Block[] | null;
}
```

**BehaviourStore**:
```typescript
interface BehaviourState {
  selectionInProgress: boolean;
  setSelectionInProgress: (value: boolean) => void;
}
```

**KeyHandlerStore**:
```typescript
interface KeyHandlerState {
  addKeyboardHandler: (id: string, handler: KeyHandler) => void;
  removeKeyboardHandler: (id: string) => void;
}
```

### 2. Accessing State

Use the provided hooks:

```typescript
import { 
  useBlocks, 
  useCursorPosition, 
  useBuffer,
  useBehaviour,
  useKeyHandlers 
} from '@smart-input/core';

function MyExtension() {
  const { blocks, setBlocks } = useBlocks(s => s);
  const { characterPosition } = useCursorPosition(s => s);
  const { appendToBuffer } = useBuffer(s => s);
  
  // Your logic here
}
```

### 3. Block Types

Your extension can create and manipulate these block types:

```typescript
import { Block, BlockType } from '@smart-input/core';

// Text block
const textBlock: TextBlock = {
  type: BlockType.Text,
  text: 'Plain text'
};

// Styled block (for highlighting, mentions, tags)
const styledBlock: StyledBlock = {
  type: BlockType.Styled,
  id: 'unique-id',
  text: '@mention',
  style: { color: '#0066cc' }
};

// Image block
const imageBlock: ImageBlock = {
  type: BlockType.Image,
  id: 'img-123',
  name: 'photo.jpg',
  file: fileObject,
  url: 'blob:...',
  alt: 'Description'
};

// Document block
const documentBlock: DocumentBlock = {
  type: BlockType.Document,
  id: 'doc-123',
  name: 'report.pdf',
  file: fileObject,
  url: 'blob:...'
};
```

### 4. Utility Functions

The library provides utility functions for block manipulation:

```typescript
import {
  getBlockIndexAtPosition,
  insertStyledBlockAtPosition,
  replaceTextAtPosition,
  splitTextFromStyledBlock,
  transformToTextBlocks
} from '@smart-input/core';
```

---

## Creating Your First Extension

Let's create a "Word Counter" extension that displays word count and adds a highlight feature.

### Step 1: Create the Component

```typescript
// WordCounter.tsx
import React, { useState, useEffect } from 'react';
import { 
  useBlocks, 
  useCursorPosition,
  useBuffer,
  BlockType 
} from '@smart-input/core';
import './WordCounter.css';

export interface WordCounterProps {
  showCharCount?: boolean;
  highlightLongWords?: boolean;
  longWordThreshold?: number;
}

export const WordCounter: React.FC<WordCounterProps> = ({
  showCharCount = false,
  highlightLongWords = false,
  longWordThreshold = 10
}) => {
  const { blocks, setBlocks } = useBlocks(s => s);
  const { appendToBuffer } = useBuffer(s => s);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  // Calculate word count whenever blocks change
  useEffect(() => {
    const text = blocks
      .filter(b => b.type === BlockType.Text || b.type === BlockType.Styled)
      .map(b => (b as any).text)
      .join(' ');
    
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    setWordCount(words.length);
    setCharCount(text.length);

    // Highlight long words if enabled
    if (highlightLongWords) {
      highlightLongWordsInBlocks(words, text);
    }
  }, [blocks, highlightLongWords, longWordThreshold]);

  const highlightLongWordsInBlocks = (words: string[], fullText: string) => {
    const longWords = words.filter(w => w.length >= longWordThreshold);
    
    if (longWords.length === 0) return;

    let newBlocks = [...blocks];
    let modified = false;

    longWords.forEach(word => {
      // Check if word is already highlighted
      const alreadyHighlighted = newBlocks.some(
        b => b.type === BlockType.Styled && 
        (b as any).text === word &&
        (b as any).id.startsWith('long-word-')
      );

      if (!alreadyHighlighted && fullText.includes(word)) {
        // Find and highlight the word
        // (Simplified - you'd use proper block manipulation utilities)
        modified = true;
      }
    });

    if (modified) {
      setBlocks(newBlocks);
      appendToBuffer(newBlocks);
    }
  };

  return (
    <div className="word-counter">
      <div className="word-counter-stats">
        <span className="stat">
          <strong>Words:</strong> {wordCount}
        </span>
        {showCharCount && (
          <span className="stat">
            <strong>Characters:</strong> {charCount}
          </span>
        )}
      </div>
    </div>
  );
};
```

### Step 2: Add Styling

```css
/* WordCounter.css */
.word-counter {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.word-counter-stats {
  display: flex;
  gap: 16px;
}

.stat {
  font-size: 14px;
  color: #333;
}

.stat strong {
  margin-right: 4px;
}
```

### Step 3: Use the Extension

```typescript
// App.tsx
import { SmartInput, Editor } from '@smart-input/core';
import { WordCounter } from './WordCounter';
import '@smart-input/core/style.css';

function App() {
  return (
    <SmartInput>
      <WordCounter 
        showCharCount={true}
        highlightLongWords={true}
        longWordThreshold={12}
      />
      <Editor placeholder="Start typing..." />
    </SmartInput>
  );
}
```

---

## Advanced Patterns

### Pattern 1: Keyboard Event Handling

Create an extension that responds to keyboard shortcuts:

```typescript
import React, { useEffect, useCallback } from 'react';
import { 
  useBlocks,
  useBuffer,
  useKeyHandlers,
  BlockType,
  StyledBlock
} from '@smart-input/core';

export const TextFormatter: React.FC = () => {
  const { blocks, setBlocks } = useBlocks(s => s);
  const { appendToBuffer } = useBuffer(s => s);
  const { addKeyboardHandler, removeKeyboardHandler } = useKeyHandlers(s => s);

  const handleBoldShortcut = useCallback((event: KeyboardEvent) => {
    // Ctrl+B to make text bold
    if (event.ctrlKey && event.key === 'b') {
      event.preventDefault();
      
      // Get selected text (you'd need selection logic)
      const selectedText = getSelectedText();
      
      if (selectedText) {
        const newBlocks = blocks.map(block => {
          if (block.type === BlockType.Text && 
              (block as any).text.includes(selectedText)) {
            // Convert to styled block
            return {
              type: BlockType.Styled,
              id: `bold-${Date.now()}`,
              text: selectedText,
              style: { fontWeight: 'bold' }
            } as StyledBlock;
          }
          return block;
        });
        
        setBlocks(newBlocks);
        appendToBuffer(newBlocks);
      }
      
      return true; // Handled
    }
    return false; // Not handled
  }, [blocks, setBlocks, appendToBuffer]);

  useEffect(() => {
    // Register keyboard handler
    addKeyboardHandler('text-formatter', handleBoldShortcut);
    
    return () => {
      // Cleanup on unmount
      removeKeyboardHandler('text-formatter');
    };
  }, [addKeyboardHandler, removeKeyboardHandler, handleBoldShortcut]);

  return null; // No UI, just logic
};
```

### Pattern 2: Cursor-Aware Extension

React to cursor position changes:

```typescript
import React, { useEffect, useState } from 'react';
import {
  useCursorPosition,
  useBlocks,
  BlockType
} from '@smart-input/core';

export const ContextualHelp: React.FC = () => {
  const { characterPosition, cursorRect } = useCursorPosition(s => s);
  const { blocks } = useBlocks(s => s);
  const [helpText, setHelpText] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    // Get text before cursor
    let textBeforeCursor = '';
    let currentPos = 0;
    
    for (const block of blocks) {
      if (block.type === BlockType.Text || block.type === BlockType.Styled) {
        const blockText = (block as any).text;
        if (currentPos + blockText.length >= characterPosition) {
          textBeforeCursor += blockText.substring(
            0, 
            characterPosition - currentPos
          );
          break;
        }
        textBeforeCursor += blockText;
        currentPos += blockText.length;
      }
    }

    // Provide contextual help based on what user is typing
    if (textBeforeCursor.endsWith('how to ')) {
      setHelpText('Try: "format", "insert", "save"');
      setShowHelp(true);
    } else {
      setShowHelp(false);
    }
  }, [characterPosition, blocks]);

  if (!showHelp) return null;

  return (
    <div 
      className="contextual-help"
      style={{
        position: 'absolute',
        top: cursorRect.top + cursorRect.height + 5,
        left: cursorRect.left,
        background: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '4px',
        padding: '8px',
        fontSize: '12px',
        zIndex: 1000
      }}
    >
      💡 {helpText}
    </div>
  );
};
```

### Pattern 3: Async Data Integration

Fetch and insert data from external sources:

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import {
  useBlocks,
  useBuffer,
  useCursorPosition,
  BlockType,
  StyledBlock
} from '@smart-input/core';

interface DataInsertProps {
  apiEndpoint: string;
  triggerChar: string;  // e.g., '/'
}

export const DataInserter: React.FC<DataInsertProps> = ({
  apiEndpoint,
  triggerChar
}) => {
  const { blocks, setBlocks } = useBlocks(s => s);
  const { appendToBuffer } = useBuffer(s => s);
  const { characterPosition } = useCursorPosition(s => s);
  const [isLoading, setIsLoading] = useState(false);

  const insertData = useCallback(async (command: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${apiEndpoint}/${command}`);
      const data = await response.json();
      
      // Insert data as styled block at cursor position
      const newBlock: StyledBlock = {
        type: BlockType.Styled,
        id: `data-${Date.now()}`,
        text: data.text,
        style: {
          backgroundColor: '#e6f7ff',
          padding: '2px 6px',
          borderRadius: '3px',
          border: '1px solid #91d5ff'
        }
      };

      // Insert at cursor position
      const newBlocks = insertBlockAtPosition(
        blocks, 
        newBlock, 
        characterPosition
      );
      
      setBlocks(newBlocks);
      appendToBuffer(newBlocks);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [blocks, characterPosition, apiEndpoint, setBlocks, appendToBuffer]);

  useEffect(() => {
    // Watch for trigger character
    const text = getTextBeforeCursor(blocks, characterPosition);
    const match = text.match(new RegExp(`\\${triggerChar}(\\w+)$`));
    
    if (match) {
      const command = match[1];
      insertData(command);
    }
  }, [blocks, characterPosition, triggerChar, insertData]);

  if (isLoading) {
    return <div className="data-inserter-loading">Loading data...</div>;
  }

  return null;
};

// Helper function
function insertBlockAtPosition(
  blocks: Block[], 
  block: Block, 
  position: number
): Block[] {
  // Implementation to insert block at specific position
  // See core library utilities for reference
  return blocks; // Simplified
}
```

### Pattern 4: Visual Overlay

Create overlays that appear over the editor:

```typescript
import React, { useState, useEffect } from 'react';
import {
  useCursorPosition,
  useBlocks,
  BlockType
} from '@smart-input/core';
import './EmojiPicker.css';

const EMOJI_LIST = ['😀', '😂', '😍', '🤔', '👍', '❤️', '🎉', '🔥'];

export const EmojiPicker: React.FC = () => {
  const { cursorRect, characterPosition } = useCursorPosition(s => s);
  const { blocks, setBlocks } = useBlocks(s => s);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show emoji picker when user types ':'
    const text = getTextBeforeCursor(blocks, characterPosition);
    setShow(text.endsWith(':'));
  }, [blocks, characterPosition]);

  const insertEmoji = (emoji: string) => {
    // Remove the ':' and insert emoji
    const newBlocks = [...blocks];
    // ... manipulation logic ...
    setBlocks(newBlocks);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div 
      className="emoji-picker"
      style={{
        position: 'absolute',
        top: cursorRect.top + cursorRect.height + 5,
        left: cursorRect.left,
        zIndex: 1000
      }}
    >
      {EMOJI_LIST.map(emoji => (
        <button
          key={emoji}
          onClick={() => insertEmoji(emoji)}
          className="emoji-button"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};
```

---

## Best Practices

### 1. Always Append to Buffer

When modifying blocks, always append to the undo buffer:

```typescript
const newBlocks = [...modifiedBlocks];
setBlocks(newBlocks);
appendToBuffer(newBlocks);  // ← Don't forget this!
```

### 2. Use Unique IDs

Generate unique IDs for styled blocks:

```typescript
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const styledBlock: StyledBlock = {
  type: BlockType.Styled,
  id: generateId(),
  text: 'text',
  style: {}
};
```

### 3. Clean Up Resources

Always remove event handlers and subscriptions:

```typescript
useEffect(() => {
  addKeyboardHandler('my-extension', handler);
  
  return () => {
    removeKeyboardHandler('my-extension');
  };
}, []);
```

### 4. Handle Edge Cases

Check for empty blocks, null values, and edge positions:

```typescript
if (blocks.length === 0) return;
if (characterPosition < 0 || characterPosition > totalLength) return;
```

### 5. Debounce Expensive Operations

Use debouncing for API calls or heavy computations:

```typescript
import { useMemo } from 'react';
import debounce from 'lodash/debounce';

const debouncedFetch = useMemo(
  () => debounce(async (text) => {
    const results = await fetch(`/api/search?q=${text}`);
    // ...
  }, 300),
  []
);
```

### 6. Test with Different Scenarios

Test your extension with:
- Empty editor
- Text-only content
- Mixed content (text + styled + images)
- Long content
- Rapid user input
- Multiple extensions together

---

## Testing Extensions

### Unit Tests

Test your extension logic in isolation:

```typescript
import { render, screen } from '@testing-library/react';
import { SmartInput, Editor } from '@smart-input/core';
import { MyExtension } from './MyExtension';

describe('MyExtension', () => {
  it('should render without crashing', () => {
    render(
      <SmartInput>
        <MyExtension />
        <Editor />
      </SmartInput>
    );
  });

  it('should respond to text input', async () => {
    // Test logic
  });
});
```

### Integration Tests (Playwright)

Add feature file for your extension:

```gherkin
# myextension.feature
Feature: My Extension

  Scenario: Extension activates on trigger
    Given I navigate to the test app with my extension
    When I type the trigger text
    Then my extension UI should appear
```

Implement steps:

```typescript
// myextension.steps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Then('my extension UI should appear', async function() {
  const ui = this.page.locator('.my-extension-ui');
  await expect(ui).toBeVisible();
});
```

---

## Publishing Extensions

### Step 1: Package Structure

```
my-extension/
├── src/
│   ├── index.ts
│   ├── MyExtension.tsx
│   └── MyExtension.css
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### Step 2: package.json

```json
{
  "name": "@yourscope/smart-input-myextension",
  "version": "1.0.0",
  "description": "My custom extension for smart-input",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "peerDependencies": {
    "@smart-input/core": "^1.0.0",
    "react": "^18.0.0",
    "zustand": "^5.0.0"
  },
  "keywords": [
    "smart-input",
    "extension",
    "react"
  ]
}
```

### Step 3: Export Your Component

```typescript
// src/index.ts
export { MyExtension } from './MyExtension';
export type { MyExtensionProps } from './MyExtension';
```

### Step 4: Build and Publish

```bash
npm run build
npm publish
```

---

## Example: Complete Extension

Here's a complete "SlashCommands" extension:

```typescript
// SlashCommands.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  useBlocks,
  useBuffer,
  useCursorPosition,
  useKeyHandlers,
  BlockType,
  Block
} from '@smart-input/core';
import './SlashCommands.css';

interface Command {
  name: string;
  description: string;
  action: (blocks: Block[], position: number) => Block[];
}

export interface SlashCommandsProps {
  commands?: Command[];
}

export const SlashCommands: React.FC<SlashCommandsProps> = ({ commands = [] }) => {
  const { blocks, setBlocks } = useBlocks(s => s);
  const { appendToBuffer } = useBuffer(s => s);
  const { characterPosition, cursorRect } = useCursorPosition(s => s);
  const { addKeyboardHandler, removeKeyboardHandler } = useKeyHandlers(s => s);
  
  const [visible, setVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredCommands, setFilteredCommands] = useState<Command[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Default commands
  const defaultCommands: Command[] = [
    {
      name: 'heading',
      description: 'Insert a heading',
      action: (blocks, pos) => {
        // Implementation
        return blocks;
      }
    },
    {
      name: 'date',
      description: 'Insert current date',
      action: (blocks, pos) => {
        // Implementation
        return blocks;
      }
    }
  ];

  const allCommands = [...defaultCommands, ...commands];

  // Watch for '/' trigger
  useEffect(() => {
    const text = getTextBeforeCursor(blocks, characterPosition);
    const match = text.match(/\/(\w*)$/);
    
    if (match) {
      setVisible(true);
      setSearchText(match[1]);
    } else {
      setVisible(false);
    }
  }, [blocks, characterPosition]);

  // Filter commands
  useEffect(() => {
    const filtered = allCommands.filter(cmd =>
      cmd.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredCommands(filtered);
    setSelectedIndex(0);
  }, [searchText, allCommands]);

  // Handle keyboard navigation
  const handleKeyboard = useCallback((event: KeyboardEvent) => {
    if (!visible) return false;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
      return true;
    }
    
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
      return true;
    }
    
    if (event.key === 'Enter') {
      event.preventDefault();
      executeCommand(filteredCommands[selectedIndex]);
      return true;
    }
    
    return false;
  }, [visible, filteredCommands, selectedIndex]);

  useEffect(() => {
    addKeyboardHandler('slash-commands', handleKeyboard);
    return () => removeKeyboardHandler('slash-commands');
  }, [handleKeyboard, addKeyboardHandler, removeKeyboardHandler]);

  const executeCommand = (command: Command) => {
    // Remove the '/' and search text
    // Execute command action
    const newBlocks = command.action(blocks, characterPosition);
    setBlocks(newBlocks);
    appendToBuffer(newBlocks);
    setVisible(false);
  };

  if (!visible || filteredCommands.length === 0) return null;

  return (
    <div 
      className="slash-commands"
      style={{
        position: 'absolute',
        top: cursorRect.top + cursorRect.height + 5,
        left: cursorRect.left
      }}
    >
      {filteredCommands.map((cmd, index) => (
        <div
          key={cmd.name}
          className={`command-item ${index === selectedIndex ? 'selected' : ''}`}
          onClick={() => executeCommand(cmd)}
        >
          <div className="command-name">/{cmd.name}</div>
          <div className="command-description">{cmd.description}</div>
        </div>
      ))}
    </div>
  );
};

// Helper function
function getTextBeforeCursor(blocks: Block[], position: number): string {
  let text = '';
  let currentPos = 0;
  
  for (const block of blocks) {
    if (block.type === BlockType.Text || block.type === BlockType.Styled) {
      const blockText = (block as any).text;
      if (currentPos + blockText.length >= position) {
        text += blockText.substring(0, position - currentPos);
        break;
      }
      text += blockText;
      currentPos += blockText.length;
    }
  }
  
  return text;
}
```

---

## Next Steps

- Review existing extensions: TypeaheadLookup, DropContentHandler, CommitNotifier
- Study the [Component Reference](./COMPONENTS.md) for component APIs
- Check the [API Reference](./API.md) for programmatic control
- See [Test Documentation](./TESTS.md) for testing your extension

Happy extension building! 🚀
