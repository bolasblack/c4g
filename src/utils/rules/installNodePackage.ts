/**
 * This task is a variant of Schematics builtin NodePackageInstallTask:
 *
 *     https://github.com/angular/angular-cli/blob/a56cc3105fe1d855a8f5d546db7547b3fee20597/packages/angular_devkit/schematics/tasks/node-package/executor.ts
 *
 * and
 *
 *     https://github.com/angular/angular-cli/blob/a56cc3105fe1d855a8f5d546db7547b3fee20597/packages/angular_devkit/schematics/tasks/node-package/install-task.ts
 *
 * But made some changes:
 *
 * 1. Use `yarn` as the only package manager
 * 2. Support add dev/peer/optional dependencies
 *
 * Related:
 *
 * * https://github.com/angular/angular-cli/pull/14865
 * * https://github.com/angular/angular-cli/issues/12678
 */

import * as path from 'path'
import { Rule } from '@angular-devkit/schematics'
import * as fetchPkgInfo from 'package-json'
import { from as from$ } from 'rxjs'
import { mergeMap, tap, last, map } from 'rxjs/operators'
import * as semver from 'semver'
import { ShellExecTask, ShellExecTaskExecutor } from '../tasks/ShellExec'

type PkgDepKeys =
  | 'dependencies'
  | 'devDependencies'
  | 'peerDependencies'
  | 'optionalDependencies'

export const installNodePackage = (options: Options): Rule => (tree, ctx) => {
  const pkgFilePath = path.join(
    '/',
    options.workingDirectory || '',
    'package.json',
  )
  if (!tree.exists(pkgFilePath)) {
    tree.create(pkgFilePath, '{}')
  }

  const pkgInfo: Record<PkgDepKeys, Record<string, string>> = JSON.parse(
    tree.read(pkgFilePath)!.toString(),
  )

  const depType = options.type || Type.Default
  const depKey: PkgDepKeys =
    depType === Type.Dev
      ? 'devDependencies'
      : depType === Type.Peer
      ? 'peerDependencies'
      : depType === Type.Optional
      ? 'optionalDependencies'
      : 'dependencies'

  return from$(options.packageNames).pipe(
    mergeMap(name => from$(getPkgInfo(name))),
    tap(metadata => {
      const deps = pkgInfo[depKey] || {}
      const originVersionRawRange = deps[metadata.name]
      const newVersionRawRange = metadata.version

      if (
        originVersionRawRange &&
        metadata.fetchedVersion &&
        semver.satisfies(metadata.fetchedVersion, originVersionRawRange)
      ) {
        return
      }

      pkgInfo[depKey] = { ...deps, [metadata.name]: newVersionRawRange }
    }),
    last(),
    map(() => {
      tree.overwrite(pkgFilePath, JSON.stringify(pkgInfo, null, '  '))
      ShellExecTaskExecutor.registerInContext(ctx)
      ctx.addTask(
        new ShellExecTask('yarn', undefined, { cwd: options.workingDirectory }),
      )
      return tree
    }),
  )
}

export interface Options {
  packageNames: string[]
  type?: Type
  workingDirectory?: string
}

enum Type {
  Default = 'default',
  Dev = 'dev',
  Peer = 'peer',
  Optional = 'optional',
}

export { Type as NodePackageType }

function parseCliPkgName(name: string): { name: string; version?: string } {
  if (name.slice(1).includes('@')) {
    const nameParts = name.split('@')
    return {
      name: nameParts.slice(0, -1).join('@'),
      version: nameParts[nameParts.length - 1],
    }
  } else {
    return {
      name,
    }
  }
}

const getPkgInfoCache: Record<
  string,
  fetchPkgInfo.AbbreviatedMetadata
> = Object.create(null)

async function getPkgInfo(
  name: string,
): Promise<{ name: string; version: string; fetchedVersion?: string }> {
  const pkgNameInfo = parseCliPkgName(name)
  if (pkgNameInfo.version) return pkgNameInfo as any

  let info = getPkgInfoCache[name]
  if (!info) {
    if (process.env.NODE_ENV === 'test') {
      info = { name, 'dist-tags': { latest: '1.0.0' } } as any
    } else {
      info = await fetchPkgInfo(pkgNameInfo.name, {
        version: pkgNameInfo.version,
      })
    }

    if (!getPkgInfoCache[name]) {
      getPkgInfoCache[name] = info
    }
  }

  const fetchedVersion = info['dist-tags'].latest

  return {
    name: info.name,
    version: `^${fetchedVersion}`,
    fetchedVersion,
  }
}
