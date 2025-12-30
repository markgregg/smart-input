# @smart-input/commitnotifier

A commit/submit functionality component for the Open Input editor with message history navigation. Perfect for chat interfaces, comment systems, and any application requiring submission workflows.

## Features

- 💬 **Chat-like Submission** - Press Enter to commit content
- 📜 **History Navigation** - Use arrow keys to navigate through previous submissions
- 💾 **Persistent Storage** - Optional localStorage integration for history persistence
- ⌨️ **Keyboard Shortcuts** - Intuitive keyboard controls
- 🔄 **State Management** - Seamless integration with Open Input state
- 🎯 **Customizable** - Flexible callbacks and configuration options

## Installation

```bash
npm install @smart-input/commitnotifier @smart-input/core zustand
# or
pnpm add @smart-input/commitnotifier @smart-input/core zustand
# or
yarn add @smart-input/commitnotifier @smart-input/core zustand
```

## Quick Start

### Basic Usage

```tsx
import { SmartInput, Editor } from '@smart-input/core';
import { CommitNotifier } from '@smart-input/commitnotifier';
import '@smart-input/core/style.css';

function ChatApp() {
  const [messages, setMessages] = useState([]);

  const handleCommit = (blocks) => {
    const messageText = blocks
      .map(block => block.text || block.name || '')
      .join('');
    
    setMessages([...messages, { 
      id: Date.now(), 
      text: messageText,
      timestamp: new Date()
    }]);
  };

  return (
    <div>
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id}>{msg.text}</div>
        ))}
      </div>

      <SmartInput>
        <CommitNotifier onCommit={handleCommit} />
        <Editor placeholder="Type a message... (Press Enter to send)" />
      </SmartInput>
    </div>
  );
}
```

## Props

### CommitNotifier

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onCommit` | (blocks: Block[]) => void | Yes | Callback when content is submitted |
| `storageKey` | string | No | LocalStorage key for persisting history |
| `maxHistorySize` | number | No | Maximum history items to store (default: 50) |
| `clearOnCommit` | boolean | No | Clear editor after commit (default: true) |
| `commitKeys` | string[] | No | Keys that trigger commit (default: ['Enter']) |
| `preventCommitKeys` | string[] | No | Modifier keys that prevent commit (default: ['Shift']) |

## Examples

### Simple Chat

```tsx
function SimpleChat() {
  const handleCommit = (blocks) => {
    console.log('Message sent:', blocks);
    // Send to server, update UI, etc.
  };

  return (
    <SmartInput>
      <CommitNotifier onCommit={handleCommit} />
      <Editor placeholder="Type a message..." />
    </SmartInput>
  );
}
```

### With Persistent History

```tsx
function PersistentChat() {
  const handleCommit = (blocks) => {
    const message = blocksToText(blocks);
    sendToServer(message);
  };

  return (
    <SmartInput>
      <CommitNotifier 
        onCommit={handleCommit}
        storageKey="chat-history"
        maxHistorySize={100}
      />
      <Editor placeholder="Type a message..." />
    </SmartInput>
  );
}
```

### Custom Commit Keys

```tsx
// Commit with Ctrl+Enter instead of Enter
<CommitNotifier 
  onCommit={handleCommit}
  commitKeys={['Enter']}
  preventCommitKeys={[]} // Allow Shift+Enter for new lines
/>

// Or commit with Ctrl+Enter
<CommitNotifier 
  onCommit={handleCommit}
  commitKeys={['Control+Enter', 'Meta+Enter']}
/>
```

### Don't Clear on Commit

```tsx
// Keep content after submission
<CommitNotifier 
  onCommit={handleCommit}
  clearOnCommit={false}
/>
```

### Complete Chat Interface

```tsx
import { SmartInput, Editor, Block } from '@smart-input/core';
import { CommitNotifier } from '@smart-input/commitnotifier';
import { useState } from 'react';

interface Message {
  id: string;
  text: string;
  blocks: Block[];
  timestamp: Date;
  user: string;
}

function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleCommit = (blocks: Block[]) => {
    if (blocks.length === 0 || blocks.every(b => !b.text)) {
      return; // Don't send empty messages
    }

    const newMessage: Message = {
      id: crypto.randomUUID(),
      text: blocks.map(b => b.text || '').join(''),
      blocks,
      timestamp: new Date(),
      user: 'current-user'
    };

    setMessages([...messages, newMessage]);
    
    // Optional: Send to server
    sendMessage(newMessage);
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map(message => (
          <div key={message.id} className="message">
            <div className="message-user">{message.user}</div>
            <div className="message-text">{message.text}</div>
            <div className="message-time">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <SmartInput>
          <CommitNotifier 
            onCommit={handleCommit}
            storageKey="my-chat-history"
            maxHistorySize={50}
          />
          <Editor 
            placeholder="Type a message... (Press Enter to send, Shift+Enter for new line)"
          />
        </SmartInput>
      </div>
    </div>
  );
}
```

## History Navigation

The CommitNotifier automatically stores submission history and allows navigation:

- **`Arrow Up`** - Navigate to previous submission
- **`Arrow Down`** - Navigate to next submission (or clear to start fresh)

When you navigate through history:
1. Current content is saved as a draft
2. Historical content is loaded into the editor
3. Pressing Arrow Down past the newest item restores your draft

### Using the Storage Hook

For advanced history management, use the `useBlockStorage` hook:

```tsx
import { useBlockStorage } from '@smart-input/commitnotifier';

function MyComponent() {
  const { 
    blocks,
    setBlocks,
    navigateUp,
    navigateDown,
    clear,
    currentIndex,
    historyLength
  } = useBlockStorage('my-storage-key', { maxSize: 100 });

  return (
    <div>
      <div>History: {currentIndex + 1} / {historyLength}</div>
      <button onClick={navigateUp}>Previous</button>
      <button onClick={navigateDown}>Next</button>
      <button onClick={clear}>Clear History</button>
    </div>
  );
}
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Submit/commit content (default) |
| `Shift + Enter` | Insert new line (prevents commit) |
| `Arrow Up` | Navigate to previous history item |
| `Arrow Down` | Navigate to next history item |

## Storage Format

When using `storageKey`, history is saved to localStorage in this format:

```typescript
interface StoredHistory {
  items: Block[][];
  currentIndex: number;
  maxSize: number;
}
```

You can access it directly:

```typescript
const history = JSON.parse(
  localStorage.getItem('my-storage-key') || '{}'
);
console.log('History items:', history.items);
```

## TypeScript Support

Full TypeScript definitions included:

```typescript
import type { 
  CommitNotifierProps,
  BlockStorage,
  StorageOptions
} from '@smart-input/commitnotifier';

const props: CommitNotifierProps = {
  onCommit: (blocks) => console.log(blocks),
  storageKey: 'chat',
  maxHistorySize: 50,
  clearOnCommit: true
};
```

## Integration Examples

### With Message Formatting

```tsx
import { Block, BlockType } from '@smart-input/core';

function formatBlocks(blocks: Block[]): string {
  return blocks.map(block => {
    if (block.type === BlockType.Text) {
      return block.text;
    } else if (block.type === BlockType.Styled) {
      return `**${block.text}**`; // Markdown-style bold
    } else if (block.type === BlockType.Image) {
      return `![image](${block.url})`;
    }
    return '';
  }).join('');
}

<CommitNotifier 
  onCommit={(blocks) => {
    const formatted = formatBlocks(blocks);
    sendMessage(formatted);
  }}
/>
```

### With Validation

```tsx
<CommitNotifier 
  onCommit={(blocks) => {
    const text = blocks.map(b => b.text || '').join('').trim();
    
    if (text.length === 0) {
      alert('Message cannot be empty');
      return;
    }
    
    if (text.length > 500) {
      alert('Message too long (max 500 characters)');
      return;
    }
    
    sendMessage(text);
  }}
/>
```

### With Loading State

```tsx
function ChatWithLoading() {
  const [isSending, setIsSending] = useState(false);

  const handleCommit = async (blocks: Block[]) => {
    setIsSending(true);
    try {
      await sendMessageToServer(blocks);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SmartInput>
      <CommitNotifier onCommit={handleCommit} />
      <Editor 
        placeholder={isSending ? 'Sending...' : 'Type a message...'}
        readOnly={isSending}
      />
    </SmartInput>
  );
}
```

## Best Practices

1. **Always validate content** - Check for empty messages before processing
2. **Provide feedback** - Show loading states or confirmation messages
3. **Limit history size** - Use `maxHistorySize` to prevent memory issues
4. **Clear sensitive data** - Don't persist sensitive messages to localStorage
5. **Handle errors** - Wrap async operations in try-catch blocks

## Documentation

For more information, see:

- **[User Guide](../../docs/USER_GUIDE.md)** - Complete usage guide
- **[Component Reference](../../docs/COMPONENTS.md)** - Component details
- **[Examples](../../examples/smart-input-examples)** - Working chat example (Chat Input tab)

## Requirements

- React 18.0.0 or higher
- @smart-input/core 1.0.0 or higher
- zustand 5.0.0 or higher

## License

MIT © Mark Gregg
