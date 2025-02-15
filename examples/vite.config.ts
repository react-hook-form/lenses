/// <reference types="vitest/config" />

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
    tsconfigPaths(),
    checker({ typescript: true }),
  ],
  test: {
    typecheck: { enabled: true },
    reporters: 'verbose',
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.test.+(ts|tsx)', '**/*.test-d.+(ts|tsx)'],
    exclude: ['**/node_modules/**', '**/__fixtures__/**', '/\\.', '.history'],
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      allowExternal: true,
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});
