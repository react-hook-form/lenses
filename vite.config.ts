/// <reference types="vitest/config" />

import react from '@vitejs/plugin-react';
import { defineConfig, type UserConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const config: UserConfig = defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
    tsconfigPaths(),
  ],
  test: {
    typecheck: { enabled: true },
    reporters: 'verbose',
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/**/*.test.+(ts|tsx)'],
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      allowExternal: true,
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});

export default config;
