import type { Story } from '@ladle/react';
import { SmartInput, Block, CommitItem, Editor } from '@smart-input/core';
import { CommitNotifier } from './CommitNotifier';
import { useState } from 'react';

export const BasicCommitNotifier: Story = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [commitLog, setCommitLog] = useState<string[]>([]);

  const handleCommit = (items: CommitItem[]) => {
    const text = items
      .map((item) => (typeof item === 'string' ? item : ''))
      .join('');
    setCommitLog((prev) => [
      ...prev,
      `Committed at ${new Date().toLocaleTimeString()}: "${text}"`,
    ]);
    return false;
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <p style={{ marginBottom: '10px', color: '#666' }}>
        Press Ctrl+Enter (or Cmd+Enter on Mac) to commit
      </p>
      <SmartInput blocks={blocks} onBlocksChange={setBlocks}>
        <Editor placeholder="Type something and press Ctrl+Enter..." />
        <CommitNotifier onCommit={handleCommit} />
      </SmartInput>

      <div
        style={{
          marginTop: '20px',
          padding: '10px',
          background: '#f5f5f5',
          borderRadius: '4px',
        }}
      >
        <h4 style={{ margin: '0 0 10px 0' }}>Commit Log:</h4>
        {commitLog.length === 0 ? (
          <p style={{ margin: 0, color: '#999' }}>No commits yet</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {commitLog.map((log, i) => (
              <li key={i} style={{ marginBottom: '5px' }}>
                {log}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

BasicCommitNotifier.meta = {
  description: 'Basic commit notifier with keyboard shortcut',
};

export const WithClearOnCommit: Story = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [messages, setMessages] = useState<string[]>([]);

  const handleCommit = (items: CommitItem[]) => {
    const text = items
      .map((item) => (typeof item === 'string' ? item : ''))
      .join('');
    if (text.trim()) {
      setMessages((prev) => [...prev, text]);
      return true; // Clear the editor
    }
    return false;
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <p style={{ marginBottom: '10px', color: '#666' }}>
        Type a message and press Ctrl+Enter to send (editor clears after commit)
      </p>
      <SmartInput blocks={blocks} onBlocksChange={setBlocks}>
        <Editor placeholder="Type a message..." />
        <CommitNotifier onCommit={handleCommit} />
      </SmartInput>

      <div style={{ marginTop: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0' }}>Messages:</h4>
        <div
          style={{
            maxHeight: '200px',
            overflow: 'auto',
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '10px',
          }}
        >
          {messages.length === 0 ? (
            <p style={{ margin: 0, color: '#999' }}>No messages yet</p>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  marginBottom: '8px',
                  padding: '8px',
                  background: '#e3f2fd',
                  borderRadius: '4px',
                  borderLeft: '3px solid #2196f3',
                }}
              >
                {msg}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

WithClearOnCommit.meta = {
  description: 'Commit notifier with chat-like interface',
};

export const MultiLineCommit: Story = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [commits, setCommits] = useState<{ time: string; content: string }[]>(
    [],
  );

  const handleCommit = (items: CommitItem[]) => {
    const text = items
      .map((item) => (typeof item === 'string' ? item : ''))
      .join('');
    if (text.trim()) {
      setCommits((prev) => [
        ...prev,
        {
          time: new Date().toLocaleTimeString(),
          content: text,
        },
      ]);
      return true;
    }
    return false;
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <p style={{ marginBottom: '10px', color: '#666' }}>
        Use Shift+Enter for line breaks, Ctrl+Enter to commit
      </p>
      <SmartInput blocks={blocks} onBlocksChange={setBlocks}>
        <Editor placeholder="Type a multi-line message..." enableLineBreaks />
        <CommitNotifier onCommit={handleCommit} />
      </SmartInput>

      <div style={{ marginTop: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0' }}>Commits:</h4>
        <div style={{ maxHeight: '300px', overflow: 'auto' }}>
          {commits.length === 0 ? (
            <p style={{ color: '#999' }}>No commits yet</p>
          ) : (
            commits.map((commit, i) => (
              <div
                key={i}
                style={{
                  marginBottom: '12px',
                  padding: '12px',
                  background: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    color: '#999',
                    marginBottom: '4px',
                  }}
                >
                  {commit.time}
                </div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{commit.content}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

MultiLineCommit.meta = {
  description: 'Commit notifier with multi-line support',
};
