import { Plugin } from 'rollup'
import { GlobbyOptions } from 'globby'

export function copy(
  options: {
    targets: ({ src: string | string[]; dest: string } & GlobbyOptions)[]
    copyOnce?: boolean
    flatten?: boolean
    hook?: string
    verbose?: boolean
  } & GlobbyOptions,
): Plugin
