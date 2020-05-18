import * as path from 'path'
import { Tree, callRule } from '@angular-devkit/schematics'
import { SchematicTestRunner } from '@c4605/schematic-utils/lib/testing/SchematicTestRunner'
import { assertTreeSnapshot } from '../test-utils/TreeAssertHelpers'
import { Options, main as nodeNewRuleFactory } from './index'
import { FeaturesEnabledTypedSchematicContext } from '../proj-tools/featureEnabled'
import { IncludeItem } from '../proj-tools'

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

  it('add spec files if user added proj-tool jest', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath)

    const tree = await runner
      .runSchematicAsync(
        'node-new',
        {
          name: 'hello',
          author: 'c4605 <bolasblack@gmail.com>',
          interactive: false,
        },
        undefined,
        (schematic, opts, tree, oriCtx) => {
          const ctx: FeaturesEnabledTypedSchematicContext = runner.createContext(
            'node-new',
            oriCtx,
          )
          ctx.enabledFeatures = [IncludeItem.Jest]
          return callRule(nodeNewRuleFactory(opts), tree, ctx)
        },
      )
      .toPromise()

    assertTreeSnapshot(runner, tree)
  })
})
