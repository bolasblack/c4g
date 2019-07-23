/**
 * This task is a variant of Schematics builtin NodePackageInstallTask:
 *
 *     https://github.com/angular/angular-cli/blob/a56cc3105fe1d855a8f5d546db7547b3fee20597/packages/angular_devkit/schematics/tasks/node-package/executor.ts
 *
 * and
 *
 *     https://github.com/angular/angular-cli/blob/a56cc3105fe1d855a8f5d546db7547b3fee20597/packages/angular_devkit/schematics/tasks/node-package/install-task.ts
 *
 * But made some changes:
 *
 * 1. Use `yarn` as the only package manager
 * 2. Support add dev/peer/optional dependencies
 *
 * Related:
 *
 * * https://github.com/angular/angular-cli/pull/14865
 * * https://github.com/angular/angular-cli/issues/12678
 */

import {
  TaskExecutor,
  TaskConfigurationGenerator,
  TaskConfiguration,
  TypedSchematicContext,
} from '@angular-devkit/schematics'
import { SpawnOptions } from 'child_process'
import * as path from 'path'
import { catchError } from 'rxjs/operators'
import { runShell } from './ShellExec'
import { registerInContextFactory } from './utils'

export const NodePackageInstallTaskExecutorName =
  '@c4g/node-package-install-task'

export class NodePackageInstallTask
  implements TaskConfigurationGenerator<Options> {
  constructor(private _options: NodePackageInstallTask.ConstructOptions) {}

  toConfiguration(): TaskConfiguration<Options> {
    const optionPackageName = this._options.packageName
    const packageNames = Array.isArray(optionPackageName)
      ? optionPackageName
      : [optionPackageName]

    return {
      name: NodePackageInstallTaskExecutorName,
      options: {
        packageNames,
        type: this._options.type || Type.Default,
        workingDirectory: this._options.workingDirectory || '',
      },
    }
  }
}

export namespace NodePackageInstallTask {
  export interface ConstructOptions {
    packageName: string | string[]
    type?: Type
    workingDirectory?: string
  }

  export interface Options {
    packageNames: string[]
    type: Type
    workingDirectory: string
  }

  export enum Type {
    Default = 'default',
    Dev = 'dev',
    Peer = 'peer',
    Optional = 'optional',
  }
}

type Options = NodePackageInstallTask.Options

const Type = NodePackageInstallTask.Type

export const NodePackageInstallTaskExecutor = {
  name: NodePackageInstallTaskExecutorName,
  create: async () => createNodePackageInstallTaskExecutor(),
  registerInContext: (context: TypedSchematicContext<any, any>) => {
    registerInContext(context)
  },
}
const registerInContext = registerInContextFactory(
  NodePackageInstallTaskExecutor,
)

function createNodePackageInstallTaskExecutor(): TaskExecutor<Options> {
  return (options: Options, context) => {
    const spawnOptions: SpawnOptions = {
      cwd: path.join(process.cwd(), options.workingDirectory),
    }

    const args = ['add', ...options.packageNames]

    switch (options.type) {
      case Type.Dev:
        args.push('--dev')
        break
      case Type.Peer:
        args.push('--peer')
        break
      case Type.Optional:
        args.push('--optional')
        break
    }

    return runShell('yarn', args, spawnOptions).pipe(
      catchError(_ => {
        const message = 'Package install failed, see above.'
        throw new Error(message)
      }),
    )
  }
}
