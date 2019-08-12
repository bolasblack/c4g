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
import { Options as ProjToolsOptions, IncludeItem } from '../proj-tools'

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
      include: [IncludeItem.Prettier],
      cwd: options.name,
      interactive: options.interactive,
    }),
    installNodePackage({
      packageName: '@c4605/toolconfs',
      workingDirectory: options.name,
    }),
    installNodePackage({
      packageName: [
        'typescript',
        '@types/node',
        'eslint',
        'eslint-config-prettier',
        '@typescript-eslint/parser',
        '@typescript-eslint/eslint-plugin',
      ],
      type: NodePackageType.Dev,
      workingDirectory: options.name,
    }),
  ])
}
