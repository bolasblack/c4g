import * as path from 'path'
import { Tree } from '@angular-devkit/schematics'
import { SchematicTestRunner } from '../test-utils/SchematicTestRunner'
import { assertTreeSnapshot } from '../test-utils/TreeAssertHelpers'
import { Options } from './index'

const collectionPath = path.join(__dirname, '../collection.json')

describe('schematic', () => {
  it('works', () => {
    const tree = Tree.empty()
    tree.create(
      '/src/collection.json',
      JSON.stringify({
        $schema:
          '../node_modules/@angular-devkit/schematics/collection-schema.json',
        schematics: {},
      }),
    )

    const runner = new SchematicTestRunner('schematics', collectionPath)
    const resultTree = runner.runSchematic<Options>(
      'schematic',
      { name: 'helloSchematic' },
      tree,
    )
    assertTreeSnapshot(runner, resultTree)
  })
})
