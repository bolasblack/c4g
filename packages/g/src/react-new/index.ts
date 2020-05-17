import { strings } from '@angular-devkit/core'
import {
  Rule,
  apply,
  mergeWith,
  template,
  url,
  chain,
  schematic,
  applyTemplates,
  move,
  filter,
} from '@angular-devkit/schematics'
import {
  installNodePackage,
  NodePackageType,
} from '@c4605/schematic-utils/lib/rules/installNodePackage'
import { file as fileSource } from '@c4605/schematic-utils/lib/sources/file'
import { Schema as Options } from './schema'
import {
  Options as ProjToolsOptions,
  IncludeItem,
  featuresEnabled,
} from '../proj-tools'

export { Options }

export function main(options: Options): Rule {
  const templateOpts = {
    ...options,
    dasherize: strings.dasherize,
  }

  return chain([
    mergeWith(
      apply(fileSource('./files/package.json.template'), [
        applyTemplates(templateOpts),
        move(options.name),
      ]),
    ),
    schematic<ProjToolsOptions>('proj-tools', {
      include: [IncludeItem.Prettier, IncludeItem.Eslint],
      cwd: options.name,
      interactive: options.interactive,
      jestReact: true,
    }),
    mergeWith(
      apply(url('./files'), [
        filter((path) => !path.endsWith('/package.json.template')),
        applyTemplates(templateOpts),
        template(templateOpts),
        move(options.name),
      ]),
    ),
    cleanupSpecFiles(options),
    installNodePackage({
      packageNames: [
        '@c4605/toolconfs',
        'react',
        '@types/react',
        'react-dom',
        '@types/react-dom',
        'astroturf',
      ],
      workingDirectory: options.name,
    }),
    installNodePackage({
      packageNames: [
        'typescript',
        'ts-node',
        '@types/node',
        'poi',
        '@types/poi',
        '@poi/plugin-typescript',
        'sass',
        'sass-loader',
        'react-hot-loader',
      ],
      type: NodePackageType.Dev,
      workingDirectory: options.name,
    }),
  ])
}

function cleanupSpecFiles(options: Options): Rule {
  return (tree, ctx) => {
    const walkTree = options.name ? tree.getDir(options.name) : tree.root
    if (featuresEnabled([IncludeItem.Jest])(walkTree, ctx)) return
    walkTree.visit((f) => {
      if (f.endsWith('.spec.ts')) {
        tree.delete(f)
      }
    })
  }
}
