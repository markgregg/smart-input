# Mention & Tagging System Example

A social media-style input system demonstrating user mentions and topic tags with autocomplete and React components.

## Features

- 🔍 **Smart Autocomplete** - Type `@` to mention users or `#` for topic tags
- ⚛️ **React Components** - Interactive mentions and tags rendered as React components
- ⌨️ **Keyboard Navigation** - Full keyboard support with arrow keys and Enter
- 🎨 **Custom Rendering** - Beautiful, styled components for mentions and tags
- 📊 **Fuzzy Search** - Search users by name or username
- 🎯 **Visual Feedback** - Hover effects and smooth animations

## Running

```bash
pnpm install
pnpm dev
```

The example will be available at `http://localhost:3001`

## Implementation Details

This example demonstrates:

### TypeaheadLookup Integration

Using `@smart-input/typeahead` to provide autocomplete for:
- User mentions triggered by `@`
- Topic tags triggered by `#`

```typescript
<TypeaheadLookup
  trigger="@"
  items={users}
  itemToString={(user) => user.name}
  onSelect={handleUserSelect}
  filterItems={filterUsers}
  renderItem={renderUser}
/>
```

### ReactBlocks Integration

Using `@smart-input/reactblocks` to render interactive components:
- `UserMention` component showing avatar and username
- `TagBadge` component with color-coded topic tags

```typescript
<ReactBlocksManager reactBlocks={reactBlocks} />
```

### Custom Filtering

Custom filter function for searching users:

```typescript
const filterUsers = (users: User[], query: string) => {
  const lowerQuery = query.toLowerCase();
  return users.filter(
    (user) =>
      user.name.toLowerCase().includes(lowerQuery) ||
      user.username.toLowerCase().includes(lowerQuery),
  );
};
```

### Custom Rendering

Custom item renderers for typeahead suggestions:

```typescript
const renderUser = (user: User) => (
  <div className="typeahead-user-item">
    <span className="user-avatar">{user.avatar}</span>
    <div className="user-info">
      <div className="user-name">{user.name}</div>
      <div className="user-username">@{user.username}</div>
    </div>
    <div className="user-role">{user.role}</div>
  </div>
);
```

## Packages Used

- **@smart-input/core** - Core editor functionality
- **@smart-input/typeahead** - Autocomplete/typeahead lookup
- **@smart-input/reactblocks** - React component rendering in styled blocks

## Code Structure

```
src/
├── App.tsx              # Main application with editor setup
├── App.css              # Application styling
├── UserMention.tsx      # User mention component
├── UserMention.css      # User mention styling
├── TagBadge.tsx         # Topic tag component
├── TagBadge.css         # Topic tag styling
├── main.tsx             # Application entry point
└── index.css            # Global styles
```

## Key Concepts

### 1. Dual Typeahead Triggers

The example uses two separate `TypeaheadLookup` components, each with different triggers:
- `@` for user mentions
- `#` for topic tags

### 2. React Portal Rendering

Mentions and tags are rendered as React components using portals, allowing:
- Interactive components within the editor
- Proper event handling and state management
- Dynamic styling and animations

### 3. Block Management

Each mention or tag creates:
1. A styled block in the editor
2. A corresponding React component in the `reactBlocks` array
3. Associated metadata (`type`, `userId`/`topicId`)

## Customization

You can easily customize:
- User data structure and display
- Topic categories and colors
- Typeahead filtering logic
- Component appearance and behavior
- Search algorithms

## Use Cases

This pattern is useful for:
- Social media post composers
- Team collaboration tools
- Comment systems
- Task management apps
- Documentation tools
- Email composers

## Learn More

- [TypeaheadLookup Documentation](../../packages/typeahead/README.md)
- [ReactBlocks Documentation](../../packages/reactblocks/README.md)
- [Open Input User Guide](../../docs/USER_GUIDE.md)
