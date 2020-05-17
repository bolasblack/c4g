import { Source, url, apply, filter } from '@angular-devkit/schematics'

export function files(folder: string, fileNames: string[]): Source {
  fileNames = fileNames.map(n => `/${n}`)
  return apply(url(folder), [filter(i => fileNames.includes(i))])
}
