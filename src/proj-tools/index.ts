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
  installNodePackage,
  NodePackageType,
} from '../utils/rules/installNodePackage'
import { Schema as Options, IncludeItem } from './schema'
import { map, mergeMap, reduce } from 'rxjs/operators'
import { Options as JestInstallOptions } from '../jest-install'
import { file as fileSource } from '../utils/sources/file'
import { schematic } from '../utils/rules/schematic'

export { Options, IncludeItem }

export function main(options: Options): Rule {
  return (tree, ctx) =>
    (options.interactive ? requestOptions(options) : of(options)).pipe(
      map(opts => ({ ...opts, include: opts.include || [] })),
      mergeMap(opts => merge(...opts.include.map(getRule.bind(null, options)))),
      reduce((acc, r) => acc.concat(r), [] as Rule[]),
      mergeMap(rules => {
        if (rules.length) {
          rules = rules.concat(
            installNodePackage({
              packageName: '@c4605/toolconfs',
              workingDirectory: options.cwd,
            }),
          )
        }

        return callRule(chain(rules), tree.branch(), ctx)
      }),
    )
}

function getRule(options: Options, includeItem: IncludeItem): Observable<Rule> {
  const install = (opts: Parameters<typeof installNodePackage>[0]) =>
    installNodePackage({
      workingDirectory: options.cwd || '',
      type: NodePackageType.Dev,
      ...opts,
    })

  const file = (name: string): Rule => copyConfigFile(name, options.cwd || '')

  switch (includeItem) {
    case IncludeItem.Commitlint:
      return of(
        chain([
          file('.commitlintrc.js'),
          install({
            packageName: ['commitlint', '@commitlint/config-conventional'],
          }),
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
