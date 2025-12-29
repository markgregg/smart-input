import { defineConfig, mergeConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import baseConfig from '../../vitest.config';

export default mergeConfig(
  baseConfig,
  defineConfig({
    plugins: [react()],
    test: {
      name: '@smart-input/dropcontent',
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
  }),
);
