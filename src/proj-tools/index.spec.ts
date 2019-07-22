import * as path from 'path'
import { Tree } from '@angular-devkit/schematics'
import { SchematicTestRunner } from '@angular-devkit/schematics/testing'
import { assertTreeSnapshot } from '../test-utils/TreeAssertHelpers'
import { Options, IncludeItem } from './index'

const collectionPath = path.join(__dirname, '../collection.json')

const toolNames = Object.values(IncludeItem) as IncludeItem[]

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
      it(`works with \`${toolName}\``, () => {
        test({ include: [toolName] })
      })
    })
  })
})
