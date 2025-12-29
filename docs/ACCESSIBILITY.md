# Accessibility Features

Open Input is designed with accessibility as a core priority, ensuring that all users, regardless of their abilities, can effectively use the editor and its components.

## Overview

The Open Input editor provides comprehensive accessibility features including:

- Full keyboard navigation support
- ARIA labels and semantic HTML
- Screen reader compatibility
- Color contrast compliance
- Focus management
- Automated accessibility testing

## Keyboard Navigation

### Basic Navigation

All editor functions are accessible via keyboard:

| Action | Keyboard Shortcut |
|--------|------------------|
| Navigate to editor | `Tab` |
| Navigate backwards | `Shift + Tab` |
| Move cursor left | `Arrow Left` |
| Move cursor right | `Arrow Right` |
| Move to start of line | `Home` |
| Move to end of line | `End` |
| Create new line | `Enter` |
| Delete character | `Backspace` or `Delete` |

### Typeahead Navigation

When the typeahead dropdown appears:

| Action | Keyboard Shortcut |
|--------|------------------|
| Navigate down suggestions | `Arrow Down` |
| Navigate up suggestions | `Arrow Up` |
| Select suggestion | `Enter` |
| Close dropdown | `Escape` |

The typeahead component includes proper ARIA attributes:
- `role="listbox"` or `role="menu"` for the dropdown container
- Appropriate ARIA labels for screen readers
- Focus management for keyboard users

### React Blocks

Interactive React components embedded in the editor are fully keyboard accessible:

- Tab navigation reaches all interactive elements
- Focus indicators clearly show the active element
- All buttons and controls work with `Enter` or `Space`

## ARIA Support

### Editor

The main editor element includes:

- `aria-label` or `aria-labelledby` for identification
- Proper `contenteditable` attributes
- Role attributes when appropriate

### Typeahead

The typeahead component implements:

- `role="listbox"` or `role="menu"` for dropdown
- `role="option"` for individual suggestions
- `aria-activedescendant` for tracking selected option
- `aria-expanded` state

### Modals and Dialogs

Any modal dialogs include:

- `role="dialog"` or `aria-modal="true"`
- Focus trapping to keep keyboard users within the modal
- Proper focus restoration when closed

## Screen Reader Support

Open Input is tested with popular screen readers including:

- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS)
- TalkBack (Android)

### Best Practices

The editor follows these screen reader best practices:

1. **Semantic HTML**: Uses proper HTML5 elements
2. **Descriptive Labels**: All interactive elements have clear labels
3. **Status Updates**: Dynamic changes are announced via ARIA live regions
4. **Logical Tab Order**: Elements follow a natural reading order

## Color Contrast

All visual elements meet WCAG 2.1 Level AA requirements:

- Text has a minimum contrast ratio of 4.5:1
- Large text has a minimum contrast ratio of 3:1
- Interactive elements are clearly distinguishable
- Focus indicators have sufficient contrast

## Focus Management

The editor provides clear focus indicators:

- Visible focus outlines on all interactive elements
- High-contrast focus styles for better visibility
- Proper focus order following visual layout
- No keyboard traps (users can always navigate away)

## Automated Testing

### E2E Accessibility Tests

The project includes comprehensive automated accessibility tests using:

- **axe-core**: Industry-leading accessibility testing engine
- **@axe-core/playwright**: Integration with Playwright E2E tests
- **WCAG 2.1 Coverage**: Tests against WCAG 2.1 Level A and AA standards

### Running Accessibility Tests

```bash
# Run all E2E tests including accessibility tests
pnpm test:e2e

# Run only accessibility feature tests
pnpm test:e2e -- tests/features/accessibility.feature
```

### Test Coverage

Accessibility tests verify:

1. **No Critical Violations**: Pages must have no critical or serious accessibility issues
2. **Keyboard Navigation**: All functionality accessible via keyboard
3. **ARIA Labels**: Proper labeling of interactive elements
4. **Color Contrast**: Compliance with WCAG AA standards
5. **Focus Management**: Proper focus indicators and tab order
6. **Screen Reader Support**: Semantic HTML and ARIA attributes

### Test Scenarios

The [accessibility.feature](../packages/test/tests/features/accessibility.feature) file includes tests for:

- Basic keyboard navigation
- Arrow key navigation within editor
- Home/End key functionality
- Tab/Shift+Tab navigation
- Enter, Backspace, and Delete keys
- Color contrast compliance
- Interactive element accessibility
- Screen reader compatibility

## Compliance

Open Input aims to comply with:

- **WCAG 2.1 Level AA**: Web Content Accessibility Guidelines
- **Section 508**: U.S. federal accessibility standards
- **EN 301 549**: European accessibility standard
- **ARIA 1.2**: Accessible Rich Internet Applications specification

## Known Limitations

While we strive for full accessibility, some areas are still being improved:

- Complex drag-and-drop operations may require mouse interaction
- Some visual feedback relies on color (we're working on additional indicators)

## Contributing

We welcome contributions to improve accessibility! See our [Contributing Guide](../CONTRIBUTING.md) for details on:

- Reporting accessibility issues
- Submitting accessibility improvements
- Testing with assistive technologies

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [axe-core Documentation](https://github.com/dequelabs/axe-core)
- [WebAIM Resources](https://webaim.org/)

## Feedback

If you encounter any accessibility issues or have suggestions for improvement, please:

1. [Open an issue](https://github.com/markgregg/smart-input/issues) on GitHub
2. Include your assistive technology details (screen reader, version, browser)
3. Describe the expected vs. actual behavior
4. Provide steps to reproduce

We take accessibility seriously and will prioritize fixes for accessibility issues.
