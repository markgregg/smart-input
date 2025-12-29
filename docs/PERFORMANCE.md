# Performance Optimization Guide

This document describes the performance optimization strategies and tools available in the Open Input project.

---

## 📊 Bundle Analysis

### Analyzing All Packages

To analyze the bundle size of all packages with an interactive visualization:

```bash
pnpm analyze
```

This will:
- Build all packages in production mode
- Generate interactive treemap visualizations
- Open bundle analysis reports in your browser
- Show gzip and brotli compressed sizes

### Analyzing a Specific Package

To analyze a single package:

```bash
pnpm analyze:package @smart-input/core build:prod
```

### Understanding Bundle Reports

The bundle visualizer creates `dist/stats.html` files in each package showing:
- **Treemap view**: Visual representation of bundle composition
- **Module sizes**: Size contribution of each dependency
- **Compression ratios**: Gzip and Brotli sizes
- **Import paths**: How modules are bundled together

**What to look for:**
- Large dependencies that could be replaced or eliminated
- Duplicate dependencies across chunks
- Unexpectedly large modules
- Opportunities for code splitting

---

## 🌲 Tree-Shaking Verification

Tree-shaking ensures unused code is eliminated from production bundles.

### Running Verification

```bash
pnpm verify:treeshake
```

This checks:
- ✅ `sideEffects` field is properly configured
- ✅ ESM exports are available
- ✅ Package exports are defined
- ⚠️ Warns about wildcard re-exports that may reduce tree-shaking effectiveness

### Tree-Shaking Configuration

All packages are configured with:

```json
{
  "sideEffects": ["*.css", "*.less"],
  "module": "dist/[package].min.mjs",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/[package].min.mjs",
      "require": "./dist/[package].min.js"
    },
    "./style.css": "./dist/[package].min.css"
  }
}
```

**Best Practices:**
- Avoid `export *` wildcard exports in index files
- Use named exports instead: `export { Component } from './Component'`
- Mark side-effect-free modules explicitly
- Only include CSS/LESS files in sideEffects array

---

## 📈 Performance Benchmarks

### Running Benchmarks

```bash
# Run all performance benchmarks
pnpm bench

# Run benchmarks with detailed output
pnpm bench --reporter=verbose

# Run benchmarks in watch mode
pnpm bench --watch
```

### Bundle Size Benchmarks

To measure current bundle sizes:

```bash
pnpm benchmark
```

This creates a snapshot in `benchmarks/results/` with:
- Package versions
- Bundle sizes (total and per-file)
- Timestamp for comparison

**Track over time:**
```bash
# Compare with previous run
git diff benchmarks/results/
```

### Component Rendering Benchmarks

Benchmark files are located in `packages/*/src/__bench__/`:

```typescript
// Example: SmartInput.bench.tsx
import { bench, describe } from 'vitest';
import { render } from '@testing-library/react';
import { SmartInput } from '@smart-input/core';

describe('SmartInput Performance', () => {
  bench('render empty editor', () => {
    render(<SmartInput initialValue="" />);
  });

  bench('render with large content', () => {
    const content = 'Hello world! '.repeat(1000);
    render(<SmartInput initialValue={content} />);
  });
});
```

**Creating New Benchmarks:**
1. Create `*.bench.tsx` files in `__bench__/` folders
2. Use `bench()` from Vitest to define benchmarks
3. Focus on critical user paths and performance-sensitive operations
4. Test with various content sizes

---

## 🎯 Size Limits

The project uses `size-limit` to enforce bundle size constraints.

### Check Bundle Sizes

```bash
# Check if bundles are within limits
pnpm size

# Analyze why bundle is a certain size
pnpm size:why
```

Size limits are configured in `.size-limit.json` (if it exists) or package.json.

---

## ⚡ Code Splitting Strategies

### Dynamic Imports

For large components or features that aren't always needed:

```typescript
// Lazy load heavy components
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### Package-Level Splitting

Each package is independently bundled:
- **@smart-input/core**: Core editor functionality
- **@smart-input/typeahead**: Typeahead extension
- **@smart-input/dragblocks**: Drag & drop extension
- etc.

Import only what you need:

```typescript
// Good - tree-shakeable
import { SmartInput } from '@smart-input/core';

// Also good - specific imports
import { useEditorState } from '@smart-input/core';

// Avoid if possible - may bundle entire package
import * as Core from '@smart-input/core';
```

---

## 🔍 Performance Monitoring

### Build Performance

Track build times in CI/CD:
```bash
time pnpm build:prod
```

### Runtime Performance

Use React DevTools Profiler:
1. Install React DevTools browser extension
2. Open Profiler tab
3. Record interaction
4. Analyze component render times

### Bundle Load Performance

Test in real conditions:
```bash
# Serve production build locally
pnpm build:prod
npx serve dist -p 3000

# Test with network throttling in DevTools
```

---

## 📊 Metrics to Track

### Bundle Size Metrics
- **Total bundle size**: Target < 50KB per package (gzipped)
- **Main thread execution time**: Target < 100ms
- **CSS size**: Target < 10KB (gzipped)

### Performance Metrics
- **First render**: < 16ms (60fps)
- **Re-render on input**: < 8ms (120fps)
- **Large content (10k chars)**: < 50ms initial render

### Build Metrics
- **Full rebuild**: < 30s
- **Incremental rebuild**: < 5s
- **Type checking**: < 10s

---

## 🚀 Optimization Checklist

When optimizing performance:

- [ ] Run `pnpm verify:treeshake` to ensure tree-shaking is working
- [ ] Run `pnpm analyze` to identify large dependencies
- [ ] Check for duplicate dependencies in bundle
- [ ] Review `sideEffects` configuration
- [ ] Add performance benchmarks for critical paths
- [ ] Run `pnpm benchmark` before and after changes
- [ ] Test with large content sets
- [ ] Profile with React DevTools
- [ ] Check bundle sizes with `pnpm size`
- [ ] Verify load time with throttled network

---

## 📝 Performance Testing in CI

Add to your CI pipeline:

```yaml
# .github/workflows/performance.yml
- name: Check bundle size
  run: pnpm size

- name: Run performance benchmarks
  run: pnpm bench

- name: Verify tree-shaking
  run: pnpm verify:treeshake

- name: Bundle size report
  run: pnpm benchmark
```

---

## 💡 Tips & Best Practices

### Dependency Management
- Prefer smaller, focused libraries
- Check bundle impact before adding dependencies
- Use peer dependencies for common libraries (React, etc.)
- Regularly audit and update dependencies

### Code Organization
- Use named exports for better tree-shaking
- Avoid barrel exports (index.ts with export *)
- Keep components focused and lightweight
- Extract heavy utilities to separate packages

### CSS Optimization
- Use CSS modules for scoped styles
- Minimize global styles
- Consider CSS-in-JS for critical styles only
- Use LESS variables for consistency

### React Optimization
- Use React.memo for expensive components
- Implement proper dependency arrays in hooks
- Avoid inline object/array creation in renders
- Use useMemo/useCallback strategically

---

## 🔗 Related Documentation

- [Build Process](./BUILD_IMPROVEMENTS.md)
- [Testing Guide](./TESTS.md)
- [Component Development](./COMPONENTS.md)

---

For questions or suggestions, see [CONTRIBUTING.md](../CONTRIBUTING.md).
