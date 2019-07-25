import {
  Rule,
  mergeWith,
  chain,
  callRule,
  apply,
  move,
} from '@angular-devkit/schematics'
import { Observable, merge, of, empty, from } from 'rxjs'
import * as inquirer from 'inquirer'
import {
  NodePackageInstallTask,
  NodePackageInstallTaskExecutor,
} from '../tasks/NodePackageInstall'
import { Schema as Options, IncludeItem } from './schema'
import { map, mergeMap, reduce } from 'rxjs/operators'
import { Options as JestInstallOptions } from '../jest-install'
import { file as fileSource } from '../utils/sources'
import { schematic } from '../utils/rules'

export { Options, IncludeItem }

export function main(options: Options): Rule {
  return (tree, ctx) =>
    (options.interactive ? requestOptions(options) : of(options)).pipe(
      map(opts => ({ ...opts, include: opts.include || [] })),
      mergeMap(opts => merge(...opts.include.map(getRule.bind(null, options)))),
      reduce((acc, r) => acc.concat(r), [] as Rule[]),
      mergeMap(rules => {
        if (rules.length) {
          rules = rules.concat(installToolconfsDep(options))
        }

        return callRule(chain(rules), tree.branch(), ctx)
      }),
    )
}

const installToolconfsDep = (options: Options): Rule => (_, ctx) => {
  NodePackageInstallTaskExecutor.registerInContext(ctx)

  ctx.addTask(
    new NodePackageInstallTask({
      packageName: '@c4605/toolconfs',
      workingDirectory: options.cwd,
    }),
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

    case IncludeItem.Jest:
      return of(
        schematic('jest-install', {
          cwd: options.cwd,
          react: options.jestReact,
        } as JestInstallOptions),
      )
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

export const requestOptions = (
  opts: Partial<Options> = {},
): Observable<Options> =>
  from(
    inquirer.prompt([
      {
        name: 'include',
        type: 'checkbox',
        choices: Object.values(IncludeItem),
        default: opts.include || [],
      },
      {
        name: 'jestReact',
        type: 'confirm',
        message: 'jest add react support?',
        default: false,
        when(ans: Options) {
          return (
            opts.jestReact == null && ans.include!.includes(IncludeItem.Jest)
          )
        },
      },
    ]),
  )
