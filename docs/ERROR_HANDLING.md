# Error Handling & Debugging Guide

This guide covers error handling strategies, debugging techniques, and best practices for the Open Input library.

---

## 🛡️ Error Boundaries

### Overview

Error boundaries are React components that catch JavaScript errors anywhere in their child component tree, log those errors, and display a fallback UI instead of crashing the entire application.

### Basic Usage

Wrap your editor with an `ErrorBoundary`:

```tsx
import { SmartInput, Editor, ErrorBoundary } from '@smart-input/core';

function App() {
  return (
    <ErrorBoundary errorMessage="Editor encountered an error">
      <SmartInput>
        <Editor />
      </SmartInput>
    </ErrorBoundary>
  );
}
```

### With Error Logging

Send errors to an external service:

```tsx
import { ErrorBoundary, ErrorDetails } from '@smart-input/core';

function App() {
  const handleError = (errorDetails: ErrorDetails) => {
    // Log to your error tracking service (e.g., Sentry, LogRocket)
    console.error('Editor error:', errorDetails.error);
    
    // Example: Send to Sentry
    // Sentry.captureException(errorDetails.error, {
    //   extra: {
    //     componentStack: errorDetails.errorInfo.componentStack,
    //     timestamp: errorDetails.timestamp,
    //   },
    // });
  };

  return (
    <ErrorBoundary onError={handleError}>
      <SmartInput>
        <Editor />
      </SmartInput>
    </ErrorBoundary>
  );
}
```

### Custom Fallback UI

Provide a custom error display:

```tsx
import { ErrorBoundary, ErrorDetails } from '@smart-input/core';

function App() {
  const customFallback = (error: ErrorDetails) => (
    <div className="custom-error">
      <h2>Oops! Something went wrong</h2>
      <p>The editor has encountered an error.</p>
      <button onClick={() => window.location.reload()}>
        Reload Page
      </button>
    </div>
  );

  return (
    <ErrorBoundary fallback={customFallback}>
      <SmartInput>
        <Editor />
      </SmartInput>
    </ErrorBoundary>
  );
}
```

### ErrorBoundary Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Components to render |
| `fallback` | `(error: ErrorDetails) => ReactNode` | - | Custom fallback UI |
| `onError` | `(error: ErrorDetails) => void` | - | Error callback |
| `errorMessage` | `string` | "Something went wrong" | Error message to display |
| `showDetails` | `boolean` | `true` (dev only) | Show detailed error info |
| `allowReset` | `boolean` | `true` | Allow user to retry |

### ErrorDetails Interface

```typescript
interface ErrorDetails {
  error: Error;           // The error that was caught
  errorInfo: ErrorInfo;   // React component stack trace
  timestamp: Date;        // When the error occurred
}
```

---

## 🐛 Debug Logging

### Overview

The built-in logger provides structured, namespace-based logging similar to the popular `debug` package. Logs are only output when explicitly enabled, keeping production builds clean.

### Creating a Logger

```typescript
import { createLogger } from '@smart-input/core';

// Create a logger for your namespace
const log = createLogger('myapp:editor');

// Use the logger
log('Editor initialized', { blocks: 3 });
log.info('User action', { action: 'insert-text' });
log.warn('Large content detected', { size: 10000 });
log.error('Failed to parse', error);
```

### Enabling Debug Logs

#### In Browser (Development)

```javascript
// Enable all smart-input logs
localStorage.setItem('debug', 'smart-input:*');

// Enable specific namespace
localStorage.setItem('debug', 'smart-input:editor:state');

// Enable multiple namespaces
localStorage.setItem('debug', 'smart-input:editor:*,smart-input:typeahead');

// Refresh the page for changes to take effect
```

#### Programmatically

```typescript
import { enableDebug, disableDebug } from '@smart-input/core';

// Enable all logs
enableDebug('*');

// Enable specific namespace
enableDebug('editor:state');

// Enable multiple namespaces
enableDebug('editor:*,typeahead');

// Disable all debugging
disableDebug();
```

#### Via Environment Variable

```bash
# Node.js environment
DEBUG=smart-input:* npm run dev
```

### Logger API

```typescript
interface Logger {
  // Log a debug message (LogLevel.DEBUG)
  (message: string, ...args: unknown[]): void;
  
  // Log an info message (LogLevel.INFO)
  info: (message: string, ...args: unknown[]) => void;
  
  // Log a warning message (LogLevel.WARN)
  warn: (message: string, ...args: unknown[]) => void;
  
  // Log an error message (LogLevel.ERROR)
  error: (message: string, ...args: unknown[]) => void;
  
  // Check if this logger is enabled
  enabled: boolean;
  
  // The namespace of this logger
  namespace: string;
}
```

### Log Levels

```typescript
enum LogLevel {
  DEBUG = 0,   // Detailed debugging information
  INFO = 1,    // Informational messages
  WARN = 2,    // Warning messages
  ERROR = 3,   // Error messages
  NONE = 4,    // No logging
}
```

### Configuring the Logger

```typescript
import { configureLogger, LogLevel } from '@smart-input/core';

configureLogger({
  level: LogLevel.INFO,      // Minimum level to log
  timestamps: true,          // Include timestamps
  output: console,           // Output destination
});
```

### Namespace Patterns

Namespaces support wildcards for flexible filtering:

- `*` - All namespaces
- `editor:*` - All editor namespaces
- `editor:state` - Specific namespace
- `editor:*,typeahead` - Multiple patterns

**Recommended Namespace Structure:**
- `myapp:component` - Component-level logging
- `myapp:component:feature` - Feature-specific logging
- `myapp:state` - State management logging
- `myapp:api` - API call logging

---

## 🔍 Development Mode Warnings

### Overview

Development mode utilities help catch common mistakes and provide helpful warnings during development without impacting production builds.

### devWarn

Display warnings only in development:

```typescript
import { devWarn } from '@smart-input/core';

function MyComponent({ value }: Props) {
  if (!value) {
    devWarn('MyComponent: value prop is undefined');
  }
  
  // Component logic...
}
```

### devError

Display errors only in development:

```typescript
import { devError } from '@smart-input/core';

function parseContent(content: unknown) {
  if (typeof content !== 'string') {
    devError('parseContent: expected string, got', typeof content);
    return '';
  }
  
  return content;
}
```

### devAssert

Assert conditions in development:

```typescript
import { devAssert } from '@smart-input/core';

function processBlocks(blocks: Block[]) {
  devAssert(Array.isArray(blocks), 'blocks must be an array');
  devAssert(blocks.length > 0, 'blocks cannot be empty');
  
  // Process blocks...
}
```

**Note:** `devAssert` throws an error if the condition is false, but only in development mode. In production, it does nothing.

---

## 🔧 Debugging Techniques

### 1. Enable Debug Logging

Start by enabling debug logs for the area you're investigating:

```javascript
// In browser console
localStorage.setItem('debug', 'smart-input:*');
location.reload();
```

### 2. Use React DevTools

Install React DevTools browser extension to:
- Inspect component hierarchy
- View component props and state
- Profile component performance
- Debug hooks

### 3. Inspect State

Access the editor's internal state in development:

```typescript
import { useBlocks, useCursorPosition } from '@smart-input/core';

function DebugInfo() {
  const { blocks } = useBlocks(s => s);
  const { characterPosition } = useCursorPosition(s => s);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Current blocks:', blocks);
    console.log('Cursor position:', characterPosition);
  }
  
  return null;
}
```

### 4. Add Temporary Debug Components

Create debug overlays during development:

```tsx
function DebugOverlay() {
  const { blocks } = useBlocks(s => s);
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      right: 0,
      background: 'rgba(0,0,0,0.9)',
      color: 'white',
      padding: '10px',
      fontSize: '12px',
      maxWidth: '300px',
      maxHeight: '200px',
      overflow: 'auto',
    }}>
      <pre>{JSON.stringify(blocks, null, 2)}</pre>
    </div>
  );
}
```

### 5. Browser DevTools Breakpoints

Set breakpoints in your code:

```typescript
function handleInput(event: InputEvent) {
  debugger; // Execution will pause here when DevTools are open
  
  // Your logic...
}
```

### 6. Console Logging Best Practices

```typescript
// ❌ Avoid simple console.log in library code
console.log('blocks updated');

// ✅ Use the logger with namespaces
const log = createLogger('editor:input');
log('Blocks updated', { count: blocks.length });

// ✅ Use development warnings for issues
devWarn('Unexpected block type', blockType);

// ✅ Group related logs
console.group('Block Update');
console.log('Before:', oldBlocks);
console.log('After:', newBlocks);
console.groupEnd();
```

---

## 📊 Error Tracking in Production

### Setting Up Error Tracking

#### With Sentry

```tsx
import * as Sentry from '@sentry/react';
import { ErrorBoundary, ErrorDetails } from '@smart-input/core';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: process.env.NODE_ENV,
});

function App() {
  const handleError = (errorDetails: ErrorDetails) => {
    Sentry.captureException(errorDetails.error, {
      extra: {
        componentStack: errorDetails.errorInfo.componentStack,
        timestamp: errorDetails.timestamp.toISOString(),
      },
      tags: {
        component: 'SmartInput',
      },
    });
  };

  return (
    <ErrorBoundary onError={handleError}>
      <SmartInput>
        <Editor />
      </SmartInput>
    </ErrorBoundary>
  );
}
```

#### With LogRocket

```tsx
import LogRocket from 'logrocket';
import { ErrorBoundary, ErrorDetails } from '@smart-input/core';

LogRocket.init('your-app-id');

function App() {
  const handleError = (errorDetails: ErrorDetails) => {
    LogRocket.captureException(errorDetails.error, {
      extra: {
        componentStack: errorDetails.errorInfo.componentStack,
      },
    });
  };

  return (
    <ErrorBoundary onError={handleError}>
      <SmartInput>
        <Editor />
      </SmartInput>
    </ErrorBoundary>
  );
}
```

### Custom Error Reporting

```typescript
import { ErrorBoundary, ErrorDetails } from '@smart-input/core';

async function reportError(errorDetails: ErrorDetails) {
  try {
    await fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: errorDetails.error.message,
        stack: errorDetails.error.stack,
        componentStack: errorDetails.errorInfo.componentStack,
        timestamp: errorDetails.timestamp.toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      }),
    });
  } catch (err) {
    console.error('Failed to report error:', err);
  }
}

function App() {
  return (
    <ErrorBoundary onError={reportError}>
      <SmartInput>
        <Editor />
      </SmartInput>
    </ErrorBoundary>
  );
}
```

---

## 🎯 Best Practices

### Error Boundaries

1. **Wrap at appropriate levels**: Place error boundaries around features, not individual components
2. **Provide meaningful messages**: Customize error messages for user context
3. **Always log errors**: Use `onError` callback to track issues
4. **Test error scenarios**: Intentionally trigger errors during testing
5. **Graceful degradation**: Provide fallback UI that allows users to continue

### Logging

1. **Use namespaces consistently**: Follow a clear naming convention
2. **Log meaningful data**: Include context that helps debugging
3. **Don't log sensitive data**: Avoid logging passwords, tokens, PII
4. **Use appropriate levels**: Debug for details, warn for issues, error for failures
5. **Clean up logs**: Remove debug logs from production code

### Development Warnings

1. **Catch issues early**: Use `devWarn` for deprecated features
2. **Assert preconditions**: Use `devAssert` to validate assumptions
3. **Provide helpful messages**: Include guidance on how to fix issues
4. **Don't overuse**: Too many warnings create noise

---

## 🧪 Testing Error Handling

### Testing Error Boundaries

```tsx
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@smart-input/core';

// Component that throws an error
function ThrowError() {
  throw new Error('Test error');
}

describe('ErrorBoundary', () => {
  it('catches and displays errors', () => {
    // Suppress console errors in tests
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary errorMessage="Test failed">
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Test failed')).toBeInTheDocument();
    
    spy.mockRestore();
  });
  
  it('calls onError callback', () => {
    const onError = vi.fn();
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.any(Error),
        errorInfo: expect.any(Object),
        timestamp: expect.any(Date),
      })
    );
    
    spy.mockRestore();
  });
});
```

### Testing Logger

```typescript
import { createLogger, enableDebug, disableDebug } from '@smart-input/core';

describe('Logger', () => {
  beforeEach(() => {
    disableDebug();
  });
  
  it('only logs when enabled', () => {
    const spy = vi.spyOn(console, 'log');
    const log = createLogger('test');
    
    log('Message');
    expect(spy).not.toHaveBeenCalled();
    
    enableDebug('test');
    log('Message');
    expect(spy).toHaveBeenCalled();
    
    spy.mockRestore();
  });
});
```

---

## 🔗 Related Documentation

- [User Guide](./USER_GUIDE.md) - General usage information
- [API Reference](./API.md) - Programmatic API
- [Testing Guide](./TESTS.md) - Testing strategies
- [Component Reference](./COMPONENTS.md) - Component documentation

---

For questions or issues, see [CONTRIBUTING.md](../CONTRIBUTING.md).
