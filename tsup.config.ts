import { defineConfig } from 'tsup';

export default defineConfig({
  tsconfig: './src/tsconfig.json',
  entry: ['src/index.ts', 'src/rhf/index.ts'],
  format: ['esm', 'cjs'],
  dts: {
    resolve: true,
    entry: ['src/index.ts', 'src/rhf/index.ts'],
  },
  clean: true,
  sourcemap: true,
  external: ['react', 'react-hook-form'],
});
