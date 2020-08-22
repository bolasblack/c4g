import * as path from 'path'
import { Tree } from '@angular-devkit/schematics'
import { SchematicTestRunner } from '@c4605/schematic-utils/lib/testing/SchematicTestRunner'
import { assertTreeSnapshot } from '../test-utils/TreeAssertHelpers'
import { Options } from './index'

const collectionPath = path.join(__dirname, '../collection.json')

describe('<%= dasherize(name) %>', () => {
  it('works', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath)
    const resultTree = await runner
      .runSchematicAsync<Options>('<%= dasherize(name) %>', {}, Tree.empty())
      .toPromise()
    assertTreeSnapshot(runner, resultTree)
  })
})
