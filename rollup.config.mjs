import {readFileSync} from 'fs';
import * as path from 'path';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import image from '@rollup/plugin-image';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import {externals} from 'rollup-plugin-node-externals';
import postcss from 'rollup-plugin-postcss';
import {babel} from '@rollup/plugin-babel';
import {URL} from 'url';
import terser from '@rollup/plugin-terser';

import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url).pathname, 'utf-8'),
);

const extensions = ['.js', '.jsx', '.ts', '.tsx'];

function createRollupConfig({output, targets}) {
  return {
    input: './src/index.ts',
    plugins: [
      nodeResolve({extensions}),
      externals({deps: true, peerDeps: true, packagePath: './package.json'}),
      babel({
        extensions,
        rootMode: 'upward',
        envName: 'production',
        babelHelpers: 'bundled',
        targets,
        exclude: 'node_modules/**',
      }),
      image(),
      commonjs(),
      json({
        compact: true,
      }),
      postcss({
        extensions: ['.css'],
        inject: true,
        extract: false,
        plugins: [tailwindcss, autoprefixer],
      }),
      terser(),
    ],
    output,
  };
}

/** @type {import('rollup').RollupOptions} */
export default [
  createRollupConfig({
    targets: ['node 16.0.0'],
    output: [
      {
        format: 'cjs',
        dir: path.dirname(pkg.main),
        preserveModules: true,
        entryFileNames: '[name].js',
        exports: 'named',
      },
      {
        format: 'esm',
        dir: path.dirname(pkg.module),
        preserveModules: true,
        entryFileNames: '[name].js',
      },
    ],
  }),
];
