# c4g

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

To test locally, install `@angular-devkit/schematics-cli` globally and use the `schematics` command line tool. That tool acts the same as the `generate` command of the Angular CLI, but also has a debug mode.

Check the documentation with

```bash
schematics --help
```

## Unit Testing

`yarn test` will run the unit tests, using Jasmine as a runner and test framework.

## Publishing

To publish, simply do:

```bash
yarn build
yarn publish
```
