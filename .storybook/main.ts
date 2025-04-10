import type { StorybookConfig } from '@storybook/react-vite';
import checker from 'vite-plugin-checker';
import tsconfigPaths from 'vite-tsconfig-paths';

const config: StorybookConfig = {
  stories: ['../examples/**/*.story.@(ts|tsx)', '../examples/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-onboarding', '@storybook/experimental-addon-test'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  async viteFinal(config) {
    const { mergeConfig } = await import('vite');

    return mergeConfig(config, {
      plugins: [checker({ typescript: true, overlay: false }), tsconfigPaths()],
    });
  },
};

export default config;
