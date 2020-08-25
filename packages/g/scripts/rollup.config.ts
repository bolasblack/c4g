import { RollupOptions } from 'rollup'
import typescript from 'rollup-plugin-typescript2'
import extensions from 'rollup-plugin-extensions'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { copy } from './rollup-plugin-copy'

const config: RollupOptions = {
  input: {
    'lib-new': 'src/lib-new/index.ts',
    'node-new': 'src/node-new/index.ts',
    'react-new': 'src/react-new/index.ts',
    'proj-tools': 'src/proj-tools/index.ts',
    schematic: 'src/schematic/index.ts',
  },
  output: {
    entryFileNames: '[name]/index.js',
    format: 'cjs',
    dir: 'dist',
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
