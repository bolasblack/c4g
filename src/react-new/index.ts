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
import { Schema as Options } from './schema'
import {
  Options as ProjToolsOptions,
  IncludeItem,
  ProjToolsTypedSchematicContext,
} from '../proj-tools'
import {
  installNodePackage,
  NodePackageType,
} from '../utils/rules/installNodePackage'
import { file as fileSource } from '../utils/sources/file'

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
        filter(path => !path.endsWith('/package.json.template')),
        applyTemplates(templateOpts),
        template(templateOpts),
        move(options.name),
      ]),
    ),
    cleanupSpecFiles(),
    installNodePackage({
      packageName: [
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
      packageName: [
        'typescript',
        'ts-node',
        '@types/node',
        'poi',
        '@types/poi',
        '@poi/plugin-typescript',
        '@poi/plugin-astroturf',
        'sass',
        'sass-loader',
        'react-hot-loader',
      ],
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
