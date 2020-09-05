import typescript from 'rollup-plugin-typescript2'
import extensions from 'rollup-plugin-extensions'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'

export default {
  input: 'src/index.ts',
  output: {
    format: 'cjs',
    dir: 'dist',
    banner: '#!/usr/bin/env node',
  },
  external: ['chokidar'],
  plugins: [
    extensions({
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
    }),
    nodeResolve(),
    commonjs(),
    json(),
    typescript({
      tsconfigOverride: {
        compilerOptions: {
          module: 'esnext',
          declaration: false,
          declarationMap: false,
        },
      },
    }),
  ],
}
