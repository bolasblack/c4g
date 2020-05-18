module.exports = {
  root: true,
  extends: [
    './node_modules/@c4605/toolconfs/eslintrc.base',
    './node_modules/@c4605/toolconfs/eslintrc.prettier',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars-experimental': [
      'error',
      { ignoreArgsIfArgsAfterAreUsed: true },
    ],
  },
  overrides: [
    {
      files: ['src/**/*.ts', 'src/**/*.tsx', 'packages/**/*.ts'],
      parserOptions: {
        project: './tsconfig.eslint.json',
      },
      extends: ['./node_modules/@c4605/toolconfs/eslintrc.ts'],
      rules: {
        '@typescript-eslint/ban-ts-ignore': 'off',
      },
    },
  ],
}
