import { strings } from '@angular-devkit/core'
import {
  Rule,
  apply,
  mergeWith,
  move,
  partitionApplyMerge,
  template,
  url,
  chain,
} from '@angular-devkit/schematics'
import { Schema as Options } from './schema'
import {
  NodePackageInstallTask,
  NodePackageInstallTaskExecutor,
} from '../tasks/NodePackageInstall'

export { Options }

export function main(options: Options): Rule {
  // TODO: jest setup

  return chain([
    addDependencies(options),
    mergeWith(
      apply(url('./files'), [
        partitionApplyMerge(
          p => !/\/src\/.*?\/files\//.test(p),
          template({
            ...options,
            dot: '.',
            dasherize: strings.dasherize,
          }),
        ),
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
