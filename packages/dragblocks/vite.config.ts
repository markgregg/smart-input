import { defineConfig } from 'vite';
import { createLibraryConfig } from '../../vite.config.base';
import * as packageJson from './package.json';

export default defineConfig(({ mode }) => {
  return createLibraryConfig(
    {
      projectName: 'dragblocks',
      packageDir: __dirname,
      peerDependencies: packageJson.peerDependencies,
      includeLibInjectCss: true,
    },
    mode,
  );
});
