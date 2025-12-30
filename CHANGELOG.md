# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-12-30

### Added
- Comprehensive documentation suite including component reference, API guide, user guide, test documentation, and extension development guide
- GitHub Actions CI/CD workflows for automated testing, linting, and releases
- Pre-commit hooks with husky and lint-staged for code quality
- Code coverage reporting with Playwright
- Example implementations for common use cases
- GitHub issue and PR templates
- Conventional commits support with commitlint
- Changesets for automated versioning and publishing
- JSDoc comments for public APIs

### Changed
- CommitNotifier history navigation behavior: Up arrow now stops at oldest entry, Down arrow only works when in history mode
- Test scripts now run build step before executing E2E tests
- Synced root package version with sub-packages (1.0.0)

### Fixed
- Test execution now runs against latest built code

## [0.0.7] - 2025-12-14

### Added
- Initial release with core editor functionality
- SmartInput and Editor components
- TypeaheadLookup component for autocomplete
- DropContentHandler for drag and drop support
- CommitNotifier for content submission with history
- Comprehensive API with 15 methods for content manipulation
- State management with Zustand
- Support for Text, Styled, Image, and Document block types
- Playwright + Cucumber E2E test suite
- Monorepo structure with pnpm workspaces

### Features
- Multi-style text input with inline formatting
- Block-based content model
- Customizable styling and theming
- Extension component support
- Keyboard navigation and shortcuts
- Copy/paste support
- Rich text editing capabilities

[Unreleased]: https://github.com/markgregg/smart-input/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/markgregg/smart-input/releases/tag/v1.0.0
[0.0.7]: https://github.com/markgregg/smart-input/releases/tag/v0.0.7
