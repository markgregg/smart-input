# Examples

This directory contains example implementations demonstrating how to use Open Input in various scenarios.

## Available Examples

### 1. Chat Input (`chat-input/`)
A simple chat interface demonstrating:
- Message submission with Enter key
- Message history display
- Auto-focus after sending
- Custom styling with className prop
- CommitNotifier integration

**Packages used**: `@smart-input/core`, `@smart-input/commitnotifier`

### 2. Mention & Tagging System (`mention-tagging/`)
A social media-style input with autocomplete for mentions and tags:
- @mentions for users with typeahead search
- #hashtags for topics with color-coded badges
- React components rendered in styled blocks
- Custom filtering and rendering
- Interactive hover effects

**Packages used**: `@smart-input/core`, `@smart-input/typeahead`, `@smart-input/reactblocks`

## Running Examples

Each example is a standalone application. To run an example:

```bash
cd examples/<example-name>
pnpm install
pnpm dev
```

## Example Structure

Each example demonstrates:
- Basic setup and configuration
- Component integration
- State management
- Custom styling
- Extension usage
- Best practices

Refer to individual example READMEs for specific implementation details.
