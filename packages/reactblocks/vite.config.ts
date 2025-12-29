import { resolve } from 'path';
import { defineConfig } from 'vite';
import { createLibraryConfig } from '../../vite.config.base';
import * as packageJson from './package.json';

export default defineConfig(({ mode }) => {
  return createLibraryConfig(
    {
      projectName: 'reactblocks',
      packageDir: __dirname,
      peerDependencies: packageJson.peerDependencies,
      includeLibInjectCss: false,
      libraryName: 'OpenInputReactBlocks',
      aliases: {
        '@src': resolve(__dirname, 'src'),
      },
    },
    mode,
  );
});
