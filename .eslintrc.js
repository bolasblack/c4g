module.exports = {
  root: true,
  extends: [
    './node_modules/@c4605/toolconfs/eslintrc.base',
    './node_modules/@c4605/toolconfs/eslintrc.prettier',
    './node_modules/@c4605/toolconfs/eslintrc.esnext',
  ],
  rules: {},
  overrides: [
    {
      files: ['src/**/*.ts', 'src/**/*.tsx', 'packages/**/*.ts'],
      parserOptions: {
        project: './tsconfig.eslint.json',
      },
      extends: ['./node_modules/@c4605/toolconfs/eslintrc.ts'],
    },
  ],
}
