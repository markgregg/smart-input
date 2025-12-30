# Documentation Index

Welcome to the smart-input library documentation! This guide will help you find the information you need.

## 📚 Documentation Structure

### For New Users
1. **[User Guide](./USER_GUIDE.md)** - Start here! Complete guide to getting started and implementing the library
   - Installation instructions
   - Quick start examples
   - Common use cases
   - Troubleshooting tips

### For Developers
2. **[Component Reference](./COMPONENTS.md)** - Detailed documentation for all components
   - SmartInput, Editor, UnmanagedEditor
   - TypeaheadLookup, DropContentHandler, CommitNotifier
   - Props and usage examples
   - Block types and styling

3. **[API Reference](./API.md)** - Complete API documentation for programmatic control
   - SmartInputApi methods
   - Function API (insert, delete, replace, etc.)
   - Complete examples and best practices

3a. **[Auto-Generated API Docs](./api/README.md)** - TypeScript API documentation
   - Complete TypeScript definitions
   - Generated from source code
   - All packages documented
   - Available online at GitHub Pages

4. **[Extension Development Guide](./EXTENSION_DEVELOPMENT.md)** - Learn how to create custom extensions
   - Extension architecture
   - State management patterns
   - Advanced patterns and examples
   - Publishing extensions

5. **[Test Documentation](./TESTS.md)** - Understanding and writing tests
   - E2E test suite overview
   - Playwright test modules explained
   - Writing new tests
   - Debugging tips

6. **[Unit Testing Guide](./UNIT_TESTING.md)** - Unit testing with Vitest
   - Running unit tests
   - Writing tests for components and utilities
   - Coverage reports
   - Best practices

7. **[Accessibility Guide](./ACCESSIBILITY.md)** - Accessibility features and testing
   - Keyboard navigation
   - Screen reader support
   - ARIA attributes
   - Automated accessibility testing

8. **[Performance Guide](./PERFORMANCE.md)** - Performance optimization and benchmarking
   - Bundle analysis and optimization
   - Tree-shaking verification
   - Component performance benchmarks
   - Best practices for optimization

9. **[Error Handling & Debugging](./ERROR_HANDLING.md)** - Error boundaries and debugging
   - React Error Boundaries
   - Debug logging system
   - Development mode warnings
   - Error tracking in production

---

## 🚀 Quick Links

### Getting Started
- [Installation](./USER_GUIDE.md#installation)
- [Quick Start](./USER_GUIDE.md#quick-start)
- [Basic Implementation](./USER_GUIDE.md#basic-implementation)

### Component Documentation
- [SmartInput](./COMPONENTS.md#SmartInput)
- [Editor](./COMPONENTS.md#editor)
- [TypeaheadLookup](./COMPONENTS.md#typeaheadlookup)
- [ReactBlocksManager](./COMPONENTS.md#reactblocksmanager)
- [DragBlocksHandler](./COMPONENTS.md#dragblockshandler)
- [DropContentHandler](./COMPONENTS.md#dropcontenthandler)
- [CommitNotifier](./COMPONENTS.md#commitnotifier)

### API Methods
- [apply - Execute operations](./API.md#apply)
- [insert - Insert text](./API.md#insert)
- [delete - Delete text](./API.md#delete)
- [styleText - Apply styling](./API.md#styletext)
- [insertImage - Add images](./API.md#insertimage)

### Development
- [Creating Extensions](./EXTENSION_DEVELOPMENT.md#creating-your-first-extension)
- [State Management](./EXTENSION_DEVELOPMENT.md#state-management)
- [Keyboard Handling](./EXTENSION_DEVELOPMENT.md#pattern-1-keyboard-event-handling)
- [Testing Extensions](./EXTENSION_DEVELOPMENT.md#testing-extensions)

### Performance & Optimization
- [Bundle Analysis](./PERFORMANCE.md#bundle-analysis)
- [Tree-Shaking](./PERFORMANCE.md#tree-shaking-verification)
- [Performance Benchmarks](./PERFORMANCE.md#performance-benchmarks)
- [Optimization Checklist](./PERFORMANCE.md#optimization-checklist)

### Error Handling & Debugging
- [Error Boundaries](./ERROR_HANDLING.md#error-boundaries)
- [Debug Logging](./ERROR_HANDLING.md#debug-logging)
- [Development Warnings](./ERROR_HANDLING.md#development-mode-warnings)
- [Error Tracking](./ERROR_HANDLING.md#error-tracking-in-production)

---

## 📖 Documentation by Use Case

### I want to...

#### ...create a simple text input
→ [Quick Start](./USER_GUIDE.md#quick-start)

#### ...add autocomplete functionality
→ [TypeaheadLookup Component](./COMPONENTS.md#typeaheadlookup)  
→ [Typeahead Use Case](./USER_GUIDE.md#use-case-1-search-bar-with-suggestions)

#### ...enable file uploads via drag and drop
→ [DropContentHandler Component](./COMPONENTS.md#dropcontenthandler)  
→ [Email Composer Example](./USER_GUIDE.md#use-case-3-email-composer-with-attachments)

#### ...add submit functionality with history
→ [CommitNotifier Component](./COMPONENTS.md#commitnotifier)  
→ [Terminal Example](./USER_GUIDE.md#use-case-4-terminal-style-input)

#### ...programmatically manipulate content
→ [API Reference](./API.md)  
→ [State Management](./USER_GUIDE.md#state-management)

#### ...create a custom extension
→ [Extension Development Guide](./EXTENSION_DEVELOPMENT.md)

#### ...understand the test suite
→ [Test Documentation](./TESTS.md)

#### ...style the editor
→ [Styling and Customization](./USER_GUIDE.md#styling-and-customization)

---

## 🎯 Documentation by Role

### Frontend Developer
Start with:
1. [User Guide](./USER_GUIDE.md) - Learn implementation
2. [Component Reference](./COMPONENTS.md) - Understand components
3. [API Reference](./API.md) - Programmatic control

### Library Contributor
Focus on:
1. [Extension Development Guide](./EXTENSION_DEVELOPMENT.md) - Architecture
2. [Test Documentation](./TESTS.md) - Testing approach
3. [Component Reference](./COMPONENTS.md) - Existing patterns

### QA/Tester
Check out:
1. [Test Documentation](./TESTS.md) - Test suite details
2. [User Guide](./USER_GUIDE.md#troubleshooting) - Known issues
3. [Component Reference](./COMPONENTS.md) - Expected behavior

---

## 📝 Documentation Conventions

### Code Examples
All code examples are written in TypeScript and can be copied directly.

### File Paths
Paths use forward slashes and are relative to the project root:
```
packages/core/src/components/Editor/Editor.tsx
```

### Component Names
Component names use PascalCase:
- `SmartInput`
- `TypeaheadLookup`
- `DropContentHandler`

### Props
Props are documented with:
- Name
- Type
- Default value (if applicable)
- Description

Example:
- `enableLineBreaks?: boolean` (default: `false`) - Allow multi-line input

---

## 🔍 Search Tips

Looking for something specific? Try these searches:

- **"blocks"** - Core data structure
- **"cursor position"** - Cursor-related functionality
- **"keyboard"** - Keyboard events and shortcuts
- **"styled block"** - Styled text functionality
- **"API"** - Programmatic control
- **"test"** - Testing information

---

## 🆘 Getting Help

### In the Documentation
1. Check the [User Guide Troubleshooting](./USER_GUIDE.md#troubleshooting)
2. Review [Common Use Cases](./USER_GUIDE.md#common-use-cases)
3. Look at [Component Examples](./COMPONENTS.md)

### External Resources
- GitHub Issues: Report bugs or request features
- GitHub Discussions: Ask questions and share ideas
- Example App: `packages/test/src` - Working examples

---

## 📚 Additional Resources

### Example Projects
The test application (`packages/test`) demonstrates all features:
- Basic editor usage
- All extension components
- Programmatic API control
- Custom styling

### Type Definitions
TypeScript definitions are included with all packages:
```typescript
import type { 
  Block, 
  BlockType, 
  SmartInputApi,
  CommitItem 
} from '@smart-input/core';
```

### Source Code
Browse the source code for implementation details:
- Core: `packages/core/src/`
- Extensions: `packages/*/src/`
- Tests: `packages/test/tests/`

---

## 🔄 Documentation Updates

This documentation is updated with each release. The version corresponds to the package version.

**Current Version**: 1.0.0

**Last Updated**: December 2025

---

## 📋 Glossary

**Block**: A unit of content (text, styled text, image, or document)

**SmartInput**: Top-level container providing state management

**Editor**: The actual editable input area

**Extension**: A component that extends editor functionality

**Zustand Store**: State management store (blocks, cursor, buffer, etc.)

**Buffer**: Undo/redo history storage

**Cursor Position**: Character index where the cursor is located

**Styled Block**: Text block with custom CSS styling

**CommitItem**: Simplified block representation for serialization

---

## ✅ Quick Reference Card

```typescript
// Basic Setup
import { SmartInput, Editor } from '@smart-input/core';
import '@smart-input/core/style.css';

<SmartInput>
  <Editor placeholder="Type here..." />
</SmartInput>

// With API
const apiRef = useRef<SmartInputApi>(null);
<SmartInput ref={apiRef}>
  <Editor />
</SmartInput>

// Modify Content
apiRef.current?.apply(api => {
  api.insert('Hello', 0);
  api.delete(0, 5);
  api.styleText('word', 'id', { color: 'red' });
});

// With Extensions
<SmartInput>
  <TypeaheadLookup lookups={[...]} />
  <DropContentHandler>
    <Editor />
  </DropContentHandler>
</SmartInput>

// With Commit/History
<SmartInput>
  <CommitNotifier 
    onCommit={handleCommit}
    enableHistory={true}
  />
  <Editor />
</SmartInput>
// History Navigation:
// - Arrow Up: Go to previous entries (starts at most recent, stops at oldest)
// - Arrow Down: Go to newer entries (stops at current input)
```

---

**Happy coding!** 🚀
