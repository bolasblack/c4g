#!/usr/bin/env node

import * as dedent from 'dedent'
import { main as schematicsCliMain } from '@angular-devkit/schematics-cli/bin/schematics'

export function main(name: string, opts: string[]): Promise<number> {
  // @angular-devkit/schematics-cli may be hoisted, but we don't want use hoisted @c4/g
  const c4gCollJsonPath = eval('require.resolve')('@c4/g/dist/collection.json')

  return schematicsCliMain({
    args: [
      `${c4gCollJsonPath}:lib-new`,
      `--debug=false`,
      `--name=${name}`,
      ...opts,
    ],
  })
}

if (require.main === module) {
  const args = process.argv.slice(2)

  if (args.length < 1) {
    console.log(
      dedent`yarn create @c4/lib projectName [@c4/g:lib-new options, ...]`,
    )
  } else {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    main(args[0], args.slice(1)).then(
      (exitCode) => (process.exitCode = exitCode),
    )
  }
}
