import {
  Tree,
  Rule,
  FileDoesNotExistException,
} from '@angular-devkit/schematics'
import { Observable } from 'rxjs'
import * as Yaml from 'js-yaml'
import { mergeMap as mergeMap$, map as map$ } from 'rxjs/operators'
import { ensureObservable } from '../helpers/ensureObservable'

export interface FileIoOptions {
  read: (tree: Tree, path: string) => any | Observable<any>
  write: (tree: Tree, path: string, content: any) => void | Observable<void>
}

export interface FileOptions extends FileIoOptions {}

export function file<T>(
  path: string,
  modifier: (content: T) => T | Observable<T>,
  options: FileOptions = { ...file.json({ stringifySpace: '  ' }) },
): Rule {
  return tree => {
    if (!tree.exists(path)) {
      throw new FileDoesNotExistException(path)
    }

    return ensureObservable(options.read(tree, path)).pipe(
      mergeMap$(content => ensureObservable(modifier(content))),
      mergeMap$(modifiedContent =>
        ensureObservable(options.write(tree, path, modifiedContent)),
      ),
      map$(() => tree),
    )
  }
}

export namespace file {
  export type FileIoOptionsFactory<ARGS extends any[]> = (
    ...args: ARGS
  ) => FileIoOptions

  export const yaml: FileIoOptionsFactory<[]> = () => ({
    read(tree, path) {
      const content = tree.read(path)!
      return Yaml.load(content.toString())
    },

    write(tree, path, content) {
      tree.overwrite(path, Yaml.dump(content))
    },
  })

  export interface JsonFileIoOptionsFactoryOptions {
    parseReviver?: Parameters<typeof JSON.parse>[1]
    stringifyReplacer?: Parameters<typeof JSON.stringify>[1]
    stringifySpace?: Parameters<typeof JSON.stringify>[2]
  }
  export const json: FileIoOptionsFactory<
    [JsonFileIoOptionsFactoryOptions?]
  > = (options = {}) => ({
    read(tree, path) {
      const content = tree.read(path)!
      return JSON.parse(content.toString(), options.parseReviver)
    },

    write(tree, path, content) {
      tree.overwrite(
        path,
        JSON.stringify(
          content,
          options.stringifyReplacer,
          options.stringifySpace,
        ),
      )
    },
  })

  export const lines: FileIoOptionsFactory<[]> = () => ({
    read(tree, path) {
      const content = tree.read(path)!
      return content.toString().split(/\r?\n/)
    },

    write(tree, path, content) {
      tree.overwrite(path, content.join('\n'))
    },
  })
}
