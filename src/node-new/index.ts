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
  noop,
  schematic,
} from '@angular-devkit/schematics'
import { Schema as Options } from './schema'
import {
  NodePackageInstallTask,
  NodePackageInstallTaskExecutor,
} from '../tasks/NodePackageInstall'
import { Options as InstallJestOptions } from '../jest-install'

export { Options }

export function main(options: Options): Rule {
  const templateOpts = {
    ...options,
    dasherize: strings.dasherize,
  }

  return chain([
    options.jest
      ? schematic('jest-install', {
          cwd: options.name,
        } as InstallJestOptions)
      : noop,
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
