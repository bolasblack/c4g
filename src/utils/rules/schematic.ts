import {
  Rule,
  Tree,
  ExecutionOptions,
  SchematicContext,
  schematic as runSchematic,
} from '@angular-devkit/schematics'
import {
  EffectCollectTask,
  EffectCollectTaskExecutor,
} from '../tasks/EffectCollect'

/**
 * Run a schematic from the same collection.
 *
 * If `NODE_ENV` is `test`, then emit a `EffectCollectTask` instead
 * of run the specified schematic
 *
 * @param schematicName The name of the schematic to run.
 * @param options The options to pass as input to the RuleFactory.
 */
export function schematic<OptionT extends object>(
  schematicName: string,
  options: OptionT,
  executionOptions?: Partial<ExecutionOptions>,
): Rule {
  return (tree: Tree, context: SchematicContext) => {
    if (process.env.NODE_ENV === 'test') {
      EffectCollectTaskExecutor.registerInContext(context)
      context.addTask(
        new EffectCollectTask('rule:schematic', {
          schematicName,
          options,
          executionOptions,
        }),
      )
      return tree
    } else {
      return runSchematic(schematicName, options, executionOptions)
    }
  }
}
