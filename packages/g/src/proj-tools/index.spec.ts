import * as path from 'path'
import { Tree, callRule, chain, schematic } from '@angular-devkit/schematics'
import { SchematicTestRunner } from '@c4605/schematic-utils/lib/testing/SchematicTestRunner'
import { matchRunResult } from '../test-utils/TreeAssertHelpers'
import { Options, IncludeItem, main as projToolsRuleFactory } from './index'
import { featuresEnabled } from './featureEnabled'

const collectionPath = path.join(__dirname, '../collection.json')

describe('proj-tools', () => {
  const run = async (schematicOptions: Options, inputTree = Tree.empty()) => {
    const runner = new SchematicTestRunner('schematics', collectionPath)

    const ctx = runner.createContext('proj-tools')

    const tree = await runner
      .runSchematicAsync(
        'proj-tools',
        { ...schematicOptions, interactive: false },
        inputTree,
        (schematic, opts, tree, oriCtx) => {
          return callRule(projToolsRuleFactory(opts), tree, ctx)
        },
      )
      .toPromise()

    return { runner, tree, ctx }
  }

  describe('with option `include`', () => {
    describe('works with empty value', () => {
      matchRunResult(() => run({}))
    })

    const includeItemNames = Object.keys(
      IncludeItem,
    ) as (keyof typeof IncludeItem)[]
    const includeItemSpecialCase = [IncludeItem.Prettier, IncludeItem.Eslint]
    includeItemNames.forEach(toolName => {
      if (includeItemSpecialCase.includes(IncludeItem[toolName])) return

      describe(`with \`IncludeItem.${toolName}\``, () => {
        const factoryOptions = { include: [IncludeItem[toolName]] }
        matchRunResult(() => run(factoryOptions))
      })
    })

    describe('with `IncludeItem.Prettier`', () => {
      const factoryOptions = { include: [IncludeItem.Prettier] }
      matchRunResult(() => run(factoryOptions))
    })

    describe('with `IncludeItem.Eslint`', () => {
      describe('in common case', () => {
        const factoryOptions = { include: [IncludeItem.Eslint] }
        matchRunResult(() => run(factoryOptions))
      })

      describe('install eslint-plugin-prettier when including prettier', () => {
        const factoryOptions = {
          include: [IncludeItem.Eslint, IncludeItem.Prettier],
        }
        matchRunResult(() => run(factoryOptions))
      })
    })
  })

  describe('with option `jestReact`', () => {
    describe('in common case', () => {
      const factoryOptions = {
        include: [IncludeItem.Jest],
        interactive: false,
        jestReact: true,
      }
      matchRunResult(() => run(factoryOptions))
    })

    describe('support `cwd` option', () => {
      const factoryOptions = {
        include: [IncludeItem.Jest],
        interactive: false,
        cwd: 'test',
      }
      matchRunResult(() => run(factoryOptions))
    })

    describe('do nothing if `jest` not included', () => {
      const factoryOptions = {
        include: [],
        interactive: false,
        jestReact: true,
      }
      matchRunResult(() => run(factoryOptions))
    })
  })

  describe('`featuresEnabled` function', () => {
    const includeItemNames = Object.keys(
      IncludeItem,
    ) as (keyof typeof IncludeItem)[]
    includeItemNames.forEach(toolName => {
      it(`works with \`IncludeItem.${toolName}\``, async () => {
        const factoryOptions: Options = {
          include: [IncludeItem[toolName]],
          interactive: false,
        }

        const runner = new SchematicTestRunner('schematics', collectionPath)

        const ctx = runner.createContext('proj-tools')

        await callRule(
          chain([
            schematic<Options>('proj-tools', factoryOptions),
            (tree, ctx) => {
              expect(
                featuresEnabled([IncludeItem[toolName]])(tree.root, ctx),
              ).toBe(true)
              includeItemNames.forEach(otherToolName => {
                if (otherToolName === toolName) return
                expect(
                  featuresEnabled([IncludeItem[otherToolName]])(tree.root, ctx),
                ).toBe(false)
              })
            },
          ]),
          Tree.empty(),
          ctx,
        ).toPromise()
      })
    })

    it('works with multiple inclusions', async () => {
      const factoryOptions = {
        include: [IncludeItem.Commitlint, IncludeItem.Eslint],
      }
      const { tree, ctx } = await run(factoryOptions)
      expect(
        featuresEnabled([IncludeItem.Commitlint, IncludeItem.Eslint])(
          tree.root,
          ctx,
        ),
      ).toBe(true)
      expect(featuresEnabled([IncludeItem.Commitlint])(tree.root, ctx)).toBe(
        true,
      )
      expect(featuresEnabled([IncludeItem.Eslint])(tree.root, ctx)).toBe(true)
      expect(featuresEnabled([IncludeItem.Githooks])(tree.root, ctx)).toBe(
        false,
      )
      expect(featuresEnabled([IncludeItem.Jest])(tree.root, ctx)).toBe(false)
      expect(featuresEnabled([IncludeItem.LintStaged])(tree.root, ctx)).toBe(
        false,
      )
      expect(featuresEnabled([IncludeItem.Prettier])(tree.root, ctx)).toBe(
        false,
      )
      expect(featuresEnabled([IncludeItem.Renovate])(tree.root, ctx)).toBe(
        false,
      )
    })
  })
})
