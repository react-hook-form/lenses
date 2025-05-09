import type { StorybookConfig } from '@storybook/react-vite';
import react from '@vitejs/plugin-react';
import { mergeConfig } from 'vite';
import checker from 'vite-plugin-checker';

const config: StorybookConfig = {
  stories: ['../examples/**/*.story.@(ts|tsx)', '../examples/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/experimental-addon-test'],
  framework: {
    name: '@storybook/react-vite',
    options: {
      builder: { viteConfigPath: './vite.config.ts' },
    },
  },

  viteFinal(config) {
    return mergeConfig(config, {
      plugins: [
        react({
          babel: {
            plugins: ['babel-plugin-react-compiler'],
          },
        }),
        checker({ typescript: true, overlay: false }),
      ],
    });
  },
};

export default config;
