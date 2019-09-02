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
  ProjToolsTypedSchematicContext,
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
    cleanupSpecFiles(),
    installNodePackage({
      packageName: '@c4605/toolconfs',
      workingDirectory: options.name,
    }),
    installNodePackage({
      packageName: ['typescript', '@types/node'],
      type: NodePackageType.Dev,
      workingDirectory: options.name,
    }),
  ])
}

function cleanupSpecFiles(): Rule {
  return (tree, ctx: ProjToolsTypedSchematicContext<any, any>) => {
    if (ctx.projTools && ctx.projTools.includes.includes(IncludeItem.Jest)) {
      return
    }

    tree.visit(f => {
      if (f.endsWith('.spec.ts')) {
        tree.delete(f)
      }
    })
  }
}
