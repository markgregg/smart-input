import { defineConfig, mergeConfig } from 'vitest/config';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import baseConfig from '../../vitest.config';

export default mergeConfig(
  baseConfig,
  defineConfig({
    plugins: [react()],
    test: {
      name: '@smart-input/typeahead',
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
  }),
);
