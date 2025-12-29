import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths({
      ignoreConfigErrors: true,
    }),
  ],
  server: {
    port: 61000,
  },
  resolve: {
    alias: {
      '@smart-input/core': path.resolve(__dirname, './packages/core/src'),
      '@smart-input/typeahead': path.resolve(
        __dirname,
        './packages/typeahead/src',
      ),
      '@smart-input/commitnotifier': path.resolve(
        __dirname,
        './packages/commitnotifier/src',
      ),
      '@smart-input/reactblocks': path.resolve(
        __dirname,
        './packages/reactblocks/src',
      ),
      '@smart-input/dropcontent': path.resolve(
        __dirname,
        './packages/dropcontent/src',
      ),
      '@smart-input/dragblocks': path.resolve(
        __dirname,
        './packages/dragblocks/src',
      ),
    },
  },
});
