import { strings } from '@angular-devkit/core'
import {
  Rule,
  mergeWith,
  chain,
  callRule,
  apply,
  move,
  template,
} from '@angular-devkit/schematics'
import { Observable, of, empty, from } from 'rxjs'
import { mergeMap, toArray } from 'rxjs/operators'
import * as inquirer from 'inquirer'
import * as path from 'path'
import { produce } from 'immer'
import { file as fileSource } from '@c4605/schematic-utils/lib/sources/file'
import {
  installNodePackage,
  NodePackageType,
} from '@c4605/schematic-utils/lib/rules/installNodePackage'
import { file as fileRule } from '@c4605/schematic-utils/lib/rules/file'
import { when } from '@c4605/schematic-utils/lib/rules/when'
import { Schema as Options, IncludeItem } from './schema'

export { featuresEnabled } from './featureEnabled'

export { Options, IncludeItem }

export function main(options: Options): Rule {
  return (tree, ctx) =>
    (options.interactive ? requestOptions(options) : of(options)).pipe(
      mergeMap((opts) => {
        opts.include = opts.include || []
        return from(opts.include)
      }),
      mergeMap(getRule.bind(null, options)),
      toArray(),
      mergeMap((rules) => {
        if (rules.length) {
          rules = rules.concat(
            installNodePackage({
              packageNames: ['@c4605/toolconfs'],
              workingDirectory: options.cwd,
            }),
          )
        }

        return callRule(chain(rules), tree, ctx)
      }),
    )
}

function getRule(options: Options, includeItem: IncludeItem): Observable<Rule> {
  const install = (opts: Parameters<typeof installNodePackage>[0]) =>
    installNodePackage({
      workingDirectory: options.cwd,
      type: NodePackageType.Dev,
      ...opts,
    })

  const filePath = (relativePath: string) =>
    path.join(options.cwd || '', relativePath)

  switch (includeItem) {
    case IncludeItem.Prettier:
      return of(
        chain([
          install({
            packageNames: ['prettier'],
          }),
          fileRule(filePath('package.json'), (content: object) => ({
            ...content,
            prettier: '@c4605/toolconfs/prettierrc',
          })),
        ]),
      )

    case IncludeItem.Commitlint:
      return of(
        chain([
          install({
            packageNames: ['commitlint', '@commitlint/config-conventional'],
          }),
          configFile(options, '.commitlintrc.js'),
        ]),
      )

    case IncludeItem.LintStaged:
      return of(
        chain([
          install({ packageNames: ['lint-staged'] }),
          configFile(options, 'lint-staged.config.js'),
        ]),
      )

    case IncludeItem.Githooks:
      return of(install({ packageNames: ['git-hook-pure'] }))

    case IncludeItem.Renovate:
      return of(configFile(options, 'renovate.json'))

    case IncludeItem.Eslint:
      return of(eslintRule(options))

    case IncludeItem.Jest:
      return of(jestRule(options))
  }

  return empty()
}

function configFile(options: Options, name: string, rules: Rule[] = []): Rule {
  return mergeWith(
    apply(fileSource(`./files/${name}`), [move(options.cwd || ''), ...rules]),
  )
}

export function eslintRule(options: Options): Rule {
  return chain([
    configFile(options, '.eslintrc.json'),
    when(
      () => options.include!.includes(IncludeItem.Prettier),
      fileRule(
        path.join(options.cwd || '', '.eslintrc.json'),
        (content: Record<string, any>) => ({
          ...content,
          extends: [
            ...content.extends,
            './node_modules/@c4605/toolconfs/eslintrc.prettier',
          ],
        }),
      ),
    ),
    installNodePackage({
      packageNames: [
        'eslint',
        options.include!.includes(IncludeItem.Prettier)
          ? 'eslint-config-prettier'
          : null,
        '@typescript-eslint/parser',
        '@typescript-eslint/eslint-plugin',
      ].filter((s): s is string => Boolean(s)),
      workingDirectory: options.cwd,
      type: NodePackageType.Dev,
    }),
  ])
}

export function jestRule(options: Options = {}): Rule {
  const pkgJsonPath = path.join(options.cwd || '', 'package.json')

  const completedOpts: Required<Options> = Object.assign(
    {
      cwd: '',
      include: [],
      interactive: false,
      jestReact: false,
    },
    options,
  )
  const templateOpts = {
    ...completedOpts,
    dasherize: strings.dasherize,
  }

  return chain([
    addJestDependencies(options),
    configFile(options, 'jest.config.js', [template(templateOpts)]),
    when(
      (tree) => tree.exists(pkgJsonPath),
      fileRule(
        pkgJsonPath,
        produce((content: any) => {
          content.scripts = content.scripts || {}
          if (content.scripts.test) {
            content.scripts.test += '&& jest ./src'
          } else {
            content.scripts.test = 'jest ./src'
          }
        }),
      ),
    ),
  ])

  function addJestDependencies(options: Options): Rule {
    const { jestReact } = options

    const deps = ['jest', 'jest-cli', 'ts-jest', '@types/jest']

    if (jestReact) {
      deps.push(
        'enzyme',
        'enzyme-to-json',
        'enzyme-adapter-react-16',
        'identity-obj-proxy',
      )
    }

    return installNodePackage({
      type: NodePackageType.Dev,
      packageNames: deps,
      workingDirectory: options.cwd,
    })
  }
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
