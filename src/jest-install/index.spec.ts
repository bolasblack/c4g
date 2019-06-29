import { Tree } from '@angular-devkit/schematics'
import { SchematicTestRunner } from '../test-utils/SchematicTestRunner'
import * as path from 'path'
import { assertTreeSnapshot } from '../test-utils/TreeAssertHelpers'
import { Options } from './index'

const collectionPath = path.join(__dirname, '../collection.json')

describe('jest-install', () => {
  it('works', () => {
    const runner = new SchematicTestRunner('schematics', collectionPath)
    const tree = runner.runSchematic<Options>('jest-install', {}, Tree.empty())
    assertTreeSnapshot(runner, tree)
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
})
