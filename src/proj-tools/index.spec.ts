import * as path from 'path'
import { Tree, callRule } from '@angular-devkit/schematics'
import { SchematicTestRunner } from '../test-utils/SchematicTestRunner'
import { assertTreeSnapshot } from '../test-utils/TreeAssertHelpers'
import {
  Options,
  IncludeItem,
  main as projToolsRuleFactory,
  ProjToolsTypedSchematicContext,
} from './index'

const collectionPath = path.join(__dirname, '../collection.json')

describe('proj-tools', () => {
  const run = async (schematicOptions: Options, inputTree = Tree.empty()) => {
    const runner = new SchematicTestRunner('schematics', collectionPath)

    const ctx: ProjToolsTypedSchematicContext<{}, {}> = runner.createContext(
      'proj-tools',
    )

    const tree = runner.runSchematic(
      'proj-tools',
      { ...schematicOptions, interactive: false },
      inputTree,
      (schematic, opts, tree, oriCtx) => {
        return callRule(projToolsRuleFactory(opts), tree, ctx)
      },
    )

    return [runner, tree, ctx] as const
  }

  describe('with option `include`', () => {
    it('works with empty value', async () => {
      const [runner, tree, ctx] = await run({})
      assertTreeSnapshot(runner, tree)
      expect(ctx.projTools).toEqual({
        includes: [],
      })
    })

    const includeItemNames = Object.keys(IncludeItem)
    const includeItemSpecialCase = [IncludeItem.Prettier, IncludeItem.Eslint]
    includeItemNames.forEach(toolName => {
      if (includeItemSpecialCase.includes(IncludeItem[toolName])) return

      it(`works with \`IncludeItem.${toolName}\``, async () => {
        const factoryOptions = { include: [IncludeItem[toolName]] }
        const [runner, tree, ctx] = await run(factoryOptions)
        assertTreeSnapshot(runner, tree)
        expect(ctx.projTools).toEqual({
          includes: [IncludeItem[toolName]],
        })
      })
    })

    describe('with `IncludeItem.Prettier`', () => {
      it('works', async () => {
        const factoryOptions = { include: [IncludeItem.Prettier] }

        const inputTree = Tree.empty()
        inputTree.create('package.json', '{}')

        const [runner, tree, ctx] = await run(factoryOptions, inputTree)

        assertTreeSnapshot(runner, tree)
        expect(ctx.projTools).toEqual({
          includes: [IncludeItem.Prettier],
        })
      })
    })

    describe('with `IncludeItem.Eslint`', () => {
      it('works', async () => {
        const factoryOptions = {
          include: [IncludeItem.Eslint],
        }
        const [runner, tree, ctx] = await run(factoryOptions)
        assertTreeSnapshot(runner, tree)
        expect(ctx.projTools).toEqual({
          includes: [IncludeItem.Eslint],
        })
      })

      it('install eslint-plugin-prettier when including prettier', async () => {
        const factoryOptions = {
          include: [IncludeItem.Eslint, IncludeItem.Prettier],
        }

        const inputTree = Tree.empty()
        inputTree.create('package.json', '{}')

        const [runner, tree, ctx] = await run(factoryOptions, inputTree)

        assertTreeSnapshot(runner, tree)
        expect(ctx.projTools).toEqual({
          includes: [IncludeItem.Eslint, IncludeItem.Prettier],
        })
      })
    })
  })

  describe('with option `jestReact`', () => {
    it('works', async () => {
      const [runner, tree] = await run({
        include: [IncludeItem.Jest],
        interactive: false,
        jestReact: true,
      })
      assertTreeSnapshot(runner, tree)
    })

    it('proxy `cwd` option', async () => {
      const [runner, tree] = await run({
        include: [IncludeItem.Jest],
        interactive: false,
        cwd: 'test',
      })
      assertTreeSnapshot(runner, tree)
    })

    it('do nothing if `jest` not included', async () => {
      const [runner, tree] = await run({
        include: [],
        interactive: false,
        jestReact: true,
      })
      assertTreeSnapshot(runner, tree)
    })
  })
})
