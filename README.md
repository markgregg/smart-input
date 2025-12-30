# Smart Input

[![CI](https://github.com/markgregg/smart-input/actions/workflows/ci.yml/badge.svg)](https://github.com/markgregg/smart-input/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/markgregg/smart-input/branch/main/graph/badge.svg)](https://codecov.io/gh/markgregg/smart-input)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/%40smart-input%2Fcore.svg)](https://badge.fury.io/js/%40smart-input%2Fcore)

## 🚀 Live Demo

Try the interactive examples online: **[https://markgregg.github.io/smart-input/](https://markgregg.github.io/smart-input/)**

A powerful, extensible React rich text input component library with support for styled blocks, images, documents, autocomplete, drag-and-drop, and more.

## ✨ Features

- 🎨 **Rich Content**: Support for text, styled blocks, images, and documents
- 🔍 **Typeahead/Autocomplete**: Built-in suggestion system with customizable lookups
- 📎 **Drag & Drop**: Easy file uploads with visual feedback
- 📝 **Commit/Submit**: Chat-like submission with history navigation
- 🎯 **Extensible**: Create custom extensions that integrate seamlessly
- ⌨️ **Keyboard Navigation**: Full keyboard support with customizable shortcuts
- ↩️ **Undo/Redo**: Built-in history management
- 🎭 **Styled Blocks**: Apply custom CSS to text selections
- 📱 **Responsive**: Works on desktop and mobile

## 📚 Documentation

**Comprehensive documentation is available in the [`docs/`](./docs/) directory:**

- **[📖 Documentation Index](./docs/README.md)** - Start here for navigation
- **[🚀 User Guide](./docs/USER_GUIDE.md)** - Installation, examples, and use cases
- **[📦 Component Reference](./docs/COMPONENTS.md)** - Detailed component documentation
- **[⚙️ API Reference](./docs/API.md)** - Programmatic control API
- **[📚 TypeScript API Docs](./docs/api/README.md)** - Auto-generated API documentation
- **[🔌 Extension Development](./docs/EXTENSION_DEVELOPMENT.md)** - Creating custom extensions
- **[♿ Accessibility](./docs/ACCESSIBILITY.md)** - Accessibility features and testing
- **[⚡ Performance](./docs/PERFORMANCE.md)** - Bundle optimization and benchmarking
- **[🛡️ Error Handling](./docs/ERROR_HANDLING.md)** - Error boundaries and debugging
- **[🧪 Test Documentation](./docs/TESTS.md)** - E2E test suite and testing guide
- **[🔬 Unit Testing](./docs/UNIT_TESTING.md)** - Unit testing with Vitest

## 🚀 Quick Start

```bash
npm install @smart-input/core zustand
# or
pnpm add @smart-input/core zustand
```

```tsx
import { SmartInput, Editor } from '@smart-input/core';
import '@smart-input/core/style.css';

function App() {
  return (
    <SmartInput>
      <Editor placeholder="Start typing..." />
    </SmartInput>
  );
}
```

See the [User Guide](./docs/USER_GUIDE.md) for more examples!

## 📦 Project Structure

This is a pnpm workspace monorepo with the following packages:

- **[@smart-input/core](./packages/core)** - Core editor components (SmartInput, Editor, UnmanagedEditor)
- **[@smart-input/typeahead](./packages/typeahead)** - Typeahead/autocomplete lookup component  
- **[@smart-input/reactblocks](./packages/reactblocks)** - Render React components inside styled blocks
- **[@smart-input/dragblocks](./packages/dragblocks)** - Drag-and-drop reordering of blocks
- **[@smart-input/dropcontent](./packages/dropcontent)** - Drop content handler functionality
- **[@smart-input/commitnotifier](./packages/commitnotifier)** - Commit/submit functionality with history
- **[@smart-input/test](./packages/test)** - Test application and E2E tests

> 💡 Each package has its own README with detailed usage examples and API documentation.

### Examples

- **smart-input-examples** - Comprehensive tabbed interface showcasing all features (chat, filtering, mentions)

## 🛠️ Development

### Prerequisites

- Node.js (v18 or higher recommended)
- pnpm (v8 or higher)

### Installation

1. Install pnpm globally if you haven't already:
```bash
npm install -g pnpm
```

2. Install dependencies for all packages:
```bash
pnpm install
```

### Build Commands

```bash
# Build all packages
pnpm build

# Build production bundles
pnpm build:prod

# Build specific package
pnpm --filter @smart-input/core build

# Analyze bundle sizes
pnpm analyze

# Run performance benchmarks
pnpm bench
```

### Performance Optimization

```bash
# Verify tree-shaking configuration
pnpm verify:treeshake

# Generate bundle size report
pnpm benchmark

# Run component benchmarks
pnpm bench

# Analyze bundle composition
pnpm analyze
```

See [Performance Guide](./docs/PERFORMANCE.md) for optimization strategies!

### Running Tests

```bash
# Run unit tests
pnpm test

# Run unit tests with UI
pnpm test:ui

# Run unit tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui

# Run combined coverage (unit + E2E)
pnpm test:coverage:combined
```

### Development Server

```bash
# Run the test application (includes all features)
pnpm dev

# Run specific package dev server
pnpm --filter @smart-input/test dev
```

### Testing

```bash
# Run E2E tests
pnpm test

# Run E2E tests with UI (interactive mode)
pnpm test:ui

# Run tests for specific package
pnpm --filter @smart-input/test test
```

See [Test Documentation](./docs/TESTS.md) for detailed testing information.

### Linting

```bash
# Lint all packages
pnpm lint

# Fix linting issues
pnpm lint:fix
```

## 📐 Package Dependencies

```
@smart-input/core (no dependencies on other packages)
    ↑
    ├── @smart-input/typeahead
    ├── @smart-input/reactblocks
    ├── @smart-input/dragblocks
    ├── @smart-input/dropcontent
    ├── @smart-input/commitnotifier
    └── @smart-input/test (depends on all packages)
```

## 🎯 Use Cases

The library supports various use cases out of the box:

- **Chat Inputs**: With commit on Enter and history navigation
- **Search Bars**: With autocomplete suggestions
- **Comment Systems**: With mentions and formatting
- **Email Composers**: With file attachments
- **Note Editors**: With multi-line support
- **Terminal Interfaces**: With command history
- **Rich Text Editors**: With styled content blocks

See the [User Guide](./docs/USER_GUIDE.md#common-use-cases) for detailed examples!

## 🔌 Extensions

Create custom extensions to add new functionality:

```typescript
import { useBlocks, useCursorPosition } from '@smart-input/core';

function MyExtension() {
  const { blocks, setBlocks } = useBlocks(s => s);
  const { characterPosition } = useCursorPosition(s => s);
  
  // Your extension logic here
  
  return <div>Custom UI</div>;
}
```

See the [Extension Development Guide](./docs/EXTENSION_DEVELOPMENT.md) for details!

## 📋 Working with Individual Packages

To run commands in a specific package:

```bash
# Build only the core package
pnpm --filter @smart-input/core build

# Run tests in the test package
pnpm --filter @smart-input/test test

# Develop with the test app
pnpm --filter @smart-input/test dev
```

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and check the [Extension Development Guide](./docs/EXTENSION_DEVELOPMENT.md) if you're building new features.

## 📄 License

MIT

## 🙏 Acknowledgments

Built with:
- [React](https://react.dev/) - UI framework
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [Playwright](https://playwright.dev/) - E2E testing
- [Vite](https://vitejs.dev/) - Build tool

## 📞 Support

- 📖 [Documentation](./docs/README.md)
- 🐛 [Issue Tracker](../../issues)
- 💬 [Discussions](../../discussions)
- 📧 Email: gregg.mark@gmail.com

---

**Made with ❤️ by Mark Gregg**
