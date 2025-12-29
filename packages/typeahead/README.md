# @smart-input/typeahead

A typeahead/autocomplete lookup component for the Open Input editor. Provides intelligent suggestions as users type, with customizable data sources and filtering.

## Features

- 🔍 **Smart Suggestions** - Show contextual suggestions as users type
- ⌨️ **Keyboard Navigation** - Navigate suggestions with arrow keys and select with Enter
- 🎯 **Customizable Triggers** - Define custom trigger characters (@, #, /, etc.)
- 📊 **Flexible Data Sources** - Sync or async data fetching
- 🎨 **Custom Rendering** - Full control over suggestion appearance
- 🔄 **Real-time Filtering** - Client-side or server-side filtering
- ♿ **Accessible** - ARIA-compliant with screen reader support

## Installation

```bash
npm install @smart-input/typeahead @smart-input/core zustand
# or
pnpm add @smart-input/typeahead @smart-input/core zustand
# or
yarn add @smart-input/typeahead @smart-input/core zustand
```

## Quick Start

### Basic Usage

```tsx
import { SmartInput, Editor } from '@smart-input/core';
import { TypeaheadLookup } from '@smart-input/typeahead';
import '@smart-input/core/style.css';
import '@smart-input/typeahead/style.css';

const users = [
  { id: 1, name: 'John Doe', username: 'johndoe' },
  { id: 2, name: 'Jane Smith', username: 'janesmith' },
  { id: 3, name: 'Bob Wilson', username: 'bobwilson' }
];

function App() {
  return (
    <SmartInput>
      <TypeaheadLookup
        trigger="@"
        items={users}
        itemToString={(user) => user.name}
        onSelect={(user) => ({
          text: `@${user.username}`,
          style: { 
            backgroundColor: '#e3f2fd', 
            color: '#1976d2',
            padding: '2px 6px',
            borderRadius: '4px'
          }
        })}
      />
      <Editor placeholder="Type @ to mention someone..." />
    </SmartInput>
  );
}
```

## Props

### TypeaheadLookup

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `trigger` | string | Yes | Character that activates the lookup (e.g., '@', '#', '/') |
| `items` | T[] | Yes* | Array of items to search (*or use `fetchItems`) |
| `itemToString` | (item: T) => string | Yes | Convert item to display string |
| `onSelect` | (item: T) => StyledBlockInfo | Yes | Convert selected item to styled block |
| `fetchItems` | (query: string) => Promise<T[]> | No | Async function to fetch items |
| `filterItems` | (items: T[], query: string) => T[] | No | Custom filtering function |
| `renderItem` | (item: T) => ReactNode | No | Custom item renderer |
| `maxItems` | number | No | Maximum suggestions to show (default: 10) |
| `minQueryLength` | number | No | Minimum characters before showing suggestions (default: 0) |
| `debounceMs` | number | No | Debounce delay for async fetching (default: 300) |
| `caseSensitive` | boolean | No | Case-sensitive filtering (default: false) |

## Examples

### User Mentions (@)

```tsx
<TypeaheadLookup
  trigger="@"
  items={users}
  itemToString={(user) => user.name}
  onSelect={(user) => ({
    text: `@${user.username}`,
    style: { 
      backgroundColor: '#e3f2fd',
      color: '#1976d2',
      fontWeight: 'bold'
    }
  })}
  renderItem={(user) => (
    <div className="user-mention">
      <img src={user.avatar} alt="" />
      <div>
        <div>{user.name}</div>
        <div className="username">@{user.username}</div>
      </div>
    </div>
  )}
/>
```

### Hashtags (#)

```tsx
const tags = ['javascript', 'react', 'typescript', 'nodejs', 'web'];

<TypeaheadLookup
  trigger="#"
  items={tags}
  itemToString={(tag) => tag}
  onSelect={(tag) => ({
    text: `#${tag}`,
    style: { 
      color: '#2196f3',
      fontWeight: '600'
    }
  })}
/>
```

### Commands (/)

```tsx
const commands = [
  { name: 'image', description: 'Insert an image', icon: '🖼️' },
  { name: 'code', description: 'Insert code block', icon: '💻' },
  { name: 'table', description: 'Insert a table', icon: '📊' }
];

<TypeaheadLookup
  trigger="/"
  items={commands}
  itemToString={(cmd) => cmd.name}
  onSelect={(cmd) => ({
    text: `/${cmd.name}`,
    style: { 
      backgroundColor: '#f5f5f5',
      fontFamily: 'monospace'
    }
  })}
  renderItem={(cmd) => (
    <div className="command-item">
      <span className="icon">{cmd.icon}</span>
      <div>
        <div className="name">{cmd.name}</div>
        <div className="description">{cmd.description}</div>
      </div>
    </div>
  )}
/>
```

### Async Data Fetching

```tsx
async function fetchUsers(query: string) {
  const response = await fetch(`/api/users?q=${query}`);
  return response.json();
}

<TypeaheadLookup
  trigger="@"
  fetchItems={fetchUsers}
  itemToString={(user) => user.name}
  onSelect={(user) => ({
    text: `@${user.username}`,
    style: { color: '#1976d2' }
  })}
  minQueryLength={2}
  debounceMs={500}
/>
```

### Custom Filtering

```tsx
function fuzzyFilter(items: User[], query: string) {
  const lowerQuery = query.toLowerCase();
  return items.filter(item => 
    item.name.toLowerCase().includes(lowerQuery) ||
    item.email.toLowerCase().includes(lowerQuery) ||
    item.username.toLowerCase().includes(lowerQuery)
  );
}

<TypeaheadLookup
  trigger="@"
  items={users}
  filterItems={fuzzyFilter}
  itemToString={(user) => user.name}
  onSelect={(user) => ({
    text: `@${user.username}`,
    style: { color: '#1976d2' }
  })}
/>
```

### Multiple Typeaheads

```tsx
<SmartInput>
  <TypeaheadLookup
    trigger="@"
    items={users}
    itemToString={(u) => u.name}
    onSelect={(u) => ({ text: `@${u.username}`, style: { color: 'blue' } })}
  />
  <TypeaheadLookup
    trigger="#"
    items={tags}
    itemToString={(t) => t}
    onSelect={(t) => ({ text: `#${t}`, style: { color: 'green' } })}
  />
  <TypeaheadLookup
    trigger="/"
    items={commands}
    itemToString={(c) => c.name}
    onSelect={(c) => ({ text: `/${c.name}`, style: { color: 'orange' } })}
  />
  <Editor placeholder="Type @, #, or / to trigger suggestions..." />
</SmartInput>
```

## Keyboard Navigation

- `Arrow Down` - Navigate to next suggestion
- `Arrow Up` - Navigate to previous suggestion
- `Enter` - Select highlighted suggestion
- `Escape` - Close suggestions panel
- `Tab` - Close suggestions and continue typing

## Styling

Import the default styles:

```tsx
import '@smart-input/typeahead/style.css';
```

Customize with CSS classes:

- `.typeahead-popup` - Main popup container
- `.typeahead-list` - Suggestions list
- `.typeahead-item` - Individual suggestion
- `.typeahead-item--active` - Highlighted suggestion

Example custom styles:

```css
.typeahead-popup {
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.typeahead-item {
  padding: 12px 16px;
  transition: background-color 0.2s;
}

.typeahead-item--active {
  background-color: #f0f7ff;
  color: #0066cc;
}
```

## TypeScript Support

Full TypeScript definitions are included:

```typescript
import type { 
  TypeaheadLookupProps,
  StyledBlockInfo,
  TypeaheadItem 
} from '@smart-input/typeahead';

interface User {
  id: number;
  name: string;
  username: string;
}

const props: TypeaheadLookupProps<User> = {
  trigger: '@',
  items: users,
  itemToString: (user) => user.name,
  onSelect: (user) => ({
    text: `@${user.username}`,
    style: { color: 'blue' }
  })
};
```

## Accessibility

The typeahead component follows WCAG 2.1 AA guidelines:

- ✅ ARIA labels and roles for screen readers
- ✅ Keyboard-only navigation support
- ✅ Focus management
- ✅ Screen reader announcements for results
- ✅ High contrast mode support

## Advanced Usage

### With React Components

Combine with `@smart-input/reactblocks` to render React components:

```tsx
import { ReactBlocksManager } from '@smart-input/reactblocks';

function App() {
  const [reactBlocks, setReactBlocks] = useState([]);

  return (
    <SmartInput>
      <TypeaheadLookup
        trigger="@"
        items={users}
        itemToString={(u) => u.name}
        onSelect={(user) => {
          const blockId = `user-${user.id}-${Date.now()}`;
          
          setReactBlocks(prev => [...prev, {
            blockId,
            component: <UserCard user={user} />
          }]);

          return {
            id: blockId,
            text: `@${user.username}`,
            style: { color: 'transparent' }
          };
        }}
      />
      <ReactBlocksManager reactBlocks={reactBlocks} />
      <Editor />
    </SmartInput>
  );
}
```

## Documentation

For more information, see:

- **[User Guide](../../docs/USER_GUIDE.md)** - Complete usage guide
- **[Component Reference](../../docs/COMPONENTS.md)** - Component details
- **[Extension Development](../../docs/EXTENSION_DEVELOPMENT.md)** - Creating extensions

## Requirements

- React 18.0.0 or higher
- @smart-input/core 0.0.7 or higher
- zustand 5.0.0 or higher

## License

MIT © Mark Gregg
