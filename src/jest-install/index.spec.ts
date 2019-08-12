import { Tree } from '@angular-devkit/schematics'
import { SchematicTestRunner } from '@angular-devkit/schematics/testing'
import * as path from 'path'
import { assertTreeSnapshot } from '../test-utils/TreeAssertHelpers'
import { Options } from './index'

const collectionPath = path.join(__dirname, '../collection.json')

describe('jest-install', () => {
  it('works', () => {
    const runner = new SchematicTestRunner('schematics', collectionPath)

    const resultTreeWithoutPackageJson = runner.runSchematic<Options>(
      'jest-install',
      {},
      Tree.empty(),
    )
    assertTreeSnapshot(runner, resultTreeWithoutPackageJson)

    const treeWithPackageJson = Tree.empty()
    treeWithPackageJson.create('package.json', '{}')
    const resultTreeWithPackageJson = runner.runSchematic<Options>(
      'jest-install',
      {},
      treeWithPackageJson,
    )
    assertTreeSnapshot(runner, resultTreeWithPackageJson)
  })

  it('support `react` option', () => {
    const runner = new SchematicTestRunner('schematics', collectionPath)
    const tree = runner.runSchematic<Options>(
      'jest-install',
      { react: true },
      Tree.empty(),
    )
    assertTreeSnapshot(runner, tree)
  })

  it('support `cwd` option', () => {
    const runner = new SchematicTestRunner('schematics', collectionPath)
    const tree = runner.runSchematic<Options>(
      'jest-install',
      { cwd: 'hello' },
      Tree.empty(),
    )
    assertTreeSnapshot(runner, tree)
  })
})
