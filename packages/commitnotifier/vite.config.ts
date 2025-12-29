import { defineConfig } from 'vite';
import { createLibraryConfig } from '../../vite.config.base';
import * as packageJson from './package.json';

export default defineConfig(({ mode }) => {
  return createLibraryConfig(
    {
      projectName: 'commitnotifier',
      packageDir: __dirname,
      peerDependencies: packageJson.peerDependencies,
    },
    mode,
  );
});
