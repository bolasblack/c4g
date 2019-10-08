import * as path from 'path'
import { files } from './files'
import { Source } from '@angular-devkit/schematics'

export function file(filePath: string): Source {
  return files(path.dirname(filePath), [path.basename(filePath)])
}
