import {
  TaskExecutor,
  TaskConfigurationGenerator,
  TaskConfiguration,
  TypedSchematicContext,
} from '@angular-devkit/schematics'
import { SpawnOptions, spawn } from 'child_process'
import { Observable, Subscriber } from 'rxjs'
import { registerInContextFactory } from './utils'
import { catchError } from 'rxjs/operators'

export const ShellExecTaskExecutorName = '@c4g/shell-exec-task'

export class ShellExecTask implements TaskConfigurationGenerator {
  constructor(
    private command: string,
    private args: string[] = [],
    private options: ShellExecTask.ConstructOptions = {},
  ) {}

  toConfiguration(): TaskConfiguration<Options> {
    return {
      name: ShellExecTaskExecutorName,
      options: {
        command: this.command,
        args: this.args,
        options: this.options,
      },
    }
  }
}

type Options = ShellExecTask.Options

export namespace ShellExecTask {
  export interface ConstructOptions extends SpawnOptions {
    onClose?(ctx: {
      code: number
      signal: string
      subscriber: Subscriber<void>
    }): void
  }

  export interface Options {
    command: string
    args: string[]
    options: ConstructOptions
  }
}

export const ShellExecTaskExecutor = {
  name: ShellExecTaskExecutorName,
  create: async () => createShellExecTaskExecutor(),
  registerInContext: (context: TypedSchematicContext<any, any>) => {
    registerInContext(context)
  },
}
const registerInContext = registerInContextFactory(ShellExecTaskExecutor)

function createShellExecTaskExecutor(): TaskExecutor<Options> {
  return (options: Options) =>
    runShell(options.command, options.args, options.options).pipe(
      catchError(_ => {
        const rawCommand = `${options.command} ${options.args.join(' ')}`
        const message = `Command \`${rawCommand}\` execute failed:`
        throw new Error(message)
      }),
    )
}

export function runShell(
  command: string,
  args: string[] = [],
  options: SpawnOptions = {},
) {
  const outputStream = process.stdout
  const errorStream = process.stderr
  const spawnOptions: SpawnOptions = {
    stdio: [process.stdin, outputStream, errorStream],
    shell: true,
    ...options,
  }

  return new Observable<void>(obs => {
    spawn(command, args, spawnOptions).on('close', (code, signal) => {
      if (code === 0) {
        obs.next()
        obs.complete()
      } else {
        obs.error()
      }
    })
  })
}
