# Unit Testing with Vitest

This project uses [Vitest](https://vitest.dev/) for unit testing across all packages.

## Running Tests

### Run all unit tests
```bash
pnpm test
```

### Run tests in watch mode
```bash
pnpm test --watch
```

### Run tests with UI
```bash
pnpm test:ui
```

### Run unit tests with coverage
```bash
pnpm test:coverage
```

### Run E2E tests
```bash
pnpm test:e2e
```

### Run E2E tests with UI
```bash
pnpm test:e2e:ui
```

### Run combined coverage (unit + E2E)
```bash
pnpm test:coverage:combined
```

This command:
1. Runs unit tests with Vitest coverage
2. Runs E2E tests with Istanbul coverage instrumentation
3. Merges both coverage reports using NYC
4. Generates a combined HTML, text, and LCOV report

### Run tests for a specific package
```bash
# Core package
pnpm --filter @smart-input/core test

# Typeahead package
pnpm --filter @smart-input/typeahead test

# Any package
pnpm --filter @smart-input/<package-name> test
```

## Test Structure

Each package has its own test configuration and tests are co-located with source files:

```
packages/
├── core/
│   ├── vitest.config.ts
│   └── src/
│       ├── utils/
│       │   ├── constants.ts
│       │   └── constants.test.ts  ← Tests next to source
│       └── types/
│           ├── block.ts
│           └── block.test.ts
├── typeahead/
│   ├── vitest.config.ts
│   └── src/
│       └── TypeaheadLookup/
│           ├── TypeaheadLookup.tsx
│           └── TypeaheadLookup.test.tsx
└── ...
```

## Test Files

Test files follow these naming conventions:
- `*.test.ts` - For TypeScript utility/logic tests
- `*.test.tsx` - For React component tests
- `*.spec.ts` - Alternative convention (less common in this project)

## Available Packages

All packages have unit testing configured:

- ✅ **@smart-input/core** - Core editor components and utilities
- ✅ **@smart-input/typeahead** - Typeahead/autocomplete functionality
- ✅ **@smart-input/commitnotifier** - Commit history and submission
- ✅ **@smart-input/reactblocks** - React component blocks
- ✅ **@smart-input/dragblocks** - Drag and drop block reordering
- ✅ **@smart-input/dropcontent** - File drop handling

## Testing Dependencies

- **vitest** - Test framework (Vite-native, Jest-compatible)
- **@vitest/ui** - Visual test UI
- **@testing-library/react** - React component testing utilities
- **@testing-library/jest-dom** - Custom matchers for DOM assertions
- **@testing-library/user-event** - User interaction simulation
- **jsdom** - DOM implementation for Node.js

## Configuration

### Root Configuration

[vitest.config.ts](../vitest.config.ts) provides base configuration shared across all packages:

- **Environment**: jsdom (browser-like environment)
- **Globals**: Enabled (no need to import `describe`, `it`, `expect`)
- **Coverage**: v8 provider with HTML, JSON, and text reports
- **Setup**: Auto-loads `@testing-library/jest-dom` matchers

### Package Configurations

Each package has its own `vitest.config.ts` that extends the root config and adds package-specific settings:

- Custom test name
- Package-specific includes/excludes
- Path aliases (if needed)

## Writing Tests

### Basic Test Example

```typescript
import { describe, it, expect } from 'vitest';

describe('MyUtility', () => {
  it('should do something', () => {
    const result = myFunction();
    expect(result).toBe(expectedValue);
  });
});
```

### Component Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Testing with SmartInput Context

Many components require the SmartInput context:

```typescript
import { SmartInput, Editor } from '@smart-input/core';
import { MyExtension } from './MyExtension';

describe('MyExtension', () => {
  it('should work within SmartInput', () => {
    render(
      <SmartInput>
        <MyExtension />
        <Editor />
      </SmartInput>
    );
    // Test your component
  });
});
```

## Current Test Status

### Initial Tests Created

As of December 2025, basic test structure is in place:

- ✅ **Core Package**: Constants tests, utility function placeholders
- ✅ **Typeahead**: Component test placeholders
- ✅ **CommitNotifier**: Component test placeholders
- ✅ **ReactBlocks**: Component test placeholders
- ✅ **DragBlocks**: Handler test placeholders
- ✅ **DropContent**: Handler test placeholders

### Next Steps for Test Development

1. **Expand utility tests** - Test pure functions in `/utils` folders
2. **Add hook tests** - Test custom React hooks in isolation
3. **Component integration tests** - Test component behavior with user interactions
4. **State management tests** - Test Zustand store logic
5. **Edge cases** - Test error handling, boundary conditions
6. **Increase coverage** - Aim for 80%+ coverage on critical code paths

## CI Integration

Unit tests are run in CI via GitHub Actions. See [.github/workflows/ci.yml](../.github/workflows/ci.yml).

To run tests locally as CI does:

```bash
pnpm build
pnpm test --run
```

## Coverage Reports

### Unit Test Coverage Only

Generate coverage from unit tests:

```bash
pnpm test:coverage
```

### Combined Coverage (Unit + E2E)

For the most comprehensive coverage report that includes both unit tests and E2E test coverage:

```bash
pnpm test:coverage:combined
```

This runs:
1. **Vitest** unit tests with v8 coverage provider
2. **Playwright/Cucumber** E2E tests with Istanbul instrumentation via `vite-plugin-istanbul`
3. **NYC** to merge coverage reports

### Coverage Files

Coverage reports are generated in `coverage/` directory:
- `coverage/index.html` - Interactive HTML report (open in browser)
- `coverage/lcov-report/index.html` - LCOV HTML report
- `coverage/coverage-final.json` - JSON report
- `coverage/lcov.info` - LCOV format (for CI and Codecov integration)

### CI Coverage

In CI, we collect combined coverage from both unit and E2E tests:
- Unit tests run first with Vitest coverage
- E2E tests run with Istanbul instrumentation enabled
- NYC merges both coverage reports
- Combined report is uploaded to Codecov

### Current Coverage Thresholds

The project has baseline coverage thresholds to prevent regression:

- **Lines**: 0.5%
- **Functions**: 0.2%
- **Branches**: 0.1%
- **Statements**: 0.5%

These are intentionally low starting thresholds. As test coverage improves, these should be gradually increased.

### Coverage Goals

Target coverage levels (to be achieved incrementally):

- **Critical packages** (core, state management): 80%+
- **Extension packages** (typeahead, commitnotifier, etc.): 70%+
- **Utility functions**: 90%+
- **Overall project**: 60%+

### Viewing Coverage Reports

After running `pnpm test:coverage`, open the HTML report:

```bash
# Windows
start coverage/index.html

# macOS
open coverage/index.html

# Linux
xdg-open coverage/index.html
```

The report shows:
- File-by-file coverage breakdown
- Uncovered line numbers
- Branch coverage details
- Interactive code highlighting

## Debugging Tests

### VS Code Debugging

You can debug tests in VS Code:

1. Set breakpoints in your test file
2. Run the test in watch mode
3. Attach the VS Code debugger

### Console Logging

Use `console.log()` in tests for quick debugging:

```typescript
it('should work', () => {
  const result = myFunction();
  console.log('Result:', result); // Will show in test output
  expect(result).toBe(expected);
});
```

### Vitest UI

The UI provides a visual way to debug tests:

```bash
pnpm test:ui
```

Opens a browser interface where you can:
- See test results visually
- Filter and run specific tests
- View coverage
- Inspect test execution

## Best Practices

1. **Keep tests focused** - One concept per test
2. **Use descriptive names** - Test names should explain what they test
3. **Arrange-Act-Assert** - Structure tests clearly
4. **Test behavior, not implementation** - Focus on what, not how
5. **Mock external dependencies** - Keep tests isolated
6. **Don't test libraries** - Test your code, not React or Zustand
7. **Avoid testing React internals** - Use Testing Library principles

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
- [User Event](https://testing-library.com/docs/user-event/intro)

## Questions?

See [CONTRIBUTING.md](../CONTRIBUTING.md) for general contribution guidelines or open an issue for testing-specific questions.
