import { Tree } from '@angular-devkit/schematics'
import { SchematicTestRunner } from '@angular-devkit/schematics/testing'
import * as path from 'path'
import { assertTreeSnapshot } from '../test-utils/TreeAssertHelpers'
import { Options } from './index'

const collectionPath = path.join(__dirname, '../collection.json')

describe('node-new', () => {
  it('works', () => {
    const runner = new SchematicTestRunner('schematics', collectionPath)
    const tree = runner.runSchematic<Options>(
      'node-new',
      { name: 'hello' },
      Tree.empty(),
    )
    assertTreeSnapshot(runner, tree)
  })

  it('support `author` option', () => {
    const runner = new SchematicTestRunner('schematics', collectionPath)
    const tree = runner.runSchematic<Options>(
      'node-new',
      { name: 'hello', author: 'c4605 <bolasblack@gmail.com>' },
      Tree.empty(),
    )
    assertTreeSnapshot(runner, tree)
  })

  it('support `jest` option', () => {
    const runner = new SchematicTestRunner('schematics', collectionPath)
    const tree = runner.runSchematic<Options>(
      'node-new',
      { name: 'hello', jest: true },
      Tree.empty(),
    )
    assertTreeSnapshot(runner, tree)
  })
})
