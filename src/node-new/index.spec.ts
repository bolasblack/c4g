import { Tree } from '@angular-devkit/schematics'
import { SchematicTestRunner } from '@angular-devkit/schematics/testing'
import * as path from 'path'
import { assertTreeSnapshot } from '../test-utils/TreeAssertHelpers'
import { Options } from './index'

const collectionPath = path.join(__dirname, '../collection.json')

describe('node-new', () => {
  it('works', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath)
    const tree = await runner
      .runSchematicAsync<Options>(
        'node-new',
        { name: 'hello', interactive: false },
        Tree.empty(),
      )
      .toPromise()
    assertTreeSnapshot(runner, tree)
  })

  it('support `author` option', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath)
    const tree = await runner
      .runSchematicAsync<Options>(
        'node-new',
        {
          name: 'hello',
          author: 'c4605 <bolasblack@gmail.com>',
          interactive: false,
        },
        Tree.empty(),
      )
      .toPromise()
    assertTreeSnapshot(runner, tree)
  })
})
