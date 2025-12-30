import { resolve } from 'path';
import { defineConfig } from 'vite';
import eslintPlugin from '@nabla/vite-plugin-eslint';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(async () => {
  return {
    base: '/smart-input/',
    define: {
      'process.env.NODE_ENV': '"development"',
    },
    plugins: [
      react(),
      eslintPlugin(),
      tsconfigPaths({
        ignoreConfigErrors: true,
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
  };
});
