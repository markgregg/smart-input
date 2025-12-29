/** @type {import('@ladle/react').UserConfig} */
export default {
  stories: 'packages/*/src/**/*.stories.{ts,tsx}',
  outDir: 'ladle-build',
  viteConfig: './vite.config.ts',
  addons: {
    a11y: {
      enabled: true,
    },
    theme: {
      enabled: true,
      defaultState: 'light',
    },
    width: {
      enabled: true,
      options: {
        xsmall: 375,
        small: 768,
        medium: 1024,
        large: 1440,
      },
      defaultState: 0,
    },
  },
};
