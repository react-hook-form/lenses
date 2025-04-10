import { storybookTest } from '@storybook/experimental-addon-test/vitest-plugin';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/writing-tests/test-addon
export default defineConfig({
  test: {
    reporters: 'verbose',
    coverage: {
      allowExternal: true,
      provider: 'v8',
      reporter: ['text', 'html'],
    },
    workspace: [
      {
        extends: 'vite.config.ts',
        test: {
          name: 'unit',
          typecheck: { enabled: true },
          globals: true,
          environment: 'jsdom',
          setupFiles: ['./vitest-unit.setup.ts'],
          include: ['tests/**/*.test.+(ts|tsx)'],
          clearMocks: true,
          restoreMocks: true,
        },
      },
      {
        extends: 'vite.config.ts',
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/writing-tests/test-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        test: {
          name: 'e2e',
          setupFiles: ['./vitest-e2e.setup.ts'],
          browser: {
            enabled: true,
            headless: true,
            provider: 'playwright',
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
