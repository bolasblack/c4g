import { Observable, of as observableOf } from 'rxjs'
import { map } from 'rxjs/operators'
import { logging } from '@angular-devkit/core'
import {
  HostTree,
  Tree,
  Collection,
  TypedSchematicContext,
  ExecutionOptions,
  Schematic,
} from '@angular-devkit/schematics'
import {
  UnitTestTree,
  SchematicTestRunner as SchematicTestRunnerBase,
} from '@angular-devkit/schematics/testing'
import { NodeModulesTestEngineHost } from '@angular-devkit/schematics/tools'

export interface CallSchematic<SchematicSchemaT> {
  (
    schematic: Schematic<{}, {}>,
    options: SchematicSchemaT,
    tree: Observable<Tree>,
    parentContext: Partial<TypedSchematicContext<{}, {}>>,
  ): Observable<Tree>
}

export class SchematicTestRunner extends SchematicTestRunnerBase {
  createContext(
    schematicName: string,
    parent?: Partial<TypedSchematicContext<{}, {}>>,
    executionOptions?: Partial<ExecutionOptions>,
  ) {
    const _collection: Collection<{}, {}> = this['_collection']
    const _logger: logging.Logger = this['_logger']
    const { engine } = this

    const schematic = _collection.createSchematic(schematicName, true)

    return engine.createContext(
      schematic,
      {
        logger: _logger,
        ...parent,
      },
      executionOptions,
    )
  }

  runSchematicAsync<SchematicSchemaT>(
    schematicName: string,
    options?: SchematicSchemaT,
    tree?: Tree,
    callSchematic?: CallSchematic<SchematicSchemaT>,
  ): Observable<UnitTestTree> {
    const _collection: Collection<{}, {}> = this['_collection']
    const _engineHost: NodeModulesTestEngineHost = this['_engineHost']
    const _logger: logging.Logger = this['_logger']

    const schematic = _collection.createSchematic(schematicName, true)
    const host = observableOf(tree || new HostTree())
    _engineHost.clearTasks()

    callSchematic = callSchematic || this._callSchematic.bind(this)

    return callSchematic!(schematic, options as any, host, {
      logger: _logger,
    }).pipe(map(tree => new UnitTestTree(tree)))
  }

  runSchematic<SchematicSchemaT extends {}>(
    schematicName: string,
    options?: SchematicSchemaT,
    tree?: Tree,
    callSchematic?: CallSchematic<SchematicSchemaT>,
  ): UnitTestTree {
    const _collection: Collection<{}, {}> = this['_collection']
    const _engineHost: NodeModulesTestEngineHost = this['_engineHost']
    const _logger: logging.Logger = this['_logger']

    const schematic = _collection.createSchematic(schematicName, true)

    let result: UnitTestTree | null = null
    let error
    const host = observableOf(tree || new HostTree())
    _engineHost.clearTasks()

    callSchematic = callSchematic || this._callSchematic.bind(this)

    callSchematic!(schematic, options as any, host, {
      logger: _logger,
    }).subscribe(t => (result = new UnitTestTree(t)), e => (error = e))

    if (error) {
      throw error
    }

    if (result === null) {
      throw new Error('Schematic is async, please use runSchematicAsync')
    }

    return result
  }

  protected _callSchematic<SchematicSchemaT extends {}>(
    schematic: Schematic<{}, {}>,
    options: SchematicSchemaT | undefined,
    tree: Observable<Tree>,
    parentContext: Partial<TypedSchematicContext<{}, {}>>,
  ) {
    return schematic.call(options || {}, tree, parentContext)
  }
}
