# Filter Sentence Example

An input system for building filter sentences with dropdown selections for fields, operators, and values, creating styled pills.

## Features

- 🔍 **Dropdown Selections** - Choose field, operator, and value from dropdowns
- ⚛️ **React Components** - Pills rendered as React components
- ⌨️ **Keyboard Navigation** - Full keyboard support
- 🎨 **Styled Blocks** - Italic text for entered parts, pills for complete filters
- 📊 **Sequential Input** - Enter field, then operator, then value

## Running

```bash
pnpm install
pnpm dev
```

The example will be available at `http://localhost:3002`

## Implementation Details

This example demonstrates sequential input with typeahead for building filter sentences.

### TypeaheadLookup Integration

Using `@smart-input/typeahead` for dropdown selections:
- Field selection
- Operator selection based on field
- Value selection based on field

### ReactBlocks Integration

Using `@smart-input/reactblocks` to render filter pills as components.

## Packages Used

- **@smart-input/core** - Core editor functionality
- **@smart-input/typeahead** - Autocomplete/typeahead lookup
- **@smart-input/reactblocks** - React component rendering in styled blocks

## Code Structure

```
src/
├── App.tsx              # Main application
├── App.css              # Application styling
├── FilterPill.tsx       # Filter pill component
├── FilterPill.css       # Filter pill styling
├── main.tsx             # Application entry point
└── index.css            # Global styles
```