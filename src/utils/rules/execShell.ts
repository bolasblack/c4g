import { Rule } from '@angular-devkit/schematics'
import { ShellExecTask, ShellExecTaskExecutor } from '../tasks/ShellExec'

export type Options = ShellExecTask.ConstructOptions

export const execShell = (
  ...args: ConstructorParameters<typeof ShellExecTask>
): Rule => (tree, ctx) => {
  ShellExecTaskExecutor.registerInContext(ctx)
  ctx.addTask(new ShellExecTask(...args))
}
