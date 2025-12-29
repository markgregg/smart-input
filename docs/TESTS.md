# Test Documentation

This document explains the Playwright test suite for the smart-input library, including what each test module tests and how to write and run tests.

## Table of Contents
- [Overview](#overview)
- [Test Setup](#test-setup)
- [Running Tests](#running-tests)
- [Test Modules](#test-modules)
  - [Editor Tests](#editor-tests)
  - [TypeaheadLookup Tests](#typeaheadlookup-tests)
  - [DropContentHandler Tests](#dropcontenthandler-tests)
  - [CommitNotifier Tests](#commitnotifier-tests)
- [Test Utilities](#test-utilities)
- [Writing New Tests](#writing-new-tests)
- [Debugging Tests](#debugging-tests)

---

## Overview

The test suite uses:
- **Playwright**: For end-to-end browser automation
- **Cucumber**: For BDD (Behavior-Driven Development) style tests using Gherkin syntax
- **Test Application**: A dedicated test app in `packages/test` that demonstrates all features

Tests are written in a human-readable format using Gherkin (Given-When-Then) syntax, making them easy to understand and maintain.

---

## Test Setup

### Project Structure

```
packages/test/
├── tests/
│   ├── features/              # Gherkin feature files
│   │   ├── editor.feature
│   │   ├── typeahead.feature
│   │   ├── dragdrop.feature
│   │   └── commitnotifier.feature
│   ├── steps/                 # Step implementations
│   │   ├── editor.steps.ts
│   │   ├── typeahead.steps.ts
│   │   ├── dragdrop.steps.ts
│   │   └── commitnotifier.steps.ts
│   └── hooks/
│       └── hooks.ts           # Test lifecycle hooks
├── src/                       # Test application
│   └── components/
│       └── App/
│           └── App.tsx        # Demo app with all features
├── playwright.config.ts       # Playwright configuration
└── cucumber.mjs              # Cucumber configuration
```

### Configuration

**Cucumber Configuration** (`cucumber.mjs`):
- Feature files: `tests/features/**/*.feature`
- Step definitions: `tests/steps/**/*.steps.ts`
- Format: Progress reporter
- Requires: ts-node for TypeScript support

**Test Hooks** (`tests/hooks/hooks.ts`):
- Automatically starts dev server on port 3001 before tests
- Cleans up any existing processes on port 3001
- Launches Chromium browser for each test
- Grants clipboard permissions for paste tests
- Captures dev server logs for debugging

**Vite Dev Server**:
- Port: 3001 (strict port mode - fails if already in use)
- Auto-open browser: Disabled during tests
- Hot Module Replacement (HMR): Enabled

---

## Running Tests

### Development

```bash
# Build all packages and run tests (recommended)
npm run test

# Or using pnpm directly
pnpm build && pnpm --filter @smart-input/test test

# Run tests only (assumes packages already built)
pnpm --filter @smart-input/test test
```

### Important Notes

- Tests automatically start a dev server on port 3001
- The server is stopped automatically after tests complete
- If tests fail to start, ensure port 3001 is not in use
- Tests require all packages to be built first

### Debugging

```bash
# View test output in detail
pnpm --filter @smart-input/test test

# Run with headed browser (not currently supported with Cucumber)
# Use Playwright UI instead:
pnpm --filter @smart-input/test test:ui
```

---

## Test Modules

### Editor Tests

**File**: `tests/features/editor.feature`

**Purpose**: Tests the core Editor component functionality including basic text input, paste operations, line breaks, undo/redo, and keyboard navigation.

#### Test Scenarios

##### 1. Editor Component Renders Successfully
```gherkin
Scenario: Editor component renders successfully
  Given I navigate to the test app
  Then the editor component should be visible
  And the editor should be ready for input
```
**Tests**: Basic rendering and initialization.

##### 2. User Can Input Text
```gherkin
Scenario: User can input text in Editor
  Given I navigate to the test app
  When I click in the editor input area
  And I type "Hello World"
  Then the editor value should contain "Hello World"
```
**Tests**: Text input functionality and content verification.

##### 3. Editor Handles Paste Operations
```gherkin
Scenario: Editor handles paste operations
  Given I navigate to the test app
  When I click in the editor input area
  And I paste "Pasted content"
  Then the editor should contain "Pasted content"
```
**Tests**: Clipboard paste operations.

##### 4. Editor Creates New Line on Enter
```gherkin
Scenario: Editor creates new line on Enter key press
  Given I navigate to the test app with line breaks enabled
  When I click in the editor input area
  And I type "First line"
  And I press Enter
  And I type "Second line"
  Then the editor should contain "First line"
  And the editor should contain "Second line"
  And the editor should have 2 lines
```
**Tests**: Multi-line input with `enableLineBreaks` enabled.

##### 5. Multiple Carriage Returns
```gherkin
Scenario: Multiple carriage returns create multiple lines
  Given I navigate to the test app with line breaks enabled
  When I click in the editor input area
  And I type "Line 1"
  And I press Enter
  And I press Enter
  And I type "Line 3"
  Then the editor should have 3 lines
```
**Tests**: Multiple consecutive line breaks and empty lines.

##### 6. User Can Delete Text
```gherkin
Scenario: User can delete text with Backspace
  Given I navigate to the test app
  When I click in the editor input area
  And I type "Hello World"
  And I press Backspace 5 times
  Then the editor value should contain "Hello "
```
**Tests**: Backspace key functionality and character deletion.

##### 7. Undo Changes with Ctrl+Z
```gherkin
Scenario: User can undo changes with Ctrl+Z
  Given I navigate to the test app
  When I click in the editor input area
  And I type "First"
  And I type " Second"
  And I press Ctrl+Z
  Then the editor value should contain "First"
```
**Tests**: Undo functionality and buffer management.

#### Key Functionality Tested
- ✅ Component rendering
- ✅ Text input
- ✅ Paste operations
- ✅ Line breaks (when enabled)
- ✅ Backspace deletion
- ✅ Undo/Redo (Ctrl+Z/Ctrl+Y)
- ✅ Keyboard navigation
- ✅ Content verification

---

### TypeaheadLookup Tests

**File**: `tests/features/typeahead.feature`

**Purpose**: Tests the TypeaheadLookup component's autocomplete functionality, including suggestion display, selection, navigation, and styled block insertion.

#### Test Scenarios

##### 1. Typeahead Appears When Typing
```gherkin
Scenario: Typeahead appears when typing matching text
  Given I navigate to the test app
  When I click in the editor input area
  And I type "tes"
  Then the typeahead dropdown should be visible
  And the typeahead should show suggestions
```
**Tests**: Dropdown appearance based on typed text and `minSearchLength`.

##### 2. Suggestion Selection with Click
```gherkin
Scenario: Typeahead suggestion can be selected with click
  Given I navigate to the test app
  When I click in the editor input area
  And I type "tes"
  And I wait for typeahead to appear
  And I click the first typeahead suggestion
  Then the editor should contain "test"
```
**Tests**: Mouse click selection and text replacement.

##### 3. Suggestion Selection with Enter Key
```gherkin
Scenario: Typeahead suggestion can be selected with Enter key
  Given I navigate to the test app
  When I click in the editor input area
  And I type "fre"
  And I wait for typeahead to appear
  And I press ArrowDown
  And I press Enter
  Then the editor should contain "fred"
```
**Tests**: Keyboard selection (Arrow + Enter).

##### 4. Typeahead Navigation with Arrow Keys
```gherkin
Scenario: Typeahead can be navigated with arrow keys
  Given I navigate to the test app
  When I click in the editor input area
  And I type "fen"
  And I wait for typeahead to appear
  And I press ArrowDown
  And I press Enter
  Then the editor should contain "fennel"
```
**Tests**: Arrow key navigation through suggestions list.

##### 5. Typeahead Closes When Text No Longer Matches
```gherkin
Scenario: Typeahead closes when text no longer matches
  Given I navigate to the test app
  When I click in the editor input area
  And I type "tes"
  And I wait for typeahead to appear
  And I type "xyz"
  Then the typeahead dropdown should not be visible
```
**Tests**: Dropdown dismissal when no matches found.

##### 6. Typeahead Inserts Styled Text
```gherkin
Scenario: Typeahead inserts styled text on selection
  Given I navigate to the test app
  When I click in the editor input area
  And I type "tes"
  And I wait for typeahead to appear
  And I click the first typeahead suggestion
  Then the editor should contain styled text
```
**Tests**: Styled block insertion with custom CSS.

#### Key Functionality Tested
- ✅ Dropdown display logic
- ✅ Debounce timing
- ✅ Minimum search length
- ✅ Mouse click selection
- ✅ Keyboard navigation (Up/Down arrows)
- ✅ Enter key selection
- ✅ Styled block insertion
- ✅ Dropdown positioning
- ✅ Match filtering
- ✅ Dropdown dismissal

---

### DropContentHandler Tests

**File**: `tests/features/dragdrop.feature`

**Purpose**: Tests the DropContentHandler component's file drop functionality, including image and document handling, visual feedback, and block deletion.

#### Test Scenarios

##### 1. Drag and Drop Zone Visibility
```gherkin
Scenario: Drag and drop zone is visible
  Given I navigate to the test app
  Then the drag and drop zone should be visible
```
**Tests**: Component rendering and drop zone availability.

##### 2. Drag Over Shows Drop Indicator
```gherkin
Scenario: Drag over shows drop indicator
  When I drag a file over the drop zone
  Then the drop indicator should be visible
```
**Tests**: Visual feedback during drag operations.

##### 3. Drag Leave Hides Indicator
```gherkin
Scenario: Drag leave hides drop indicator
  When I drag a file over the drop zone
  And I drag the file away from the drop zone
  Then the drop indicator should not be visible
```
**Tests**: Indicator cleanup on drag leave.

##### 4. Drop Image Creates ImageBlock
```gherkin
Scenario: Drop an image file creates an ImageBlock
  When I drop an image file "test-image.png" into the drop zone
  Then an image element should be displayed in the editor
  And the image should have the correct source
```
**Tests**: Image file handling and ImageBlock creation.

##### 5. Drop PDF Creates DocumentBlock
```gherkin
Scenario: Drop a PDF document creates a DocumentBlock
  When I drop a document file "test-document.pdf" into the drop zone
  Then a document icon should be displayed in the editor
  And the document icon should represent a PDF file
```
**Tests**: Document file handling and DocumentBlock creation.

##### 6. Drop Multiple Files
```gherkin
Scenario: Drop multiple files creates multiple blocks
  When I drop multiple files into the drop zone
    | filename          | type               |
    | test-image1.png   | image/png          |
    | test-image2.jpg   | image/jpeg         |
    | test-document.pdf | application/pdf    |
  Then the editor should contain 3 file blocks
  And there should be 2 image elements
  And there should be 1 document icon
```
**Tests**: Multiple file drop and block creation.

##### 7. Image Deletion
```gherkin
Scenario: Image can be deleted from editor
  When I drop an image file "test-image.png" into the drop zone
  And I select the image in the editor
  And I press Delete
  Then the image should be removed from the editor
```
**Tests**: Image block deletion with Delete key.

##### 8. Document Icon Deletion
```gherkin
Scenario: Document icon can be deleted from editor
  When I drop a document file "test-doc.pdf" into the drop zone
  And I select the document icon in the editor
  And I press Delete
  Then the document icon should be removed from the editor
```
**Tests**: Document block deletion with Delete key.

##### 9. Multiple Image Type Support
```gherkin
Scenario: Multiple image types are supported
  When I drop files of different image types
  Then all images should be displayed correctly
```
**Tests**: Support for PNG, JPEG, GIF, etc.

#### Key Functionality Tested
- ✅ Drop zone rendering
- ✅ Drag over visual feedback
- ✅ Drag leave cleanup
- ✅ Image file detection
- ✅ Document file detection
- ✅ ImageBlock creation and display
- ✅ DocumentBlock creation and display
- ✅ Multiple file handling
- ✅ File type validation
- ✅ Block deletion
- ✅ Cursor position insertion

---

### CommitNotifier Tests

**File**: `tests/features/commitnotifier.feature`

**Purpose**: Tests the CommitNotifier component's submission functionality, including commit triggers, history management, and navigation.

#### Test Scenarios

##### 1. Commit on Enter Key
```gherkin
Scenario: CommitNotifier triggers onCommit when Enter key is pressed
  Given I navigate to the test app with commit notifier
  When I click in the editor input area
  And I type "Test commit text"
  And I press Enter
  Then the commit should be triggered with "Test commit text"
  And the editor should be empty
```
**Tests**: Basic commit functionality and editor clearing.

##### 2. History Saving
```gherkin
Scenario: CommitNotifier saves history when commit succeeds
  Given I navigate to the test app with history enabled
  When I click in the editor input area
  And I type "First commit"
  And I press Enter
  And I type "Second commit"
  And I press Enter
  Then the history should contain 2 items
  And localStorage should have "commit-history" key
```
**Tests**: History persistence to localStorage.

##### 3. Max History Limit
```gherkin
Scenario: CommitNotifier respects maxHistory limit
  Given I navigate to the test app with history enabled and maxHistory 2
  When I click in the editor input area
  And I type "Commit 1"
  And I press Enter
  And I type "Commit 2"
  And I press Enter
  And I type "Commit 3"
  And I press Enter
  Then the history should contain 2 items
  And the history should contain "Commit 3"
  And the history should contain "Commit 2"
  And the history should not contain "Commit 1"
```
**Tests**: History size limiting and oldest entry removal.

##### 4. Custom Storage Key
```gherkin
Scenario: CommitNotifier uses custom history storage key
  Given I navigate to the test app with custom storage key "my-custom-key"
  When I click in the editor input area
  And I type "Custom storage"
  And I press Enter
  Then localStorage should have "my-custom-key" key
  And localStorage should not have "commit-history" key
```
**Tests**: Custom localStorage key configuration.

##### 5. History Navigation with ArrowUp
```gherkin
Scenario: CommitNotifier navigates history with ArrowUp on first line
  Given I navigate to the test app with history enabled
  When I commit "First entry"
  And I commit "Second entry"
  And I click in the editor input area
  And I press ArrowUp
  Then the editor should contain "Second entry"
  And I press ArrowUp
  Then the editor should contain "First entry"
  And I press ArrowUp
  Then the editor should contain "First entry"
```
**Tests**: Backward history navigation with Arrow Up. The up key cycles back through history starting at the most recent entry and stops at the oldest entry.

##### 6. History Navigation with ArrowDown
```gherkin
Scenario: CommitNotifier navigates history with ArrowDown on last line
  Given I navigate to the test app with history enabled
  When I commit "First entry"
  And I commit "Second entry"
  And I commit "Third entry"
  And I click in the editor input area
  And I press ArrowUp
  Then the editor should contain "Third entry"
  And I press ArrowDown
  Then the editor should be empty
```
**Tests**: Forward history navigation with Arrow Down. The down key cycles forward through history back to the current entry (what you were typing).

##### 7. Complete History Cycle
```gherkin
Scenario: CommitNotifier cycles through history correctly
  Given I navigate to the test app with history enabled
  When I commit "First entry"
  And I commit "Second entry"
  And I commit "Third entry"
  And I click in the editor input area
  And I type "Current text"
  And I press ArrowUp
  Then the editor should contain "Third entry"
  And I press ArrowUp
  Then the editor should contain "Second entry"
  And I press ArrowUp
  Then the editor should contain "First entry"
  And I press ArrowDown
  Then the editor should contain "Second entry"
  And I press ArrowDown
  Then the editor should contain "Third entry"
  And I press ArrowDown
  Then the editor should contain "Current text"
  And I press ArrowDown
  Then the editor should contain "Current text"
```
**Tests**: Complete history navigation cycle. Up goes to older entries and stops at oldest. Down goes to newer entries and stops at current input. Down does nothing when already at current.

##### 8. Custom Key Combination
```gherkin
Scenario: CommitNotifier works with custom key combination
  Given I navigate to the test app with Ctrl+Enter commit key
  When I type "Custom key test"
  And I press Ctrl+Enter
  Then the commit should be triggered
```
**Tests**: Custom commit key combinations (e.g., Ctrl+Enter).

#### Key Functionality Tested
- ✅ Commit trigger on key press
- ✅ Editor clearing after commit
- ✅ onCommit callback invocation
- ✅ CommitItem conversion
- ✅ History saving to localStorage
- ✅ History size limiting
- ✅ Custom storage keys
- ✅ Arrow Up navigation (cycles back, stops at oldest)
- ✅ Arrow Down navigation (cycles forward, stops at current)
- ✅ Down key does nothing when not in history mode
- ✅ Custom key combinations
- ✅ Multi-line commit handling

---

## Test Utilities

### Step Definitions

Step definitions connect Gherkin steps to actual test code.

**Common Steps** (used across all tests):

```typescript
Given('I navigate to the test app', async function() {
  await this.page.goto('/');
  await this.page.waitForLoadState('networkidle');
});

When('I click in the editor input area', async function() {
  const editor = this.page.locator('[contenteditable="true"]');
  await editor.click();
});

When('I type {string}', async function(text: string) {
  await this.page.keyboard.type(text);
});

When('I press {word}', async function(key: string) {
  await this.page.keyboard.press(key);
});
```

**Custom Step Examples**:

```typescript
// Typeahead-specific
Then('the typeahead dropdown should be visible', async function() {
  const dropdown = this.page.locator('.typeahead-dropdown');
  await expect(dropdown).toBeVisible();
});

// DragDrop-specific
When('I drop an image file {string} into the drop zone', async function(filename: string) {
  const fileInput = this.page.locator('input[type="file"]');
  await fileInput.setInputFiles({
    name: filename,
    mimeType: 'image/png',
    buffer: Buffer.from('fake-image-data')
  });
});

// CommitNotifier-specific
Then('the commit should be triggered with {string}', async function(text: string) {
  // Check for commit event or state change
  const committed = await this.page.evaluate(() => window.lastCommit);
  expect(committed).toContain(text);
});
```

### Hooks

**hooks.ts** - Setup and teardown:

```typescript
// Before each scenario
Before(async function() {
  this.page = await this.browser.newPage();
});

// After each scenario
After(async function() {
  await this.page?.close();
});

// Before all tests
BeforeAll(async function() {
  // Start server if needed
});

// After all tests
AfterAll(async function() {
  // Cleanup
});
```

---

## Writing New Tests

### Step 1: Create Feature File

Create a new `.feature` file in `tests/features/`:

```gherkin
# tests/features/myfeature.feature
Feature: My New Feature

  Scenario: Feature does something
    Given I navigate to the test app
    When I perform an action
    Then I should see the result
```

### Step 2: Implement Step Definitions

Create corresponding step file in `tests/steps/`:

```typescript
// tests/steps/myfeature.steps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

When('I perform an action', async function() {
  const button = this.page.locator('button.my-action');
  await button.click();
});

Then('I should see the result', async function() {
  const result = this.page.locator('.result');
  await expect(result).toBeVisible();
  await expect(result).toHaveText('Expected Result');
});
```

### Step 3: Run the Test

```bash
pnpm test -- --grep "My New Feature"
```

### Best Practices

1. **Use descriptive scenario names** that explain what's being tested
2. **Keep scenarios focused** on a single feature or behavior
3. **Reuse step definitions** when possible
4. **Add wait conditions** for async operations:
   ```typescript
   await this.page.waitForSelector('.element');
   await this.page.waitForLoadState('networkidle');
   ```
5. **Use data tables** for testing multiple inputs:
   ```gherkin
   When I test with different inputs
     | input   | expected |
     | hello   | HELLO    |
     | world   | WORLD    |
   ```
6. **Add screenshots** for debugging:
   ```typescript
   await this.page.screenshot({ path: 'debug.png' });
   ```

---

## Debugging Tests

### Interactive Mode

Run tests with UI for step-by-step debugging:

```bash
pnpm test:ui
```

### Headed Mode

See the browser while tests run:

```bash
pnpm test -- --headed
```

### Debug Specific Test

```bash
pnpm test -- --grep "specific scenario name" --headed
```

### Add Debug Breakpoints

In step definitions:

```typescript
When('I perform an action', async function() {
  await this.page.pause(); // Opens Playwright Inspector
  const button = this.page.locator('button');
  await button.click();
});
```

### Check Test Output

Tests automatically:
- Take screenshots on failure
- Record videos (on retry)
- Log console messages
- Capture network requests

Find them in `packages/test/test-results/`.

### Common Debugging Tips

1. **Check element selectors**:
   ```typescript
   const element = this.page.locator('.my-selector');
   console.log(await element.count()); // Should be > 0
   ```

2. **Wait for elements**:
   ```typescript
   await this.page.waitForSelector('.element', { timeout: 5000 });
   ```

3. **Log page content**:
   ```typescript
   console.log(await this.page.content());
   ```

4. **Check console errors**:
   ```typescript
   this.page.on('console', msg => console.log(msg.text()));
   this.page.on('pageerror', err => console.error(err));
   ```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - uses: pnpm/action-setup@v2
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build packages
        run: pnpm build
      
      - name: Run E2E tests
        run: pnpm test
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: packages/test/test-results/
```

---

## Test Coverage

### Current Coverage

- **Editor**: 8 scenarios covering core functionality
- **TypeaheadLookup**: 6 scenarios covering autocomplete
- **DropContentHandler**: 9 scenarios covering file operations
- **CommitNotifier**: 7 scenarios covering submission and history

### Coverage Goals

- ✅ Basic functionality
- ✅ User interactions
- ✅ Keyboard navigation
- ✅ Error handling
- ✅ Edge cases

---

## Recent Improvements (December 2025)

### ✅ Immediate Fixes Implemented

1. **ESLint React Version Detection** - Fixed the "React version not specified" warning by adding automatic version detection to ESLint configuration.

2. **CI/CD Pipeline Enhanced** - Updated GitHub Actions workflow with:
   - Better test artifact collection (HTML reports, screenshots)
   - Automatic test result publishing
   - 30-day retention for debugging
   - Continue-on-error for better failure visibility

3. **Cross-Platform Port Cleanup** - Updated test hooks to work on Windows, Linux, and macOS:
   - Windows: Uses `netstat` and `taskkill`
   - Unix: Uses `lsof` and `kill`
   - Automatic platform detection

4. **Screenshot on Test Failure** - Automatically captures full-page screenshots when tests fail:
   - Saved to `packages/test/screenshots/`
   - Timestamped filenames
   - Uploaded as CI artifacts

5. **HTML Test Reporting** - Integrated Cucumber HTML formatter:
   - Generates `cucumber-report.html`
   - Better test result visualization
   - Uploaded as CI artifacts

### Test Infrastructure

The test suite now includes:
- ✅ Automatic dev server management (port 3001)
- ✅ Cross-platform port cleanup
- ✅ Browser automation with Playwright
- ✅ Screenshot capture on failures
- ✅ HTML test reports
- ✅ CI/CD integration with artifact uploads
- ✅ ESLint configuration without warnings

---

## Troubleshooting

### Common Issues

#### Port 3001 Already in Use

**Symptom**: Tests fail to start with "Port 3001 is in use" message or server switches to port 3002.

**Solution**:
```bash
# Windows
Get-NetTCPConnection -State Listen -LocalPort 3001 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

The test hooks now automatically clean up port 3001 before starting, but manual cleanup may be needed if tests are interrupted.

#### Tests Pass But CommitData Not Captured

**Symptom**: Tests that check `window.commitData` fail even though the UI works correctly.

**Solution**: Ensure the test App component exposes commit data to the window object:
```tsx
const handleCommit = (items: CommitItem[]) => {
  interface TestWindow extends Window {
    commitData?: unknown[];
  }
  const testWindow = window as TestWindow;
  if (!testWindow.commitData) {
    testWindow.commitData = [];
  }
  testWindow.commitData.push(items);
  return true;
};
```

#### History Tests Fail

**Symptom**: Tests checking localStorage history fail to find expected items.

**Solution**: Ensure test steps use the correct `HistoricBlock` format:
```typescript
// Correct format
const history = [[{ block: { type: 'text', text: 'content' } }]];

// When checking history
const hasText = history.some((historicBlocks: any[]) =>
  historicBlocks.some((hb: any) => {
    const block = hb.block || hb; // Handle both formats
    return 'text' in block && block.text.includes(text);
  }),
);
```

#### ESLint Warnings During Tests

**Symptom**: Dev server shows ESLint warnings that don't affect test results but clutter output.

**Solution**: These are expected and can be ignored during testing, or fix them:
- Prefix unused parameters with `_` (e.g., `_block`, `_event`)
- Use `console.warn()` or `console.error()` instead of `console.log()`
- Properly type window extensions with interfaces

---
- ✅ Error handling
- ⚠️ Edge cases (partial)
- ⚠️ Performance tests (planned)
- ⚠️ Accessibility tests (planned)

---

## Next Steps

- Review [Component Reference](./COMPONENTS.md) for component details
- See [API Reference](./API.md) for programmatic testing
- Check [Extension Development](./EXTENSION_DEVELOPMENT.md) for testing custom extensions
