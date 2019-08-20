import * as path from 'path'
import { Tree } from '@angular-devkit/schematics'
import { SchematicTestRunner } from '@angular-devkit/schematics/testing'
import { assertTreeSnapshot } from '../test-utils/TreeAssertHelpers'
import { Options, IncludeItem } from './index'

const collectionPath = path.join(__dirname, '../collection.json')

describe('proj-tools', () => {
  const test = (options: Options, tree = Tree.empty()) => {
    const runner = new SchematicTestRunner('schematics', collectionPath)
    const resultTree = runner.runSchematic(
      'proj-tools',
      { ...options, interactive: false },
      tree,
    )
    assertTreeSnapshot(runner, resultTree)
    return [runner, resultTree]
  }

  describe('with option `include`', () => {
    it('works with empty value', () => {
      test({})
    })

    const includeItemNames = Object.keys(IncludeItem)
    const includeItemSpecialCase = [IncludeItem.Prettier, IncludeItem.Eslint]
    includeItemNames.forEach(toolName => {
      if (includeItemSpecialCase.includes(IncludeItem[toolName])) return

      it(`works with \`IncludeItem.${toolName}\``, () => {
        test({ include: [IncludeItem[toolName]] })
      })
    })

    describe('with `IncludeItem.Prettier`', () => {
      it('works', () => {
        const tree = Tree.empty()
        tree.create('package.json', '{}')
        test({ include: [IncludeItem.Prettier] }, tree)
      })
    })

    describe('with `IncludeItem.Eslint`', () => {
      it('works', () => {
        test({ include: [IncludeItem.Eslint] })
      })

      it('install eslint-plugin-prettier when including prettier', () => {
        const tree = Tree.empty()
        tree.create('package.json', '{}')
        test({ include: [IncludeItem.Eslint, IncludeItem.Prettier] }, tree)
      })
    })
  })

  describe('with option `jestReact`', () => {
    it('works', () => {
      test({ include: [IncludeItem.Jest], interactive: false, jestReact: true })
    })

    it('proxy `cwd` option', () => {
      test({ include: [IncludeItem.Jest], interactive: false, cwd: 'test' })
    })

    it('do nothing if `jest` not included', () => {
      test({ include: [], interactive: false, jestReact: true })
    })
  })
})
