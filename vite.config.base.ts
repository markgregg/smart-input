import { resolve } from 'path';
import { UserConfig, PluginOption } from 'vite';
import eslintPlugin from '@nabla/vite-plugin-eslint';
import react from '@vitejs/plugin-react';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import dts from 'vite-plugin-dts';
import { visualizer } from 'rollup-plugin-visualizer';

interface PackageConfig {
  projectName: string;
  packageDir: string;
  peerDependencies: Record<string, string>;
  aliases?: Record<string, string>;
  includeLibInjectCss?: boolean;
  includeEslint?: boolean;
  libraryName?: string;
  formats?: ('es' | 'umd' | 'cjs')[];
  customFileName?: (format: string) => string;
}

export function createLibraryConfig(
  config: PackageConfig,
  mode: string,
): UserConfig {
  const debug = mode !== 'production';

  const plugins: PluginOption[] = [react()];

  if (config.includeEslint !== false) {
    plugins.push(eslintPlugin());
  }

  if (config.includeLibInjectCss) {
    plugins.push(libInjectCss());
  }

  plugins.push(
    dts({
      include: ['src'],
      exclude: ['src/__bench__/**'],
      copyDtsFiles: true,
      tsconfigPath: 'tsconfig.build.json',
    }),
  );

  // Add bundle analyzer in production mode or when ANALYZE env var is set
  if (!debug || process.env.ANALYZE === 'true') {
    plugins.push(
      visualizer({
        filename: resolve(config.packageDir, 'dist', 'stats.html'),
        open: process.env.ANALYZE === 'true',
        gzipSize: true,
        brotliSize: true,
        template: 'treemap', // sunburst, treemap, network
      }),
    );
  }

  // Build default aliases
  const defaultAliases: Record<string, string> = {
    '@src': resolve(config.packageDir, 'src'),
  };

  const aliases = { ...defaultAliases, ...config.aliases };

  const formats = config.formats || ['es'];
  const fileName = config.customFileName
    ? config.customFileName
    : debug
      ? config.projectName
      : `${config.projectName}.min`;

  return {
    define: {
      'process.env.NODE_ENV': debug ? '"development"' : '"production"',
    },
    resolve: {
      alias: aliases,
    },
    plugins,
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
      lib: {
        entry: resolve(config.packageDir, 'src/index.ts'),
        name: config.libraryName,
        fileName: fileName,
        formats: formats,
      },
      rollupOptions: {
        input: {
          [config.projectName]: resolve(config.packageDir, 'src/index.ts'),
        },
        external: [
          'react',
          'react-dom',
          'react/jsx-runtime',
          '@smart-input/core',
          ...Object.keys(config.peerDependencies),
        ],
        output: {
          assetFileNames: debug
            ? `${config.projectName}.[ext]`
            : `${config.projectName}.min.[ext]`,
          globals: {
            react: 'React',
            'React-dom': 'ReactDOM',
          },
        },
      },
    },
    esbuild: {
      minifyIdentifiers: !debug,
      keepNames: debug,
    },
  };
}
