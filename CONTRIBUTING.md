# Contributing to Open Input

First off, thank you for considering contributing to Open Input! It's people like you that make Open Input such a great tool.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project and everyone participating in it is governed by a code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to gregg.mark@gmail.com.

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- pnpm 8.x or higher

### Setting Up Your Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/smart-input.git
   cd smart-input
   ```

3. Install dependencies:
   ```bash
   pnpm install
   ```

4. Create a branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Project Structure

This is a monorepo managed with pnpm workspaces:

- `packages/core` - Core editor components and API
- `packages/typeahead` - Typeahead/autocomplete extension
- `packages/dropcontent` - Drop content handler extension
- `packages/commitnotifier` - Commit notifier extension
- `packages/test` - E2E test suite with Playwright + Cucumber
- `docs/` - Comprehensive documentation

### Available Scripts

```bash
# Start development server
pnpm dev

# Build all packages
pnpm build

# Build production bundles
pnpm build:prod

# Run linting
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code with Prettier
pnpm prettier

# Run E2E tests
pnpm test

# Run E2E tests with UI
pnpm test:ui
```

### Making Changes

1. Make your changes in your feature branch
2. Add or update tests as necessary
3. Update documentation if you're changing functionality
4. Run tests to ensure everything passes
5. Run linting and fix any issues
6. Commit your changes following our commit message conventions

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types for all function parameters and return values
- Avoid using `any` type unless absolutely necessary
- Use interfaces for object types
- Export types that consumers might need

### React

- Use functional components with hooks
- Follow React best practices and patterns
- Keep components small and focused
- Use proper prop types (TypeScript interfaces)
- Avoid inline styles; use CSS modules instead

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons
- Follow the existing code style in the project
- Run `pnpm prettier` before committing

### ESLint

- Fix all linting errors before submitting PR
- Run `pnpm lint` to check for issues
- Run `pnpm lint:fix` to automatically fix issues

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning (formatting, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Changes to build process or auxiliary tools

### Examples

```bash
feat(core): add support for custom block types

Implement extensible block type system allowing users to define
custom block types with their own rendering logic.

Closes #123
```

```bash
fix(commitnotifier): prevent history navigation beyond bounds

Up arrow now stops at oldest entry instead of wrapping around.
Down arrow only works when actively navigating history.

Fixes #456
```

## Pull Request Process

1. **Update Documentation**: Ensure any new features or changes are documented
2. **Update Tests**: Add or update tests to cover your changes
3. **Update Changelog**: Add your changes to the `Unreleased` section in CHANGELOG.md
4. **Run All Checks**: Ensure all tests pass and linting is clean
5. **Create PR**: Open a pull request with a clear title and description
6. **Link Issues**: Reference any related issues in the PR description
7. **Request Review**: Wait for maintainer review and address feedback
8. **Squash Commits**: Consider squashing commits before merge if requested

### PR Title Format

Use conventional commit format for PR titles:

```
feat(typeahead): add custom filtering support
fix(dropcontent): resolve drag preview positioning
docs: update API reference for new methods
```

### PR Description Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
Describe the tests you ran and how to reproduce them

## Checklist
- [ ] My code follows the code style of this project
- [ ] I have updated the documentation accordingly
- [ ] I have added tests to cover my changes
- [ ] All new and existing tests passed
- [ ] I have updated the CHANGELOG.md
```

## Testing

### Running Tests

```bash
# Run all E2E tests
pnpm test

# Run tests with UI for debugging
pnpm test:ui
```

### Writing Tests

- Write E2E tests using Playwright + Cucumber (Gherkin syntax)
- Place feature files in `packages/test/tests/features/`
- Place step definitions in `packages/test/tests/steps/`
- Test files should end with `.feature` or `.steps.ts`
- Follow existing test patterns and conventions
- Ensure tests are deterministic and don't rely on timing

### Test Coverage

- Aim for high test coverage on new code
- Run coverage reports to identify gaps
- Focus on testing user-facing functionality and edge cases

## Documentation

### Updating Documentation

When adding features or making changes:

1. Update relevant sections in `docs/`:
   - `COMPONENTS.md` - Component reference
   - `API.md` - API documentation
   - `USER_GUIDE.md` - User implementation guide
   - `TESTS.md` - Test documentation
   - `EXTENSION_DEVELOPMENT.md` - Extension guide

2. Add JSDoc comments to public APIs
3. Include code examples where appropriate
4. Update README.md if necessary

### Documentation Style

- Use clear, concise language
- Include code examples
- Explain both what and why
- Use proper Markdown formatting
- Link to related sections

## Questions?

If you have questions or need help, feel free to:

- Open an issue for discussion
- Reach out to the maintainers
- Check existing documentation in the `docs/` folder

Thank you for contributing! 🎉
