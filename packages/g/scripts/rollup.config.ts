import { RollupOptions } from 'rollup'
import typescript from 'rollup-plugin-typescript2'
import extensions from 'rollup-plugin-extensions'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { copy } from './rollup-plugin-copy'

const inputs = ['lib-new', 'node-new', 'react-new', 'proj-tools', 'schematic']

const config: RollupOptions = {
  input: inputs.reduce((acc, i) => ({ ...acc, [i]: `src/${i}` }), {}),
  output: {
    entryFileNames: '[name]/index.js',
    format: 'cjs',
    dir: 'dist',
  },
  plugins: [
    extensions({
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
    }),
    nodeResolve(),
    commonjs({
      ignore: ['chokidar'],
    }),
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
    copy({
      targets: [
        { src: '**/files/**/*', dest: 'dist' },
        { src: '**/+(collection|schema).json', dest: 'dist' },
      ],
      flatten: false,
      cwd: './src',
    }),
  ],
}

export default config
