import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin'
import globals from 'globals'

export default tseslint.config({
  files: ['src/**/*.ts', 'src/**/*.tsx', 'tests/**/*.ts', ],
  extends: [
    js.configs.recommended,
    stylistic.configs.recommended,
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,
  ],
  plugins: {
    '@stylistic': stylistic,
  },
  languageOptions: {
    globals: globals.browser,
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    }
  },
  rules: {
    ...stylistic.configs.recommended.rules,
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { args: 'all', argsIgnorePattern: '^_', caughtErrors: 'all', caughtErrorsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true }],
    '@typescript-eslint/restrict-template-expressions': [ 'error', { allowNumber: true, allow: [{ name: 'ReadonlySignal', from: 'package', package: '@preact/signals' }] }],
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-empty-object-type': 'off',
    '@typescript-eslint/no-unnecessary-type-parameters': 'off',
    "@typescript-eslint/no-deprecated": ['error', {
      "allow": [
        { from: 'package', package: 'planck', name: 'Vec2' },
        { from: 'package', package: 'planck', name: 'World' },
        { from: 'package', package: 'planck', name: 'Box' },
        { from: 'package', package: 'planck', name: 'Circle' },
        { from: 'package', package: 'planck', name: 'Polygon' },
      ]
    }],
    '@stylistic/max-statements-per-line': ['error', { max: 2 }],
    '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
    '@stylistic/arrow-parens': ['error', 'always'],
    '@stylistic/jsx-one-expression-per-line': 'off',
  }
})
