# Code Coverage Setup

> **Note**: Currently, combined coverage only includes unit test coverage. E2E coverage integration with vite-plugin-istanbul is a future enhancement.

This project uses Vitest with V8 coverage provider for unit test coverage tracking.

## Coverage Providers

### Unit Tests - Vitest + V8
- **Tool**: Vitest with V8 coverage provider
- **Command**: `pnpm test:coverage`
- **What it covers**: Pure unit tests, utility functions, isolated components
- **Location**: `packages/*/src/**/*.test.{ts,tsx}`

### E2E Tests - Coverage Collection (Future Enhancement)
- **Tool**: vite-plugin-istanbul + Playwright/Cucumber (planned)
- **Status**: Configuration added but not yet functional
- **What it will cover**: Real browser interactions, integration flows, full app behavior
- **Location**: `packages/test/tests/**/*.feature`

### Combined Coverage - NYC
- **Tool**: NYC (Istanbul's CLI)
- **Command**: `pnpm test:coverage:combined`
- **What it does**: Currently runs unit tests and generates coverage report via NYC
- **Future**: Will merge unit test and E2E test coverage into a single report

## How It Works

### 1. Unit Test Coverage (Vitest)
```bash
pnpm test:coverage
```

- Vitest runs with v8 coverage provider
- Generates coverage for tested utility functions and components
- Creates JSON coverage output
- Meets configured thresholds

### 2. E2E Test Coverage (Future)
```bash
pnpm test:e2e
```

- E2E tests run via Playwright/Cucumber
- Coverage instrumentation infrastructure is in place
- Extraction of `window.__coverage__` data needs implementation
- Will save coverage data to `.nyc_output/`

### 3. Combined Coverage
```bash
pnpm test:coverage:combined
```

The `scripts/combined-coverage.js` script currently:
1. Runs unit tests with coverage (Vitest)
2. Skips E2E tests (to avoid hanging processes)
3. Generates coverage report using NYC

**Future enhancements**:
- Extract coverage from browser during E2E tests
- Fix process cleanup after E2E test runs
- Merge unit and E2E coverage data

## Coverage Thresholds

Configured in [.nycrc.json](.nycrc.json):

```json
{
  "lines": 0.5,
  "statements": 0.5,
  "functions": 0.2,
  "branches": 0.1
}
```

These are intentionally low baseline thresholds to prevent regression. They should be gradually increased as test coverage improves.

## Configuration Files

### [vitest.config.ts](vitest.config.ts)
- Configures V8 coverage for unit tests
- Sets file includes/excludes
- Defines Vitest-specific thresholds

### [.nycrc.json](.nycrc.json)
- Configures NYC for combined coverage
- Sets global thresholds
- Defines reporters (HTML, text, LCOV)

### [packages/test/vite.config.ts](packages/test/vite.config.ts)
- Includes `vite-plugin-istanbul`
- Instruments code during E2E test runs
- Collects coverage in browser

## CI/CD Integration

In [.github/workflows/ci.yml](.github/workflows/ci.yml):

1. Build packages
2. Install Playwright browsers
3. Run unit tests with coverage
4. Run E2E tests (coverage auto-collected)
5. Merge coverage with NYC
6. Upload to Codecov

## Viewing Coverage

### HTML Report
```bash
# After running coverage
start coverage/index.html    # Windows
open coverage/index.html     # macOS
xdg-open coverage/index.html # Linux
```

### Terminal Output
Coverage summary is displayed in the terminal after running tests.

### Codecov
Coverage is automatically uploaded to Codecov in CI for the `main` branch.

## Best Practices

1. **Run combined coverage locally before pushing**:
   ```bash
   pnpm test:coverage:combined
   ```

2. **Check coverage for specific packages**:
   ```bash
   pnpm --filter @smart-input/core test:coverage
   ```

3. **Don't commit coverage files**:
   - `coverage/` - in .gitignore
   - `.nyc_output/` - in .gitignore

4. **Gradually increase thresholds**:
   - Start with baseline (current: ~0.5%)
   - Increase by 5-10% increments
   - Target: 60%+ overall, 80%+ for critical packages

## Troubleshooting

### E2E coverage not collected
- Ensure `vite-plugin-istanbul` is in `packages/test/vite.config.ts`
- Check that test app is built with instrumentation
- Verify `.nyc_output/` directory contains coverage files

### Coverage thresholds failing
- Check `.nycrc.json` for current thresholds
- Review `coverage/index.html` to see which files are uncovered
- Add more tests to increase coverage

### Combined coverage script fails
- Ensure all dependencies are installed: `pnpm install`
- Check that both unit and E2E tests pass individually
- Review `scripts/combined-coverage.js` for errors

## Future Improvements

- [ ] Per-package coverage thresholds
- [ ] Coverage diff in PRs
- [ ] Visual coverage trends over time
- [ ] Coverage badges per package
- [ ] Automated coverage increase reminders
