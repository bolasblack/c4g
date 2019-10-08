import {
  TypedSchematicContext,
  TaskExecutorFactory,
} from '@angular-devkit/schematics'
import { FileSystemEngineHostBase } from '@angular-devkit/schematics/tools'
import chalk from 'chalk'

export const registerInContextFactory = (
  factory: TaskExecutorFactory<any>,
  options?: any,
): ((context: TypedSchematicContext<any, any>) => void) => {
  const TaskExecutorRegisteredHost = new Set<FileSystemEngineHostBase>()

  return context => {
    if (
      !context.engine ||
      !context.engine['_host'] ||
      // @ts-ignore
      typeof context.engine['_host'].registerTaskExecutor !== 'function'
    ) {
      console.warn(
        chalk.yellow(
          `[${factory.name}#registerInContext] context.engine._host.registerTaskExecutor not a function, skipped`,
        ),
      )
      return
    }

    const host: FileSystemEngineHostBase = context.engine['_host']

    if (TaskExecutorRegisteredHost.has(host)) return

    host.registerTaskExecutor(factory, options)

    TaskExecutorRegisteredHost.add(host)
  }
}
