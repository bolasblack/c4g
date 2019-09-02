import {
  Rule,
  mergeWith,
  chain,
  callRule,
  apply,
  move,
  TypedSchematicContext,
} from '@angular-devkit/schematics'
import { Observable, merge, of, empty, from } from 'rxjs'
import { map, mergeMap, reduce } from 'rxjs/operators'
import * as inquirer from 'inquirer'
import * as path from 'path'
import { Schema as Options, IncludeItem } from './schema'
import { Options as JestInstallOptions } from '../jest-install'
import { file as fileSource } from '../utils/sources/file'
import {
  installNodePackage,
  NodePackageType,
} from '../utils/rules/installNodePackage'
import { file as fileRule } from '../utils/rules/file'
import { schematic } from '../utils/rules/schematic'
import { when } from '../utils/rules/when'

export { Options, IncludeItem }

export interface ProjToolsTypedSchematicContext<
  C extends object,
  S extends object
> extends TypedSchematicContext<C, S> {
  projTools?: {
    includes: IncludeItem[]
  }
}

export function main(options: Options): Rule {
  return (tree, ctx) =>
    (options.interactive ? requestOptions(options) : of(options)).pipe(
      map(opts => {
        const includes = opts.include || []
        ;(ctx as ProjToolsTypedSchematicContext<any, any>).projTools = {
          includes,
        }
        return { ...opts, includes }
      }),
      mergeMap(opts =>
        merge(...opts.includes.map(getRule.bind(null, options))),
      ),
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

  const configFile = (name: string): Rule =>
    mergeWith(apply(fileSource(`./files/${name}`), [move(options.cwd || '')]))

  const filePath = (relativePath: string) =>
    path.join(options.cwd || '', relativePath)

  switch (includeItem) {
    case IncludeItem.Prettier:
      return of(
        chain([
          fileRule(filePath('package.json'), (content: object) => ({
            ...content,
            prettier: '@c4605/toolconfs/prettierrc',
          })),
          install({
            packageName: ['prettier'],
          }),
        ]),
      )

    case IncludeItem.Commitlint:
      return of(
        chain([
          configFile('.commitlintrc.js'),
          install({
            packageName: ['commitlint', '@commitlint/config-conventional'],
          }),
        ]),
      )

    case IncludeItem.LintStaged:
      return of(
        chain([
          configFile('lint-staged.config.js'),
          install({ packageName: 'lint-staged' }),
        ]),
      )

    case IncludeItem.Githooks:
      return of(install({ packageName: 'git-hook-pure' }))

    case IncludeItem.Renovate:
      return of(configFile('renovate.json'))

    case IncludeItem.Eslint:
      return of(
        chain([
          configFile('.eslintrc.json'),
          when(
            () => options.include!.includes(IncludeItem.Prettier),
            fileRule(
              filePath('.eslintrc.json'),
              (content: Record<string, any>) => ({
                ...content,
                extends: [
                  ...content.extends,
                  './node_modules/@c4605/toolconfs/eslintrc.prettier',
                ],
              }),
            ),
          ),
          install({
            packageName: [
              'eslint',
              options.include!.includes(IncludeItem.Prettier)
                ? 'eslint-config-prettier'
                : null,
              '@typescript-eslint/parser',
              '@typescript-eslint/eslint-plugin',
            ].filter((s): s is string => Boolean(s)),
          }),
        ]),
      )

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
