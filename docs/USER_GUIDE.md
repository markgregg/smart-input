# User Guide

This comprehensive guide will walk you through implementing and using the smart-input library in your React application.

## Table of Contents
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Basic Implementation](#basic-implementation)
- [Advanced Features](#advanced-features)
- [Common Use Cases](#common-use-cases)
- [Styling and Customization](#styling-and-customization)
- [State Management](#state-management)
- [Troubleshooting](#troubleshooting)

---

## Installation

### Prerequisites
- Node.js 18 or higher
- React 18 or higher
- A React project set up (Create React App, Vite, Next.js, etc.)

### Install Core Package

```bash
npm install @smart-input/core zustand
# or
pnpm add @smart-input/core zustand
# or
yarn add @smart-input/core zustand
```

**Note**: `zustand` is a peer dependency used for state management.

### Install Extension Packages (Optional)

```bash
# For typeahead/autocomplete functionality
npm install @smart-input/typeahead

# For React components inside blocks
npm install @smart-input/reactblocks

# For drag-and-drop block reordering
npm install @smart-input/dragblocks

# For drag and drop file support
npm install @smart-input/dropcontent

# For commit/submit functionality with history
npm install @smart-input/commitnotifier
```

### Real-World Examples

Check out the [`examples/`](../examples/) directory for complete working implementations:

- **[chat-input](../examples/chat-input/)** - Simple chat interface with message history and auto-focus

---

## Quick Start

The simplest implementation requires just two components:

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

That's it! You now have a functioning rich text editor.

---

## Basic Implementation

### Single-Line Input

Perfect for search boxes, chat inputs, or any single-line input field:

```tsx
import { SmartInput, Editor } from '@smart-input/core';
import '@smart-input/core/style.css';

function SearchBar() {
  return (
    <SmartInput>
      <Editor 
        placeholder="Search..."
        className="search-input"
      />
    </SmartInput>
  );
}
```

### Multi-Line Input

Enable line breaks for text areas, notes, or comments:

```tsx
import { SmartInput, Editor } from '@smart-input/core';
import '@smart-input/core/style.css';

function NoteEditor() {
  return (
    <SmartInput>
      <Editor 
        enableLineBreaks={true}
        placeholder="Write your note..."
        className="note-editor"
      />
    </SmartInput>
  );
}
```

### With State Callbacks

Monitor content changes and cursor position:

```tsx
import { SmartInput, Editor, Block } from '@smart-input/core';
import '@smart-input/core/style.css';
import { useState } from 'react';

function MonitoredEditor() {
  const [content, setContent] = useState<Block[]>([]);
  const [cursorPos, setCursorPos] = useState(0);

  const handleBlocksChange = (blocks: Block[], characterPosition: number) => {
    setContent(blocks);
    console.log('Content changed:', blocks);
  };

  const handleCursorChange = (characterPosition: number) => {
    setCursorPos(characterPosition);
    console.log('Cursor at:', characterPosition);
  };

  return (
    <div>
      <SmartInput 
        onBlocksChange={handleBlocksChange}
        onCursorPositionChange={handleCursorChange}
      >
        <Editor placeholder="Type something..." />
      </SmartInput>
      <div>Cursor position: {cursorPos}</div>
    </div>
  );
}
```

### Controlled Component with Initial Content

Pre-populate the editor with initial blocks:

```tsx
import { SmartInput, Editor, Block, BlockType } from '@smart-input/core';
import '@smart-input/core/style.css';

function PrePopulatedEditor() {
  const initialBlocks: Block[] = [
    { type: BlockType.Text, text: 'Hello ' },
    { 
      type: BlockType.Styled, 
      id: 'user-1',
      text: '@John',
      style: { color: '#0066cc', fontWeight: 'bold' }
    },
    { type: BlockType.Text, text: ', welcome back!' }
  ];

  return (
    <SmartInput blocks={initialBlocks}>
      <Editor placeholder="Start typing..." />
    </SmartInput>
  );
}
```

---

## Advanced Features

### Adding Typeahead/Autocomplete

Perfect for mentions, hashtags, or context-aware suggestions:

```tsx
import { SmartInput, Editor } from '@smart-input/core';
import { TypeaheadLookup } from '@smart-input/typeahead';
import '@smart-input/core/style.css';

function EditorWithTypeahead() {
  // Define your lookup functions
  const lookups = [
    {
      category: 'Users',
      lookup: async (text: string) => {
        // Simulate API call
        const users = [
          { id: '1', text: 'john', score: 0.9 },
          { id: '2', text: 'jane', score: 0.8 },
          { id: '3', text: 'jack', score: 0.7 }
        ];
        
        return users.filter(u => 
          u.text.toLowerCase().includes(text.toLowerCase())
        );
      },
      style: { 
        color: '#0066cc', 
        backgroundColor: '#e6f2ff',
        padding: '2px 4px',
        borderRadius: '3px'
      }
    },
    {
      category: 'Tags',
      lookup: async (text: string) => {
        const tags = [
          { id: 't1', text: 'urgent', score: 1.0 },
          { id: 't2', text: 'important', score: 0.9 }
        ];
        
        return tags.filter(t => 
          t.text.toLowerCase().includes(text.toLowerCase())
        );
      },
      style: { 
        color: '#cc6600',
        backgroundColor: '#fff3e6',
        padding: '2px 4px',
        borderRadius: '3px'
      }
    }
  ];

  return (
    <SmartInput>
      <TypeaheadLookup
        lookups={lookups}
        minSearchLength={2}
        autoHighlight={true}
        debounce={200}
        onSelect={(item) => console.log('Selected:', item)}
      />
      <Editor placeholder="Type @ to mention or # for tags..." />
    </SmartInput>
  );
}
```

### Adding Drag and Drop

Enable file uploads with visual feedback:

```tsx
import { SmartInput, Editor } from '@smart-input/core';
import { DropContentHandler } from '@smart-input/dropcontent';
import '@smart-input/core/style.css';

function EditorWithDropContent() {
  const handleDropSuccess = (files: File[]) => {
    console.log('Files dropped:', files);
  };

  const handleDropError = (error: Error) => {
    console.error('Drop error:', error);
  };

  return (
    <SmartInput>
      <DropContentHandler
        acceptedTypes={['image/*', 'application/pdf']}
        onDropSuccess={handleDropSuccess}
        onDropError={handleDropError}
      >
        <Editor 
          placeholder="Type or drag files here..."
          imageWidth="300px"
          imageHeight="200px"
        />
      </DropContentHandler>
    </SmartInput>
  );
}
```

### Adding Commit/Submit Functionality

Create a chat-like input with submission and history:

```tsx
import { SmartInput, Editor, CommitItem } from '@smart-input/core';
import { CommitNotifier } from '@smart-input/commitnotifier';
import '@smart-input/core/style.css';

function ChatInput() {
  const handleCommit = (items: CommitItem[]) => {
    console.log('Sending message:', items);
    
    // Extract text from items
    const message = items
      .map(item => item.text || item.name || '')
      .join('');
    
    // Send to server
    sendMessage(message, items);
  };

  const sendMessage = (text: string, items: CommitItem[]) => {
    // Your API call here
    fetch('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ text, items })
    });
  };

  return (
    <div className="chat-container">
      <SmartInput>
        <CommitNotifier
          onCommit={handleCommit}
          commitKeyCombination={{ key: 'Enter' }}
          enableHistory={true}
          maxHistory={50}
        />
        <Editor placeholder="Type a message..." />
      </SmartInput>
    </div>
  );
}
```

**History Navigation**: When `enableHistory={true}`, users can navigate through previously submitted messages:
- Press **Arrow Up** (when cursor is on first line) to cycle back through history, starting with the most recent entry
- Press **Arrow Down** (when cursor is on last line) to cycle forward to newer entries, returning to your current input
- Up arrow stops at the oldest entry; down arrow stops at the current input
- This works just like terminal history in bash, zsh, or PowerShell
```

### Complete Example: All Features Combined

```tsx
import { SmartInput, Editor, CommitItem } from '@smart-input/core';
import { TypeaheadLookup } from '@smart-input/typeahead';
import { DropContentHandler } from '@smart-input/dropcontent';
import { CommitNotifier } from '@smart-input/commitnotifier';
import '@smart-input/core/style.css';
import { useRef } from 'react';

function RichChatInput() {
  const apiRef = useRef(null);

  const userLookups = [
    {
      category: 'Team',
      lookup: async (text: string) => {
        const response = await fetch(`/api/users?q=${text}`);
        return response.json();
      },
      style: { color: '#0066cc', fontWeight: 'bold' }
    }
  ];

  const handleCommit = (items: CommitItem[]) => {
    console.log('Sending:', items);
    // Send message
  };

  const handleFileDrop = (files: File[]) => {
    console.log('Files attached:', files);
  };

  return (
    <div className="rich-chat-input">
      <SmartInput ref={apiRef}>
        <CommitNotifier
          onCommit={handleCommit}
          commitKeyCombination={{ key: 'Enter' }}
          enableHistory={true}
        />
        <TypeaheadLookup
          lookups={userLookups}
          minSearchLength={2}
          autoHighlight={true}
        />
        <DropContentHandler
          acceptedTypes={['image/*', 'application/pdf']}
          onDropSuccess={handleFileDrop}
        >
          <Editor 
            placeholder="Type @ to mention, or drag files..."
            imageWidth="200px"
            imageHeight="150px"
          />
        </DropContentHandler>
      </SmartInput>
    </div>
  );
}
```

---

## Common Use Cases

### Use Case 1: Search Bar with Suggestions

```tsx
import { SmartInput, Editor } from '@smart-input/core';
import { TypeaheadLookup } from '@smart-input/typeahead';
import '@smart-input/core/style.css';

function SearchWithSuggestions() {
  const searchLookups = [
    {
      category: 'Recent',
      lookup: async (text: string) => {
        const recent = getRecentSearches();
        return recent.filter(s => s.includes(text));
      },
      style: { color: '#666' }
    },
    {
      category: 'Suggestions',
      lookup: async (text: string) => {
        const response = await fetch(`/api/search/suggest?q=${text}`);
        return response.json();
      },
      style: { color: '#0066cc' }
    }
  ];

  return (
    <SmartInput>
      <TypeaheadLookup
        lookups={searchLookups}
        minSearchLength={1}
        autoHighlight={true}
        showCategory={true}
      />
      <Editor 
        placeholder="Search..."
        className="search-bar"
      />
    </SmartInput>
  );
}
```

### Use Case 2: Comment System with Mentions

```tsx
import { SmartInput, Editor, CommitItem } from '@smart-input/core';
import { TypeaheadLookup } from '@smart-input/typeahead';
import { CommitNotifier } from '@smart-input/commitnotifier';
import '@smart-input/core/style.css';

function CommentBox({ onSubmit }: { onSubmit: (items: CommitItem[]) => void }) {
  const mentionLookups = [
    {
      category: 'Users',
      lookup: async (text: string) => {
        const users = await fetchUsers(text);
        return users.map(u => ({
          id: u.id,
          text: `@${u.username}`,
          score: u.relevance
        }));
      },
      style: { 
        color: '#0066cc',
        backgroundColor: '#e6f2ff',
        padding: '2px 4px',
        borderRadius: '3px'
      }
    }
  ];

  return (
    <SmartInput>
      <CommitNotifier
        onCommit={onSubmit}
        commitKeyCombination={{ key: 'Enter', ctrlKey: true }}
      />
      <TypeaheadLookup
        lookups={mentionLookups}
        minSearchLength={1}
        autoHighlight={false}
      />
      <Editor 
        enableLineBreaks={true}
        placeholder="Write a comment... (@mention users, Ctrl+Enter to submit)"
      />
    </SmartInput>
  );
}
```

### Use Case 3: Email Composer with Attachments

```tsx
import { SmartInput, Editor, CommitItem, SmartInputApi } from '@smart-input/core';
import { DropContentHandler } from '@smart-input/dropcontent';
import '@smart-input/core/style.css';
import { useRef, useState } from 'react';

function EmailComposer() {
  const apiRef = useRef<SmartInputApi>(null);
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleFileDrop = (files: File[]) => {
    setAttachments(prev => [...prev, ...files]);
  };

  const handleSend = () => {
    const content = apiRef.current?.get();
    sendEmail(content, attachments);
  };

  const sendEmail = (content: CommitItem[], files: File[]) => {
    const formData = new FormData();
    formData.append('content', JSON.stringify(content));
    files.forEach(file => formData.append('attachments', file));
    
    fetch('/api/email/send', {
      method: 'POST',
      body: formData
    });
  };

  return (
    <div className="email-composer">
      <SmartInput ref={apiRef}>
        <DropContentHandler
          acceptedTypes={['image/*', 'application/*', '.doc', '.docx']}
          onDropSuccess={handleFileDrop}
        >
          <Editor 
            enableLineBreaks={true}
            placeholder="Compose your email..."
            documentWidth="100px"
            documentHeight="100px"
          />
        </DropContentHandler>
      </SmartInput>
      
      <div className="attachments">
        {attachments.map((file, i) => (
          <div key={i}>{file.name}</div>
        ))}
      </div>
      
      <button onClick={handleSend}>Send</button>
    </div>
  );
}
```

### Use Case 4: Terminal-Style Input

```tsx
import { SmartInput, Editor, CommitItem } from '@smart-input/core';
import { CommitNotifier } from '@smart-input/commitnotifier';
import '@smart-input/core/style.css';
import { useState } from 'react';

function Terminal() {
  const [history, setHistory] = useState<string[]>([]);

  const handleCommand = (items: CommitItem[]) => {
    const command = items
      .map(item => item.text || '')
      .join('');
    
    setHistory(prev => [...prev, `$ ${command}`]);
    
    // Execute command
    executeCommand(command).then(output => {
      setHistory(prev => [...prev, output]);
    });
  };

  return (
    <div className="terminal">
      <div className="output">
        {history.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
      
      <div className="input-line">
        <span>$ </span>
        <SmartInput>
          <CommitNotifier
            onCommit={handleCommand}
            commitKeyCombination={{ key: 'Enter' }}
            enableHistory={true}
            maxHistory={100}
            historyStorageKey="terminal-history"
          />
          <Editor placeholder="Enter command..." />
        </SmartInput>
      </div>
    </div>
  );
}
```

**Terminal History**: Navigate through command history with arrow keys (terminal-style behavior):
- **Arrow Up**: Recall previous commands, starting with the most recent
- **Arrow Down**: Move forward through history back to current input
- History is persisted in localStorage with the key `"terminal-history"`

---

## Styling and Customization

### Custom Styles

Apply custom CSS classes to components:

```tsx
import { SmartInput, Editor } from '@smart-input/core';
import '@smart-input/core/style.css';
import './custom-styles.css';

function StyledEditor() {
  return (
    <SmartInput>
      <Editor 
        className="my-custom-editor"
        placeholder="Styled editor..."
      />
    </SmartInput>
  );
}
```

```css
/* custom-styles.css */
.my-custom-editor {
  border: 2px solid #0066cc;
  border-radius: 8px;
  padding: 12px;
  font-family: 'Monaco', monospace;
  font-size: 14px;
  background: #f5f5f5;
}

.my-custom-editor:focus {
  outline: none;
  border-color: #0052a3;
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
}
```

### Styling Blocks

Customize how different block types appear:

```tsx
// Custom styled blocks
const customStyle = {
  color: '#cc0000',
  backgroundColor: '#ffe6e6',
  padding: '4px 8px',
  borderRadius: '4px',
  fontWeight: 'bold',
  border: '1px solid #cc0000'
};

apiRef.current?.apply(api => {
  api.styleText('important', 'styled-1', customStyle);
});
```

### Theming

Create a theme for your editor:

```css
/* dark-theme.css */
:root {
  --editor-bg: #1e1e1e;
  --editor-text: #d4d4d4;
  --editor-placeholder: #6a6a6a;
  --editor-selection: #264f78;
  --editor-border: #3e3e3e;
}

.dark-theme .editor-container {
  background-color: var(--editor-bg);
  color: var(--editor-text);
  border-color: var(--editor-border);
}

.dark-theme .editor-container::placeholder {
  color: var(--editor-placeholder);
}
```

---

## State Management

### Accessing State

Use callbacks to monitor state changes:

```tsx
import { SmartInput, Editor, Block } from '@smart-input/core';
import { useState, useEffect } from 'react';

function StatefulEditor() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [hasContent, setHasContent] = useState(false);

  useEffect(() => {
    setHasContent(blocks.length > 0);
  }, [blocks]);

  return (
    <div>
      <SmartInput 
        onBlocksChange={(newBlocks) => setBlocks(newBlocks)}
      >
        <Editor placeholder="Type something..." />
      </SmartInput>
      
      <button disabled={!hasContent}>
        Submit
      </button>
    </div>
  );
}
```

### Using the API for State Control

Programmatically control the editor:

```tsx
import { SmartInput, Editor, SmartInputApi } from '@smart-input/core';
import { useRef } from 'react';

function ControlledEditor() {
  const apiRef = useRef<SmartInputApi>(null);

  const handleClear = () => {
    apiRef.current?.apply(api => api.clear());
  };

  const handleInsertTemplate = () => {
    apiRef.current?.apply(api => {
      api.insert('Dear Sir/Madam,\n\n', 0);
      api.insert('\n\nBest regards,', api.getBlocks().length);
    });
  };

  return (
    <div>
      <div>
        <button onClick={handleClear}>Clear</button>
        <button onClick={handleInsertTemplate}>Insert Template</button>
      </div>
      
      <SmartInput ref={apiRef}>
        <Editor enableLineBreaks={true} />
      </SmartInput>
    </div>
  );
}
```

---

## Troubleshooting

### Common Issues

#### Issue: Styles not applied
**Solution**: Make sure you import the CSS file:
```tsx
import '@smart-input/core/style.css';
```

#### Issue: TypeaheadLookup not showing suggestions
**Solution**: Check these common causes:
- `minSearchLength` might be too high
- Lookup function might not be returning results
- Debounce delay might be too long
- Check console for errors in lookup function

#### Issue: DropContentHandler not accepting files
**Solution**: Verify `acceptedTypes` includes the file type:
```tsx
<DropContentHandler
  acceptedTypes={['image/*', 'application/pdf', '.doc', '.docx']}
>
```

#### Issue: CommitNotifier not triggering
**Solution**: Check that:
- Key combination is correct
- Editor is focused when pressing the key
- No other component is intercepting the event

#### Issue: API methods not working
**Solution**: Ensure you're:
- Using `apply` to wrap all operations
- Calling after component is mounted
- Checking ref.current is not null

### Performance Tips

1. **Debounce expensive operations**:
```tsx
<TypeaheadLookup
  debounce={300}  // Increase for slower APIs
  lookups={lookups}
/>
```

2. **Limit history size**:
```tsx
<CommitNotifier
  maxHistory={50}  // Reduce if memory is a concern
  enableHistory={true}
/>
```

3. **Optimize lookup functions**:
```tsx
const lookups = [{
  category: 'Users',
  lookup: async (text: string) => {
    // Cancel previous requests
    controller?.abort();
    controller = new AbortController();
    
    // Use AbortController for cancellation
    const response = await fetch(`/api/users?q=${text}`, {
      signal: controller.signal
    });
    return response.json();
  }
}];
```

### Debugging

Enable debug logging:

```tsx
import { SmartInput, Editor } from '@smart-input/core';
import { useEffect } from 'react';

function DebugEditor() {
  const handleBlocksChange = (blocks, position, rect) => {
    console.log('Blocks:', blocks);
    console.log('Position:', position);
    console.log('Cursor rect:', rect);
  };

  return (
    <SmartInput 
      onBlocksChange={handleBlocksChange}
      onCursorPositionChange={(pos, rect, blocks) => {
        console.log('Cursor moved to:', pos);
      }}
    >
      <Editor placeholder="Debug mode..." />
    </SmartInput>
  );
}
```

---

## Next Steps

- Read the [Component Reference](./COMPONENTS.md) for detailed component documentation
- Check the [API Reference](./API.md) for programmatic control
- See [Extension Development Guide](./EXTENSION_DEVELOPMENT.md) for creating custom extensions
- Review [Test Documentation](./TESTS.md) to understand the test suite

---

## Support

For issues, questions, or contributions:
- GitHub Issues: [Report a bug or request a feature]
- Documentation: [Full documentation]
- Examples: See the `packages/test/src` directory for working examples
