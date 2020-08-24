module.exports = {
  root: true,
  extends: [
    './node_modules/@c4605/toolconfs/eslintrc.base',
    './node_modules/@c4605/toolconfs/eslintrc.prettier',
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {},
  overrides: [
    {
      files: ['packages/**/*.ts'],
      parserOptions: {
        project: './tsconfig.eslint.json',
      },
      extends: ['./node_modules/@c4605/toolconfs/eslintrc.ts'],
      rules: {
        '@typescript-eslint/ban-ts-ignore': 'off',
        '@typescript-eslint/no-unused-vars-experimental': [
          'error',
          { ignoreArgsIfArgsAfterAreUsed: true },
        ],
      },
    },
  ],
}
