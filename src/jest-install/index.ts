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
  installNodePackage,
  NodePackageType,
} from '../utils/rules/installNodePackage'

export { Options }

type CompletedOptions = Required<Options>

export function main(_options: Options = {}): Rule {
  const options = transformOptions(_options)
  const templateOpts = {
    ...options,
    dasherize: strings.dasherize,
  }

  return tree => {
    return chain([
      addJestDependencies(options),
      mergeWith(
        apply(url('./files'), [
          template(templateOpts),
          move(options.cwd || ''),
        ]),
      ),
    ])
  }
}

function transformOptions(options: Options): CompletedOptions {
  return Object.assign({ react: false, cwd: '.' }, options)
}

function addJestDependencies(options: CompletedOptions): Rule {
  const { react } = options

  const deps = ['jest', 'jest-cli', 'ts-jest', '@types/jest']

  if (react) {
    deps.push(
      'enzyme',
      'enzyme-to-json',
      'enzyme-adapter-react-16',
      'identity-obj-proxy',
    )
  }

  return installNodePackage({
    type: NodePackageType.Dev,
    packageName: deps,
    workingDirectory: options.cwd,
  })
}
