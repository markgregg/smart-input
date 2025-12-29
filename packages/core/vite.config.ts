import { resolve } from 'path';
import { defineConfig } from 'vite';
import { createLibraryConfig } from '../../vite.config.base';
import * as packageJson from './package.json';

export default defineConfig(({ mode }) => {
  return createLibraryConfig(
    {
      projectName: 'core',
      packageDir: __dirname,
      peerDependencies: packageJson.peerDependencies,
      includeLibInjectCss: true,
      aliases: {
        '@components': resolve(__dirname, 'src/components'),
        '@atypes': resolve(__dirname, 'src/types'),
        '@hooks': resolve(__dirname, 'src/hooks'),
        '@state': resolve(__dirname, 'src/state'),
        '@utils': resolve(__dirname, 'src/utils'),
      },
    },
    mode,
  );
});
