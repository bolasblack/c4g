import {
  Rule,
  mergeWith,
  chain,
  callRule,
  apply,
  move,
} from '@angular-devkit/schematics'
import { Observable, merge, of, empty } from 'rxjs'
import * as inquirer from 'inquirer'
import {
  NodePackageInstallTask,
  NodePackageInstallTaskExecutor,
} from '../tasks/NodePackageInstall'
import { Schema as Options, IncludeItem } from './schema'
import { map, mergeMap, reduce } from 'rxjs/operators'
import { file as fileSource } from '../utils/sources'

export { Options, IncludeItem }

export function main(options: Options): Rule {
  return (tree, ctx) =>
    (options.interactive
      ? requestIncludeOption({ default: options.include })
      : of(options.include || [])
    ).pipe(
      mergeMap(includes => merge(...includes.map(getRule.bind(null, options)))),
      reduce((acc, r) => acc.concat(r), [] as Rule[]),
      mergeMap(
        i =>
          i[0]
            ? callRule(i[0], tree, ctx)
            : of(tree) /*callRule(chain(i), tree, ctx)*/,
      ),
    )
}

function getRule(options: Options, includeItem: IncludeItem): Observable<Rule> {
  const install = (opts: Parameters<typeof installPkg>[0]) =>
    installPkg({
      workingDirectory: options.cwd || '',
      type: NodePackageInstallTask.Type.Dev,
      ...opts,
    })

  const file = (name: string): Rule => copyConfigFile(name, options.cwd || '')

  switch (includeItem) {
    case IncludeItem.Commitlint:
      return of(
        chain([
          file('.commitlintrc.js'),
          install({ packageName: 'commitlint' }),
        ]),
      )

    case IncludeItem.LintStaged:
      return of(
        chain([
          file('lint-staged.config.js'),
          install({ packageName: 'lint-staged' }),
        ]),
      )

    case IncludeItem.Githooks:
      return of(install({ packageName: 'git-hook-pure' }))

    case IncludeItem.Renovate:
      return of(file('renovate.json'))
  }

  return empty()
}

const copyConfigFile = (fileName: string, moveTo: string) =>
  mergeWith(apply(fileSource(`./files/${fileName}`), [move(moveTo)]))

const installPkg = (
  opts: ConstructorParameters<typeof NodePackageInstallTask>[0],
): Rule => (_, ctx) => {
  NodePackageInstallTaskExecutor.registerInContext(ctx)

  ctx.addTask(new NodePackageInstallTask(opts))
}

export const requestIncludeOption = (opts: { default?: IncludeItem[] } = {}) =>
  inquirer
    .prompt([
      {
        name: 'include',
        type: 'checkbox',
        choices: Object.values(IncludeItem),
        default: opts.default || [],
      },
    ])
    .ui.process.pipe(map(a => a.answer as IncludeItem[]))
