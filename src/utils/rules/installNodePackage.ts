import { Rule } from '@angular-devkit/schematics'
import {
  NodePackageInstallTask,
  NodePackageInstallTaskExecutor,
} from '../tasks/NodePackageInstall'

export const NodePackageType = NodePackageInstallTask.Type

export type Options = NodePackageInstallTask.ConstructOptions

export const installNodePackage = (
  ...args: ConstructorParameters<typeof NodePackageInstallTask>
): Rule => (tree, ctx) => {
  NodePackageInstallTaskExecutor.registerInContext(ctx)
  ctx.addTask(new NodePackageInstallTask(...args))
}
