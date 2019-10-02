#!/usr/bin/env node

import * as dedent from 'dedent'
import { main as schematicsCliMain } from '@angular-devkit/schematics-cli/bin/schematics'

export function main(name: string, opts: string[]) {
  // @angular-devkit/schematics-cli may be hoisted, but we don't want use hoisted @c4/g
  const c4gPath = require.resolve('@c4/g')

  return schematicsCliMain({
    args: [
      `${c4gPath}/src/collection.json:react-new`,
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
      dedent`yarn create @c4/react projectName [@c4/g:react-new options, ...]`,
    )
  } else {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    main(args[0], args.slice(1)).then(exitCode => (process.exitCode = exitCode))
  }
}
