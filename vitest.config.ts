import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    css: true,
    benchmark: {
      include: ['**/*.bench.{ts,tsx}'],
      reporters: ['verbose'],
      outputFile: './benchmarks/results/benchmark-results.json',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/vite-env.d.ts',
        'packages/test/**',
        'examples/**',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
      ],
      // Coverage thresholds - start low and increase gradually
      // These ensure we don't lose coverage as we add more tests
      thresholds: {
        lines: 0.5,
        functions: 0.2,
        branches: 0.1,
        statements: 0.5,
      },
      all: true,
      include: ['packages/*/src/**/*.{ts,tsx}'],
    },
  },
});
