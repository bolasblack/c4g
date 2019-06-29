import { UnitTestTree } from '@angular-devkit/schematics/testing'
import { SchematicTestRunner } from '../test-utils/SchematicTestRunner'

export function assertTreeSnapshot(
  runner: SchematicTestRunner,
  tree: UnitTestTree,
) {
  // @ts-ignore
  expect(tree.files).toMatchSnapshot('file structure')
  tree.files.forEach(file => {
    // @ts-ignore
    expect(tree.readContent(file)).toMatchSnapshot(`file content: ${file}`)
  })

  // @ts-ignore
  expect(runner.tasks).toMatchSnapshot('rule tasks')
}
