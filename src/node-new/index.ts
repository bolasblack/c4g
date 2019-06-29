import { strings } from '@angular-devkit/core'
import {
  Rule,
  apply,
  mergeWith,
  move,
  template,
  url,
  chain,
  noop,
  externalSchematic,
} from '@angular-devkit/schematics'
import { Schema as Options } from './schema'
import {
  NodePackageInstallTask,
  NodePackageInstallTaskExecutor,
} from '../tasks/NodePackageInstall'
import { Options as InstallJestOptions } from '../jest-install'

export { Options }

export function main(options: Options): Rule {
  return chain([
    options.jest
      ? externalSchematic('c4g', 'jest-install', {
          cwd: options.name,
        } as InstallJestOptions)
      : noop,
    addDependencies(options),
    mergeWith(
      apply(url('./files'), [
        template({
          ...options,
          dot: '.',
          dasherize: strings.dasherize,
        }),
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
        packageName: 'typescript',
        type: NodePackageInstallTask.Type.Dev,
        workingDirectory: options.name,
      }),
    )
  }
}
