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
  NodePackageInstallTask,
  NodePackageInstallTaskExecutor,
} from '../tasks/NodePackageInstall'
import { Options as ProjToolsOptions } from '../proj-tools'

export { Options }

export function main(options: Options): Rule {
  const templateOpts = {
    ...options,
    dasherize: strings.dasherize,
  }

  return chain([
    schematic<ProjToolsOptions>('proj-tools', {
      cwd: options.name,
      interactive: options.interactive,
    }),
    addDependencies(options),
    mergeWith(
      apply(url('./files'), [
        applyTemplates(templateOpts),
        template(templateOpts),
        move(options.name),
      ]),
    ),
  ])
}

function addDependencies(options: Options): Rule {
  return (tree, context) => {
    NodePackageInstallTaskExecutor.registerInContext(context)

    context.addTask(
      new NodePackageInstallTask({
        packageName: '@c4605/toolconfs',
        workingDirectory: options.name,
      }),
    )

    context.addTask(
      new NodePackageInstallTask({
        packageName: ['typescript', '@types/node'],
        type: NodePackageInstallTask.Type.Dev,
        workingDirectory: options.name,
      }),
    )
  }
}
