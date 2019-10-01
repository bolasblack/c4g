import { strings } from '@angular-devkit/core'
import {
  Rule,
  apply,
  mergeWith,
  move,
  template,
  applyTemplates,
  url,
  chain,
  schematic,
} from '@angular-devkit/schematics'
import { Schema as Options } from './schema'
import {
  installNodePackage,
  NodePackageType,
} from '../utils/rules/installNodePackage'
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
      apply(url('./files'), [
        applyTemplates(templateOpts),
        template(templateOpts),
        move(options.name),
      ]),
    ),
    schematic<ProjToolsOptions>('proj-tools', {
      include: [IncludeItem.Prettier, IncludeItem.Eslint],
      cwd: options.name,
      interactive: options.interactive,
    }),
    cleanupSpecFiles(options),
    installNodePackage({
      packageNames: ['@c4605/toolconfs'],
      workingDirectory: options.name,
    }),
    installNodePackage({
      packageNames: ['typescript', '@types/node'],
      type: NodePackageType.Dev,
      workingDirectory: options.name,
    }),
  ])
}

function cleanupSpecFiles(options: Options): Rule {
  return (tree, ctx) => {
    const walkTree = options.name ? tree.getDir(options.name) : tree.root
    if (featuresEnabled([IncludeItem.Jest])(walkTree, ctx)) return
    walkTree.visit(f => {
      if (f.endsWith('.spec.ts')) {
        tree.delete(f)
      }
    })
  }
}
