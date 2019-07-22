import * as path from 'path'
import { Tree } from '@angular-devkit/schematics'
import { SchematicTestRunner } from '@angular-devkit/schematics/testing'
import { assertTreeSnapshot } from '../test-utils/TreeAssertHelpers'
import { Options, IncludeItem } from './index'

const collectionPath = path.join(__dirname, '../collection.json')

const toolNames = Object.keys(IncludeItem)

describe('proj-tools', () => {
  describe('with option `include`', () => {
    const test = (options: Options) => {
      const runner = new SchematicTestRunner('schematics', collectionPath)
      const resultTree = runner.runSchematic(
        'proj-tools',
        { ...options, interactive: false },
        Tree.empty(),
      )
      assertTreeSnapshot(runner, resultTree)
    }

    it('works with empty value', () => {
      test({})
    })

    toolNames.forEach(toolName => {
      it(`works with \`IncludeItem.${toolName}\``, () => {
        test({ include: [IncludeItem[toolName]] })
      })
    })
  })

  describe('with option `jestReact`', () => {
    it(`works`, () => {
      const runner = new SchematicTestRunner('schematics', collectionPath)
      const resultTree = runner.runSchematic<Options>(
        'proj-tools',
        { include: [IncludeItem.Jest], interactive: false, jestReact: true },
        Tree.empty(),
      )
      assertTreeSnapshot(runner, resultTree)
    })

    it(`do nothing if \`jest\` not included`, () => {
      const runner = new SchematicTestRunner('schematics', collectionPath)
      const resultTree = runner.runSchematic<Options>(
        'proj-tools',
        { include: [], interactive: false, jestReact: true },
        Tree.empty(),
      )
      assertTreeSnapshot(runner, resultTree)
    })
  })
})
