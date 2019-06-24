import { Observable, of as observableOf } from 'rxjs'
import { map } from 'rxjs/operators'
import { logging } from '@angular-devkit/core'
import {
  Tree,
  HostTree,
  Collection,
  SchematicEngine,
} from '@angular-devkit/schematics'
import { NodeModulesTestEngineHost } from '@angular-devkit/schematics/tools'
import {
  SchematicTestRunner as SchematicTestRunnerBase,
  UnitTestTree,
} from '@angular-devkit/schematics/testing'

export class SchematicTestRunner extends SchematicTestRunnerBase {
  runSchematicAsync<SchematicSchemaT>(
    schematicName: string,
    opts?: SchematicSchemaT,
    tree?: Tree,
  ): Observable<UnitTestTree> {
    const engineHost: NodeModulesTestEngineHost = this['_engineHost']
    const engine: SchematicEngine<{}, {}> = this['_engine']
    const collection: Collection<{}, {}> = this['_collection']
    const logger: logging.Logger = this['_logger']

    const schematic = collection.createSchematic(schematicName, true)
    const host = observableOf(tree || new HostTree())
    engineHost.clearTasks()

    return schematic
      .call(opts || {}, host, { logger, engine })
      .pipe(map(tree => new UnitTestTree(tree)))
  }

  runSchematic<SchematicSchemaT>(
    schematicName: string,
    opts?: SchematicSchemaT,
    tree?: Tree,
  ): UnitTestTree {
    const engineHost: NodeModulesTestEngineHost = this['_engineHost']
    const engine: SchematicEngine<{}, {}> = this['_engine']
    const collection: Collection<{}, {}> = this['_collection']
    const logger: logging.Logger = this['_logger']

    const schematic = collection.createSchematic(schematicName, true)

    let result: UnitTestTree | null = null
    let error
    const host = observableOf(tree || new HostTree())
    engineHost.clearTasks()

    schematic
      .call(opts || {}, host, { logger, engine })
      .subscribe(t => (result = new UnitTestTree(t)), e => (error = e))

    if (error) {
      throw error
    }

    if (result === null) {
      throw new Error('Schematic is async, please use runSchematicAsync')
    }

    return result
  }
}
