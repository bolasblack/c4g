import * as path from 'path'
import { strings } from '@angular-devkit/core'
import {
  Rule,
  apply,
  mergeWith,
  template,
  url,
  chain,
  move,
  SchematicsException,
} from '@angular-devkit/schematics'
import { Schema as Options } from './schema'
import { ShellExecTaskExecutor, ShellExecTask } from '../tasks/ShellExec'

export { Options }

export function main(options: Options): Rule {
  return tree => {
    return chain([
      addSchematicInfo(options),
      mergeWith(
        apply(url('./files'), [
          template({
            dasherize: strings.dasherize,
            ...options,
          }),
          move(path.join('src', strings.dasherize(options.name))),
        ]),
      ),
      runYarn(),
    ])
  }
}

function runYarn(): Rule {
  return (_, context) => {
    ShellExecTaskExecutor.registerInContext(context)
    context.addTask(new ShellExecTask('yarn', ['build-schema-ts']))
  }
}

function addSchematicInfo(options: Options): Rule {
  const infoFilePath = '/src/collection.json'

  return tree => {
    const rawCollection = tree.read(infoFilePath)

    if (!rawCollection) {
      throw new SchematicsException(`${infoFilePath} not found`)
    }

    const collection = JSON.parse(rawCollection.toString())

    if (collection.schematics[options.name]) {
      throw new SchematicsException(
        `Schematic \`${options.name}\` already existed`,
      )
    }

    tree.overwrite(
      infoFilePath,
      JSON.stringify(
        {
          ...collection,
          schematics: {
            ...collection.schematics,
            [strings.dasherize(options.name)]: {
              factory: `./${options.name}/index#main`,
              schema: `./${options.name}/schema.json`,
              description: options.desc,
            },
          },
        },
        null,
        '  ',
      ),
    )
  }
}
