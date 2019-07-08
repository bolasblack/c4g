import {
  UnitTestTree,
  SchematicTestRunner,
} from '@angular-devkit/schematics/testing'

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
