import { strings } from '@angular-devkit/core'
import {
  Rule,
  apply,
  mergeWith,
  template,
  url,
  chain,
} from '@angular-devkit/schematics'
import { Schema as Options } from './schema'
import {
  NodePackageInstallTask,
  NodePackageInstallTaskExecutor,
} from '../tasks/NodePackageInstall'

export { Options }

type FinalOptions = Required<Options>

export function main(_options: Options = {}): Rule {
  const options = transformOptions(_options)

  return tree => {
    return chain([
      addJestDependencies(options),
      mergeWith(
        apply(url('./files'), [
          template({
            ...options,
            dot: '.',
            dasherize: strings.dasherize,
          }),
        ]),
      ),
    ])
  }
}

function transformOptions(options: Options): FinalOptions {
  return Object.assign({ react: false }, options)
}

function addJestDependencies(options: FinalOptions): Rule {
  return (tree, context) => {
    const { react } = options

    NodePackageInstallTaskExecutor.registerInContext(context)

    const deps = ['jest', 'jest-cli', 'ts-jest', '@types/jest']

    if (react) {
      deps.push(
        'enzyme',
        'enzyme-to-json',
        'enzyme-adapter-react-16',
        'identity-obj-proxy',
      )
    }

    context.addTask(
      new NodePackageInstallTask({
        type: NodePackageInstallTask.Type.Dev,
        packageName: deps,
      }),
    )
  }
}
