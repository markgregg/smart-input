# Examples

This directory contains example implementations demonstrating how to use Open Input in various scenarios.

## Available Examples

### Smart Input Examples (`smart-input-examples/`)
A comprehensive tabbed interface showcasing all three main Open Input features in one application:

- **Chat Input Tab**: Message submission with file drag-and-drop support
- **Filter Sentence Tab**: Sequential field-operator-value selection with dynamic filter pills
- **Mention & Tagging Tab**: @mentions and #hashtags with autocomplete and interactive components

**Features demonstrated**:
- Message history and auto-focus
- Sequential dropdown selections
- React component integration
- Typeahead lookup with fuzzy search
- File drag-and-drop handling
- Interactive mentions and tags
- Complex state management

**Packages used**: All Open Input packages (`@smart-input/core`, `@smart-input/typeahead`, `@smart-input/commitnotifier`, `@smart-input/reactblocks`, `@smart-input/dropcontent`)

## Running the Example

To run the combined examples:

```bash
cd examples/smart-input-example
pnpm install
pnpm dev
```

The application will be available at `http://localhost:3004/`

## Code Organization

The example is organized by feature:

```
src/
├── App.tsx          # Main app with tab navigation
├── chat/            # Chat input implementation
├── filter/          # Filter sentence builder
└── mention/         # Mention and tagging system
```

## Implementation Details

This example shows how to:
- Combine multiple SmartInput instances in a single application
- Manage complex state across different features
- Integrate all Open Input packages together
- Create tabbed interfaces with shared components
- Handle different interaction patterns and user experiences
