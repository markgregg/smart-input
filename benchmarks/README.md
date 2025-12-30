# Performance Benchmarks

This directory contains performance benchmarks and results for the Open Input project.

## 📂 Directory Structure

```
benchmarks/
├── results/          # Benchmark results (JSON snapshots)
└── README.md        # This file
```

## 🏃 Running Benchmarks

### Component Rendering Benchmarks

```bash
# Run all benchmarks
pnpm bench

# Run with detailed output
pnpm bench --reporter=verbose

# Run in watch mode during development
pnpm bench --watch
```

### Bundle Size Benchmarks

```bash
# Generate bundle size report
pnpm benchmark
```

This creates timestamped JSON files in `results/` with:
- Package versions
- Bundle sizes (total and per-file)
- Comparison data

## 📊 Benchmark Results

Results are stored as JSON files with timestamps:
- `benchmark-[timestamp].json` - Bundle size snapshots
- `benchmark-results.json` - Vitest benchmark results

### Interpreting Results

**Bundle Size Results:**
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "benchmarks": [
    {
      "package": "core",
      "version": "0.0.7",
      "bundleSize": {
        "core.min.js": "25.43 KB",
        "core.min.mjs": "25.21 KB",
        "total": "50.64 KB"
      }
    }
  ]
}
```

**Vitest Benchmark Results:**
Shows execution times for component operations:
- Mean execution time
- Standard deviation
- Operations per second

## 🎯 Benchmark Types

### 1. Component Rendering
Located in `packages/*/src/__bench__/*.bench.tsx`

Tests rendering performance with:
- Empty content
- Small content (100 chars)
- Medium content (1000 chars)
- Large content (10000 chars)
- Complex extensions

### 2. Bundle Size
Tracks total bundle sizes and per-package sizes over time.

### 3. Build Performance
Can be measured manually with:
```bash
time pnpm build:prod
```

## 📈 Tracking Performance Over Time

### Compare Results

```bash
# View recent changes
git diff benchmarks/results/

# Compare specific runs
diff benchmarks/results/benchmark-[old].json benchmarks/results/benchmark-[new].json
```

### Performance Regression Detection

In CI, you can:
1. Run benchmarks on every PR
2. Compare with main branch results
3. Fail if performance degrades significantly

Example threshold checks:
- Bundle size increase > 10%
- Render time increase > 20%
- Build time increase > 15%

## 🚀 Adding New Benchmarks

### Component Benchmark

Create `packages/[package]/src/__bench__/[Component].bench.tsx`:

```typescript
import { bench, describe } from 'vitest';
import { render } from '@testing-library/react';
import { YourComponent } from '../YourComponent';

describe('YourComponent Performance', () => {
  bench('basic render', () => {
    render(<YourComponent />);
  });

  bench('render with props', () => {
    render(<YourComponent prop="value" />);
  });
});
```

### Operation Benchmark

```typescript
import { bench } from 'vitest';

bench('expensive operation', () => {
  // Your operation here
  const result = expensiveFunction();
});
```

## 💡 Best Practices

### Writing Benchmarks
- Focus on user-facing operations
- Test realistic scenarios
- Include edge cases (empty, small, large data)
- Benchmark critical paths

### Running Benchmarks
- Run on consistent hardware
- Close other applications
- Run multiple times for accuracy
- Compare against baseline

### Interpreting Results
- Look for trends, not absolute values
- Focus on relative changes
- Consider variance/standard deviation
- Test on different machines/environments

## 🔍 Performance Targets

### Bundle Sizes (gzipped)
- **@smart-input/core**: < 30 KB
- **@smart-input/typeahead**: < 15 KB
- **@smart-input/dragblocks**: < 10 KB
- **Other packages**: < 8 KB

### Render Performance
- **Empty editor**: < 5ms
- **Small content (100 chars)**: < 10ms
- **Medium content (1KB)**: < 25ms
- **Large content (10KB)**: < 50ms

### Re-render Performance
- **No changes**: < 1ms
- **Content update**: < 5ms
- **Extension update**: < 10ms

## 📊 Continuous Monitoring

### Local Development
```bash
# Run benchmarks before committing
pnpm bench
pnpm benchmark

# Check bundle sizes
pnpm size
```

### CI/CD Integration
```yaml
- name: Run benchmarks
  run: pnpm bench

- name: Check bundle sizes
  run: |
    pnpm benchmark
    pnpm size
```

## 🔗 Related Documentation

- [Performance Optimization Guide](../docs/PERFORMANCE.md)
- [Testing Guide](../docs/TESTS.md)

---

For questions or suggestions, see [CONTRIBUTING.md](../CONTRIBUTING.md).
