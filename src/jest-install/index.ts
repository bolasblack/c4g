import { strings } from '@angular-devkit/core'
import {
  Rule,
  apply,
  mergeWith,
  template,
  url,
  chain,
  move,
} from '@angular-devkit/schematics'
import { Schema as Options } from './schema'
import {
  NodePackageInstallTask,
  NodePackageInstallTaskExecutor,
} from '../tasks/NodePackageInstall'

export { Options }

type CompletedOptions = Required<Options>

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
          move(options.cwd),
        ]),
      ),
    ])
  }
}

function transformOptions(options: Options): CompletedOptions {
  return Object.assign({ react: false, cwd: '.' }, options)
}

function addJestDependencies(options: CompletedOptions): Rule {
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
