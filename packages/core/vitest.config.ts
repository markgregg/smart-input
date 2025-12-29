import { defineConfig, mergeConfig } from 'vitest/config';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import baseConfig from '../../vitest.config';

export default mergeConfig(
  baseConfig,
  defineConfig({
    resolve: {
      alias: {
        '@src': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@atypes': resolve(__dirname, 'src/types'),
        '@hooks': resolve(__dirname, 'src/hooks'),
        '@state': resolve(__dirname, 'src/state'),
        '@utils': resolve(__dirname, 'src/utils'),
      },
    },
    plugins: [react()],
    test: {
      name: '@smart-input/core',
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
  }),
);
