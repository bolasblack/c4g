import { Tree } from '@angular-devkit/schematics'
import { SchematicTestRunner } from '../test-utils/SchematicTestRunner'
import * as path from 'path'

const collectionPath = path.join(__dirname, '../collection.json')

describe('node-new', () => {
  it('works', () => {
    const runner = new SchematicTestRunner('schematics', collectionPath)
    const tree = runner.runSchematic(
      'node-new',
      { name: 'hello' },
      Tree.empty(),
    )

    expect(tree.files).toEqual([])
  })
})
