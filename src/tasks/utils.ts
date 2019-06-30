import {
  TypedSchematicContext,
  SchematicEngine,
  TaskExecutorFactory,
} from '@angular-devkit/schematics'
import { FileSystemEngineHostBase } from '@angular-devkit/schematics/tools'
import chalk from 'chalk'

export const registerInContextFactory = (
  factory: TaskExecutorFactory<any>,
  options?: any,
) => {
  const _ShellExecTaskExecutorRegisteredHost = new Set<
    FileSystemEngineHostBase
  >()

  return (context: TypedSchematicContext<any, any>) => {
    if (!(context.engine instanceof SchematicEngine)) {
      console.warn(
        chalk.yellow(
          `[${factory.name}#registerInContext] context.engine not instanceof SchematicEngine, skipped`,
        ),
      )
      return
    }

    if (!(context.engine['_host'] instanceof FileSystemEngineHostBase)) {
      console.warn(
        chalk.yellow(
          `[${factory.name}#registerInContext] context.engine._host not instanceof FileSystemEngineHostBase, skipped`,
        ),
      )
      return
    }

    const host: FileSystemEngineHostBase = context.engine['_host']

    if (_ShellExecTaskExecutorRegisteredHost.has(host)) return

    host.registerTaskExecutor(factory, options)

    _ShellExecTaskExecutorRegisteredHost.add(host)
  }
}
