import { useState, useRef } from 'react';
import {
  SmartInput,
  SmartInputApi,
  CommitItem,
  Editor,
  ErrorBoundary,
} from '@smart-input/core';
import { CommitNotifier } from '@smart-input/commitnotifier';
import { DropContentHandler } from '@smart-input/dropcontent';
import {
  ReactBlocksManager,
  ReactBlockComponent,
} from '@smart-input/reactblocks';
import Message from './Message';

interface MessageData {
  items: CommitItem[];
  timestamp: number;
}

function ChatInputApp() {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [reactBlocks, setReactBlocks] = useState<ReactBlockComponent[]>([]);
  const apiRef = useRef<SmartInputApi>(null);

  const handleCommit = (items: CommitItem[]) => {
    const api = apiRef.current;
    if (!api) return false;

    // Check if there's any content (text or blocks)
    const hasContent = items.some((item) => {
      if (typeof item === 'string') {
        return item.trim().length > 0;
      }
      return true; // Any block is considered content
    });

    if (hasContent) {
      setMessages((prev) => [
        ...prev,
        {
          items,
          timestamp: Date.now(),
        },
      ]);

      // Clear react blocks
      setReactBlocks([]);

      // Focus the editor after clearing
      setTimeout(() => {
        apiRef.current?.focus();
      }, 10);
      return true; // Clear editor
    }
    return false;
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>Chat Input Example</h1>
        <p>
          Type a message, and/or drag images or documents. Press Enter to send.
        </p>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            No messages yet. Start typing or drag files!
          </div>
        ) : (
          messages.map((msg, idx) => (
            <Message key={idx} items={msg.items} timestamp={msg.timestamp} />
          ))
        )}
      </div>

      <div className="input-container">
        <ErrorBoundary
          errorMessage="The chat editor encountered an error"
          onError={({ error }) => {
            console.error('Chat editor error:', error);
            // In production, you might want to log to an error tracking service
          }}
        >
          <SmartInput ref={apiRef}>
            <DropContentHandler>
              <Editor />
            </DropContentHandler>
            <ReactBlocksManager reactBlocks={reactBlocks} />
            <CommitNotifier
              onCommit={handleCommit}
              enableHistory
              storeDocsAndImagesToHistory
              historyStorageKey="chat-input-history"
              clearAfterCommit
            />
          </SmartInput>
        </ErrorBoundary>
      </div>
    </div>
  );
}

export default ChatInputApp;
