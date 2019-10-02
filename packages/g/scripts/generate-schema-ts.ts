import {
  resolve,
  relative,
  parse as parsePath,
  format as formatPath,
} from 'path'
import { main as quicktypeCliMain } from 'quicktype'

main(process.argv.slice(2))

async function main(args: string[]) {
  if (!args.length) return

  await Promise.all(args.map(p => buildFile(p)))
}

async function buildFile(path: string) {
  path = resolve(process.cwd(), path)

  const out = replaceExt(path, '.ts')

  await quicktypeCliMain({
    src: [path],
    out,
    lang: 'typescript',
    srcLang: 'schema',
    rendererOptions: {
      'nice-property-names': true,
      'just-types': true,
    } as any,
  })

  console.log(`Updated ${relative(process.cwd(), out)}`)
}

function replaceExt(path: string, ext: string) {
  return formatPath({
    ...parsePath(path),
    base: undefined,
    ext,
  })
}
