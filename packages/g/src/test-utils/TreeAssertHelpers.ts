import {
  UnitTestTree,
  SchematicTestRunner,
} from '@angular-devkit/schematics/testing'

export function matchFileStructureSnapshot(
  creator: () => Promise<{ tree: UnitTestTree }>,
) {
  it('match file structure snapshot', async () => {
    const { tree } = await creator()
    expect(tree.files).toMatchSnapshot('file structure')
  })
}

export function matchFileContentSnapshot(
  creator: () => Promise<{ tree: UnitTestTree }>,
) {
  it('match file content snapshot', async () => {
    const { tree } = await creator()
    tree.files.forEach(file => {
      expect(tree.readContent(file)).toMatchSnapshot(`file content: ${file}`)
    })
  })
}

export function matchTasksSnapshot(
  creator: () => Promise<{ runner: SchematicTestRunner }>,
) {
  it('match tasks snapshot', async () => {
    const { runner } = await creator()
    expect(runner.tasks).toMatchSnapshot('rule tasks')
  })
}

export function matchRunResult(
  creator: () => Promise<{
    tree: UnitTestTree
    runner: SchematicTestRunner
  }>,
) {
  matchFileStructureSnapshot(creator)
  matchFileContentSnapshot(creator)
  matchTasksSnapshot(creator)
}

export function assertTreeSnapshot(
  runner: SchematicTestRunner,
  tree: UnitTestTree,
) {
  expect(tree.files).toMatchSnapshot('file structure')

  tree.files.forEach(file => {
    expect(tree.readContent(file)).toMatchSnapshot(`file content: ${file}`)
  })

  expect(runner.tasks).toMatchSnapshot('rule tasks')
}
