/// <reference types="vitest" />

import {react} from './src/tests/vitejs-plugin-react.cjs';
import {defineConfig} from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  css: {postcss: {plugins: []}},
  test: {
    include: ['./src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/tests/setup.ts'],
    environment: 'jsdom',
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['node_modules'],
      all: true,
      provider: 'v8',
    },
  },
});
