import { useState, useRef } from 'react';
import {
  SmartInput,
  SmartInputApi,
  Editor,
  ErrorBoundary,
  BlockType,
  Block,
} from '@smart-input/core';
import { TypeaheadLookup } from '@smart-input/typeahead';
import {
  ReactBlocksManager,
  ReactBlockComponent,
} from '@smart-input/reactblocks';
import UserMention from './UserMention';
import TagBadge from './TagBadge';
import '@smart-input/core/style.css';
import '@smart-input/typeahead/style.css';
import './App.css';

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  role: string;
}

interface Topic {
  id: string;
  name: string;
  color: string;
  count: number;
}

// Sample data
const users: User[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    username: 'sarach',
    avatar: '👩‍💻',
    role: 'Engineering Lead',
  },
  {
    id: '2',
    name: 'Mike Johnson',
    username: 'mikej',
    avatar: '👨‍💼',
    role: 'Product Manager',
  },
  {
    id: '3',
    name: 'Alex Rivera',
    username: 'alexr',
    avatar: '👨‍🎨',
    role: 'Designer',
  },
  {
    id: '4',
    name: 'Emily Watson',
    username: 'emilyw',
    avatar: '👩‍🔬',
    role: 'Data Scientist',
  },
  {
    id: '5',
    name: 'David Kim',
    username: 'davidk',
    avatar: '👨‍🚀',
    role: 'DevOps Engineer',
  },
];

const topics: Topic[] = [
  { id: '1', name: 'announcement', color: '#2196F3', count: 42 },
  { id: '2', name: 'bug', color: '#f44336', count: 18 },
  { id: '3', name: 'feature', color: '#4CAF50', count: 35 },
  { id: '4', name: 'urgent', color: '#FF9800', count: 7 },
  { id: '5', name: 'question', color: '#9C27B0', count: 23 },
  { id: '6', name: 'discussion', color: '#00BCD4', count: 56 },
];

function App() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [reactBlocks, setReactBlocks] = useState<ReactBlockComponent[]>([]);
  const apiRef = useRef<SmartInputApi>(null);
  const blockCounterRef = useRef(0);

  // Lookup function for users - searches and returns matching users
  const userLookup = async (query: string) => {
    // Only trigger on @ prefix
    if (!query.startsWith('@')) {
      return [];
    }

    // Remove @ and search
    const searchQuery = query.slice(1);
    const lowerQuery = searchQuery.toLowerCase();

    return users
      .filter(
        (user) =>
          user.name.toLowerCase().includes(lowerQuery) ||
          user.username.toLowerCase().includes(lowerQuery),
      )
      .map((user) => ({
        text: `@${user.username}`,
        score: user.name.toLowerCase().startsWith(lowerQuery) ? 0 : 1,
      }));
  };

  // Lookup function for topics - searches and returns matching topics
  const topicLookup = async (query: string) => {
    // Only trigger on # prefix
    if (!query.startsWith('#')) {
      return [];
    }

    // Remove # and search
    const searchQuery = query.slice(1);
    const lowerQuery = searchQuery.toLowerCase();

    return topics
      .filter((topic) => topic.name.toLowerCase().includes(lowerQuery))
      .map((topic) => ({
        text: `#${topic.name}`,
        score: topic.name.toLowerCase().startsWith(lowerQuery) ? 0 : 1,
      }));
  };

  // Handle user/topic selection
  const handleSelect = (item: any) => {
    // Extract the category and text to determine what was selected
    if (item.category === 'user') {
      const username = item.text.replace('@', '');
      const user = users.find((u) => u.username === username);
      if (!user) return;

      const blockId = `mention-${Date.now()}-${blockCounterRef.current++}`;
      const newBlocks: Block[] = [
        ...blocks,
        {
          id: blockId,
          type: BlockType.Styled,
          text: '',
          uneditable: true,
          undeletable: true,
        },
      ];
      setBlocks(newBlocks);
      apiRef.current?.apply((api) => {
        api.setBlocks(newBlocks);
      });
      // Add React component for this mention
      setReactBlocks((prev) => [
        ...prev,
        {
          blockId,
          component: (
            <UserMention
              name={user.name}
              username={user.username}
              avatar={user.avatar}
              role={user.role}
            />
          ),
        },
      ]);
    } else if (item.category === 'topic') {
      const topicName = item.text.replace('#', '');
      const topic = topics.find((t) => t.name === topicName);
      if (!topic) return;

      const blockId = `tag-${Date.now()}-${blockCounterRef.current++}`;

      const newBlocks: Block[] = [
        ...blocks,
        {
          id: blockId,
          type: BlockType.Styled,
          text: '',
          uneditable: true,
          undeletable: true,
        },
      ];
      setBlocks(newBlocks);
      apiRef.current?.apply((api) => {
        api.setBlocks(newBlocks);
      });
      setReactBlocks((prev) => [
        ...prev,
        {
          blockId,
          component: <TagBadge name={topic.name} color={topic.color} />,
        },
      ]);
    }
    setTimeout(() => {
      apiRef.current?.setCursorPosition(apiRef.current.getTextLength());
    }, 0);
  };

  const handleClear = () => {
    setReactBlocks([]);
    if (apiRef.current) {
      // Clear the editor content - implementation may vary
      // For now, we'll rely on the user to manually clear
    }
    apiRef.current?.focus();
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>🏷️ Mention & Tagging System</h1>
        <p className="subtitle">
          Type <strong>@</strong> to mention users or <strong>#</strong> to add
          topic tags
        </p>
      </div>

      <div className="demo-section">
        <div className="instructions">
          <h3>Try it out:</h3>
          <ul>
            <li>
              Type <code>@</code> and start typing a name to mention someone
            </li>
            <li>
              Type <code>#</code> and start typing to add a topic tag
            </li>
            <li>Use arrow keys to navigate suggestions</li>
            <li>Press Enter or click to select</li>
            <li>
              Notice the interactive React components in the mentions/tags
            </li>
          </ul>
        </div>

        <div className="editor-wrapper">
          <ErrorBoundary
            errorMessage="The editor encountered an error"
            onError={({ error }) => {
              console.error('Editor error:', error);
            }}
          >
            <SmartInput ref={apiRef}>
              <TypeaheadLookup
                lookups={[
                  {
                    category: 'user',
                    func: userLookup,
                  },
                  {
                    category: 'topic',
                    func: topicLookup,
                  },
                ]}
                wordsToCheck={1}
                minSearchLength={1}
                autoHighlight={true}
                onSelect={handleSelect}
                position="below"
              />
              <Editor placeholder="What's on your mind? Type @ or # to get started..." />
              <ReactBlocksManager reactBlocks={reactBlocks} />
            </SmartInput>
          </ErrorBoundary>

          <div className="editor-actions">
            <button onClick={handleClear} className="clear-button">
              Clear
            </button>
          </div>
        </div>

        <div className="feature-highlights">
          <div className="feature">
            <h4>🔍 Smart Autocomplete</h4>
            <p>Typeahead lookup with fuzzy search across names and usernames</p>
          </div>
          <div className="feature">
            <h4>⚛️ React Components</h4>
            <p>
              Interactive mentions and tags rendered as React components using
              portals
            </p>
          </div>
          <div className="feature">
            <h4>⌨️ Keyboard Friendly</h4>
            <p>Full keyboard navigation support for accessibility</p>
          </div>
        </div>
      </div>

      <div className="data-display">
        <div className="data-column">
          <h3>Available Users</h3>
          <div className="user-list">
            {users.map((user) => (
              <div key={user.id} className="user-card">
                <span className="user-avatar">{user.avatar}</span>
                <div>
                  <div className="user-name">{user.name}</div>
                  <div className="user-username">@{user.username}</div>
                  <div className="user-role">{user.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="data-column">
          <h3>Available Topics</h3>
          <div className="topic-list">
            {topics.map((topic) => (
              <div key={topic.id} className="topic-card">
                <span className="topic-hash" style={{ color: topic.color }}>
                  #
                </span>
                <div>
                  <div className="topic-name">{topic.name}</div>
                  <div className="topic-count">{topic.count} posts</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
