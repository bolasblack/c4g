import {
  TaskConfiguration,
  TaskConfigurationGenerator,
  SchematicContext,
  TypedSchematicContext,
  TaskExecutor,
} from '@angular-devkit/schematics'
import { registerInContextFactory } from './utils'
import { empty } from 'rxjs'

export const EffectCollectExecutorName = '@c4g/effect-collect-task'

export class EffectCollectTask implements TaskConfigurationGenerator<Options> {
  constructor(protected name: string, protected info: any) {}

  toConfiguration(): TaskConfiguration<Options> {
    return {
      name: EffectCollectExecutorName,
      options: {
        name: this.name,
        info: this.info,
      },
    }
  }
}

export namespace EffectCollectTask {
  export interface Options {
    name: string
    info: any
  }
}

type Options = EffectCollectTask.Options

export const EffectCollectTaskExecutor = {
  name: EffectCollectExecutorName,
  create: async () => createEffectCollectTaskExecutor(),
  registerInContext: (context: TypedSchematicContext<any, any>) => {
    registerInContext(context)
  },
}
const registerInContext = registerInContextFactory(EffectCollectTaskExecutor)

function createEffectCollectTaskExecutor(): TaskExecutor<Options> {
  return (options: Options, context: SchematicContext) => empty()
}
