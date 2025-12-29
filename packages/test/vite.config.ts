import { resolve } from 'path';
import { defineConfig } from 'vite';
import eslintPlugin from '@nabla/vite-plugin-eslint';
import react from '@vitejs/plugin-react';

export default defineConfig(async () => {
  const istanbul = (await import('vite-plugin-istanbul')).default;

  return {
    define: {
      'process.env.NODE_ENV': '"development"',
    },
    resolve: {
      alias: {
        '@src': resolve(__dirname, 'src'),
      },
    },
    plugins: [
      react(),
      eslintPlugin(),
      istanbul({
        include: ['src/**/*', '../../packages/*/src/**/*'],
        exclude: [
          'node_modules',
          'dist',
          'tests',
          '**/*.test.ts',
          '**/*.test.tsx',
          '**/*.spec.ts',
          '**/*.spec.tsx',
        ],
        extension: ['.ts', '.tsx'],
        requireEnv: false,
        forceBuildInstrument: true,
      }),
    ],
    css: {
      preprocessorOptions: {
        less: {
          math: 'always',
          relativeUrls: true,
          javascriptEnabled: true,
        },
      },
    },
    build: {
      sourcemap: true,
    },
    server: {
      port: 3001,
      strictPort: true,
      open: false,
      sourcemapIgnoreList: false,
    },
    optimizeDeps: {
      exclude: [
        '@smart-input/commitnotifier',
        '@smart-input/core',
        '@smart-input/dropcontent',
        '@smart-input/reactblocks',
        '@smart-input/typeahead',
      ],
    },
  };
});
