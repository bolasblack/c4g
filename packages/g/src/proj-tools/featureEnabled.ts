import { IncludeItem } from './schema'
import { TypedSchematicContext, DirEntry } from '@angular-devkit/schematics'

export interface FeaturesEnabledTypedSchematicContext
  extends TypedSchematicContext<{}, {}> {
  enabledFeatures?: IncludeItem[]
}

export function featuresEnabled(
  features: IncludeItem[],
): (
  dir: DirEntry,
  ctx: FeaturesEnabledTypedSchematicContext | TypedSchematicContext<{}, {}>,
) => boolean {
  return (tree, ctx) => features.every(f => singleFeatureEnabled(f, tree, ctx))
}

function singleFeatureEnabled(
  feature: IncludeItem,
  dir: DirEntry,
  ctx: FeaturesEnabledTypedSchematicContext | TypedSchematicContext<{}, {}>,
): boolean {
  if (
    process.env.NODE_ENV === 'test' &&
    'enabledFeatures' in ctx &&
    ctx.enabledFeatures
  ) {
    return ctx.enabledFeatures.includes(feature)
  }

  switch (feature) {
    case IncludeItem.Commitlint:
      return commitlintEnabled(dir, ctx)
    case IncludeItem.Eslint:
      return eslintEnabled(dir, ctx)
    case IncludeItem.Githooks:
      return githooksEnabled(dir, ctx)
    case IncludeItem.Jest:
      return jestEnabled(dir, ctx)
    case IncludeItem.LintStaged:
      return lintStagedEnabled(dir, ctx)
    case IncludeItem.Prettier:
      return prettierEnabled(dir, ctx)
    case IncludeItem.Renovate:
      return renovateEnabled(dir, ctx)
  }
}

// https://github.com/conventional-changelog/commitlint#config
const commitlintEnabled = configExists(
  'commitlint',
  [
    'commitlint.config.js',
    '.commitlintrc.js',
    '.commitlintrc.json',
    '.commitlintrc.yml',
  ],
  ['commitlint'],
)

// https://eslint.org/docs/user-guide/configuring#configuration-file-formats
const eslintEnabled = configExists(
  'eslint',
  ['.eslintrc.js', '.eslintrc.yaml', '.eslintrc.yml', '.eslintrc.json'],
  ['eslintConfig'],
)

const githooksEnabled = configExists('git-hook-pure', [], [])

// https://jestjs.io/docs/en/configuration
const jestEnabled = configExists('jest', ['jest.config.js'], [])

// https://github.com/okonet/lint-staged#configuration
const lintStagedEnabled = configExists(
  'lint-staged',
  [
    'lint-staged.config.js',
    '.lintstagedrc',
    '.lintstagedrc.js',
    '.lintstagedrc.json',
    '.lintstagedrc.yml',
    '.lintstagedrc.yaml',
  ],
  ['lint-staged'],
)

const renovateEnabled = configExists(undefined, ['renovate.json'], [])

// https://prettier.io/docs/en/configuration.html
const prettierEnabled = configExists(
  'prettier',
  [
    '.prettierrc',
    '.prettierrc.js',
    '.prettierrc.json',
    '.prettierrc.yml',
    '.prettierrc.yaml',
    '.prettierrc.toml',
    'prettier.config.js',
  ],
  ['prettier'],
)

function configExists(
  packageName: undefined | string,
  fileNames: string[],
  pkgInfoKeys: string[],
): (dir: DirEntry, ctx: TypedSchematicContext<{}, {}>) => boolean {
  return (dir, ctx) => {
    let pkgContent: Record<string, any>
    try {
      pkgContent = JSON.parse(
        dir.file('package.json' as any)!.content.toString(),
      )
    } catch {
      return false
    }

    if (packageName) {
      return Boolean(
        (pkgContent['dependencies'] || {})[packageName] ||
          (pkgContent['devDependencies'] || {})[packageName],
      )
    }

    if (fileNames.some(f => dir.subfiles.includes(f as any))) return true
    return pkgInfoKeys.some(k => pkgContent[k])
  }
}
