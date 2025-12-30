import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@src': resolve(__dirname, 'packages/core/src'),
      '@components': resolve(__dirname, 'packages/core/src/components'),
      '@atypes': resolve(__dirname, 'packages/core/src/types'),
      '@hooks': resolve(__dirname, 'packages/core/src/hooks'),
      '@state': resolve(__dirname, 'packages/core/src/state'),
      '@utils': resolve(__dirname, 'packages/core/src/utils'),
    },
  },
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
