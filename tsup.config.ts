import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: {
    resolve: true,
    entry: ['src/index.ts'],
  },
  clean: true,
  sourcemap: true,
  external: ['react', 'react-hook-form'],
});
