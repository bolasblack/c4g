# @c4/g

## Roadmap

- `jest` schematic
  - [x] Create `jest` schematic
- `node-new` schematic
  - [ ] Add `lint-staged`, `commitlint`, `githooks`, `renovate` configs
  * [x] Add `jest` option
  * [ ] Publish `@c4/create-node` (`yarn create @c4/node`)
- `react` schematic
  - [ ] Create `react` schematic
  - [ ] Add `jest` option
  - [ ] Publish `@c4/create-react` (`yarn create @c4/react`)

Related:

- https://yarnpkg.com/blog/2017/05/12/introducing-yarn/

## Testing

To test locally:

```bash
// cd project and create link
cd /path/to/this/project
yarn link

// install this project globally and change to symlink
yarn global add file:$PWD
cd $(yarn global dir)
yarn link @c4/g

// install schematics-cli globally
yarn global add @angular-devkit/schematics-cli
```

and use the `schematics` command line tool.

Check the documentation with

```bash
schematics --help
```

Create a new schematic with command:

```bash
schematics @c4/g:schematic --name=
```

## Unit Testing

`yarn test` will run the unit tests, using Jest as a runner and test framework.

## Publishing

To publish, simply do:

```bash
yarn build
yarn publish
```
