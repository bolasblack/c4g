# @c4/g

## Plans

## Testing

To test locally:

```bash
# cd project and create link
cd /path/to/this/project
yarn link

# install this project globally and change to symlink
yarn global add file:$PWD
cd $(yarn global dir)
yarn link @c4/g

# install schematics-cli globally
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

## Development

Install [`entr`](https://github.com/eradman/entr/) at first, then run `yarn watch`.

## Publishing

To publish, simply do:

```bash
yarn build
yarn publish
```
