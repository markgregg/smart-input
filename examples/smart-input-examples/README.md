# Smart Input Examples

This example demonstrates all three main Open Input features in a single tabbed application.

## Code Organization

The source code is organized into directories by feature:

```
src/
├── App.tsx          # Main app with tab navigation
├── chat/
│   ├── ChatInputApp.tsx
│   ├── Message.tsx
│   └── Message.css
├── filter/
│   ├── FilterSentenceApp.tsx
│   ├── FilterPill.tsx
│   └── FilterPill.css
└── mention/
    ├── MentionTaggingApp.tsx
    ├── UserMention.tsx
    ├── TagBadge.tsx
    ├── UserMention.css
    └── TagBadge.css
```

## Features

### Chat Input Tab
- Send messages with Enter key
- Drag and drop files/images
- Message history with timestamps
- Auto-focus after sending

### Filter Sentence Tab
- Sequential field-operator-value selection
- Dynamic filter pill generation
- Interactive React components
- Complex state management

### Mention & Tagging Tab
- @mentions for users with autocomplete
- #hashtags for topics with color coding
- Interactive hover effects
- Portal-based React components

## Running

```bash
pnpm install
pnpm dev
```

The application will be available at `http://localhost:3004/`

## Implementation

This example shows how to:
- Combine multiple SmartInput instances
- Manage complex state across different features
- Integrate all Open Input packages
- Create tabbed interfaces with shared components
- Handle different interaction patterns

## Packages Used

- `@smart-input/core`
- `@smart-input/typeahead`
- `@smart-input/commitnotifier`
- `@smart-input/reactblocks`
- `@smart-input/dropcontent`