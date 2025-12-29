# Chat Input Example

A simple chat interface demonstrating Open Input with message history navigation.

## Features

- Message input with Enter to send
- History navigation with Up/Down arrows
- Message list display
- Timestamp for each message
- Clean, modern UI

## Running

```bash
pnpm install
pnpm dev
```

## Implementation Details

This example demonstrates:

- Using `SmartInput` component
- Implementing `CommitNotifier` for message submission
- Managing history state
- Extracting and displaying text content
- Basic styling with CSS modules

## Code Highlights

```typescript
import { SmartInput } from '@smart-input/core';
import { CommitNotifier } from '@smart-input/commitnotifier';

function ChatInput() {
  const [messages, setMessages] = useState<Message[]>([]);
  
  const handleCommit = (api, blocks) => {
    const text = extractText(blocks);
    setMessages([...messages, { text, timestamp: Date.now() }]);
    api.clear();
  };
  
  return (
    <SmartInput>
      <CommitNotifier onCommit={handleCommit} />
    </SmartInput>
  );
}
```

See full implementation in [src/App.tsx](src/App.tsx).
