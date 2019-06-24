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
  TaskExecutorFactory,
  TypedSchematicContext,
  SchematicEngine,
} from '@angular-devkit/schematics'
import { SpawnOptions, spawn } from 'child_process'
import * as path from 'path'
import { Observable } from 'rxjs'
import { FileSystemEngineHostBase } from '@angular-devkit/schematics/tools'

export const NodePackageInstallTaskExecutorName =
  '@c4g/node-package-install-task'

export class NodePackageInstallTask implements TaskConfigurationGenerator {
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
  ...(<TaskExecutorFactory<void>>{
    name: NodePackageInstallTaskExecutorName,
    create: async () => createNodePackageInstallTaskExecutor(),
  }),
  registerInContext: (context: TypedSchematicContext<any, any>) => {
    if (!(context.engine instanceof SchematicEngine)) {
      console.warn(
        '[NodePackageInstall#registerInContext] context.engine not instanceof SchematicEngine, skipped',
      )
    }

    if (!(context.engine['_host'] instanceof FileSystemEngineHostBase)) {
      console.warn(
        '[NodePackageInstall#registerInContext] context.engine._host not instanceof FileSystemEngineHostBase, skipped',
      )
    }

    context.engine['_host'].registerTaskExecutor(
      NodePackageInstallTaskExecutor,
      undefined,
    )
  },
}

function createNodePackageInstallTaskExecutor(): TaskExecutor<Options> {
  return (options: Options) => {
    const outputStream = process.stdout
    const errorStream = process.stderr
    const spawnOptions: SpawnOptions = {
      stdio: [process.stdin, outputStream, errorStream],
      shell: true,
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

    return new Observable(obs => {
      spawn('yarn', args, spawnOptions).on('close', code => {
        if (code === 0) {
          obs.next()
          obs.complete()
        } else {
          const message = 'Package install failed, see above.'
          obs.error(new Error(message))
        }
      })
    })
  }
}
