import {
  Rule,
  apply,
  mergeWith,
  template,
  url,
  chain,
} from '@angular-devkit/schematics'
import { Schema as Options } from './schema'

export { Options }

export function main(options: Options): Rule {
  return tree => {
    return chain([mergeWith(apply(url('./files'), [template(options)]))])
  }
}
