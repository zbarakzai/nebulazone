import {readFileSync} from 'fs';
import * as path from 'path';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import {externals} from 'rollup-plugin-node-externals';
import {babel} from '@rollup/plugin-babel';
import {URL} from 'url';
import terser from '@rollup/plugin-terser';

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
      commonjs(),
      json({
        compact: true,
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
        preserveModules: false,
        entryFileNames: 'index.js',
        exports: 'named',
      },
      {
        format: 'esm',
        dir: path.dirname(pkg.module),
        preserveModules: false,
        entryFileNames: 'index.js',
      },
    ],
  }),
];
