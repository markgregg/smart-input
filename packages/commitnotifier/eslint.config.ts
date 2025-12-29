import sharedConfig from '../../eslint.config';
import { defineConfig } from 'eslint/config';

/**
 * ESLint configuration for @smart-input/commitnotifier package
 * Extends shared configuration from root
 */
export default defineConfig([
  ...sharedConfig,
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
]);
