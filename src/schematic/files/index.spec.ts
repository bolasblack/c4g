import * as path from 'path'
import { Tree } from '@angular-devkit/schematics'
import { SchematicTestRunner } from '../test-utils/SchematicTestRunner'
import { assertTreeSnapshot } from '../test-utils/TreeAssertHelpers'
import { Options } from './index'

const collectionPath = path.join(__dirname, '../collection.json')

describe('<%= dasherize(name) %>', () => {
  it('works', () => {
    const runner = new SchematicTestRunner('schematics', collectionPath)
    const resultTree = runner.runSchematic<Options>(
      '<%= dasherize(name) %>',
      {},
      Tree.empty(),
    )
    assertTreeSnapshot(runner, resultTree)
  })
})
