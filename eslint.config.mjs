// @ts-check

import tslint from 'typescript-eslint'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import commentsPlugin from 'eslint-plugin-eslint-comments'

import {resolve, dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {includeIgnoreFile} from '@eslint/compat'
import eslintConfigPrettier from 'eslint-config-prettier'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const gitignorePath = resolve(__dirname, '.gitignore')
const {ignores} = includeIgnoreFile(gitignorePath)

/** @type {import("typescript-eslint").ConfigWithExtends} */
const config = {
  files: ['src/**/*.ts'],
  plugins: {
    '@typescript-eslint': tslint.plugin,
    'simple-import-sort': simpleImportSort,
    'eslint-comments': commentsPlugin,
  },
  linterOptions: {
    reportUnusedDisableDirectives: 'error',
  },
  languageOptions: {
    parser: tslint.parser,
    parserOptions: {
      ecmaFeatures: {impliedStrict: true},
      ecmaVersion: 'latest',
      sourceType: 'module',
      projectService: true,
      project: './tsconfig.json',
      tsconfigRootDir: __dirname,
      warnOnUnsupportedTypeScriptVersion: false,
    },
    globals: {
      NodeJS: 'readonly',
      process: 'readonly',
      setTimeout: 'readonly',
      setInterval: 'readonly',
      clearInterval: 'readonly',
      clearTimeout: 'readonly',
      console: 'readonly',
      Buffer: 'readonly',
      require: 'readonly',
    },
  },
  rules: {
    //...tslint.configs.recommended,
    //...tslint.configs["recommended-type-checked"].rules,
    //...tslint.configs["stylistic-type-checked"].rules,
    // "max-len": ["error", {"code": 160, "ignoreUrls": true}],
    "eslint-comments/no-unused-disable": "error",
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        fixStyle: 'inline-type-imports',
        prefer: 'type-imports',
        disallowTypeAnnotations: false,
      },
    ],

    // This one is just annoying since it complains at incomplete code
    'no-empty': 'off',

    // Doesn't properly handle intersections of generics.
    '@typescript-eslint/unified-signatures': 'off',

    // This rule is factually incorrect. Interfaces which extend some type alias can be used to introduce
    // new type names. This is useful particularly when dealing with mixins.
    '@typescript-eslint/no-empty-interface': 'off',

    // Conflicts with TS option to require dynamic access for records, which I find more useful.
    '@typescript-eslint/no-dynamic-delete': 'off',

    // Conflicts with the `NeverIfInternal` type used to enforce a stricter API internally
    '@typescript-eslint/no-redundant-type-constituents': 'off',
    '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'off',

    // This is sometimes useful for clarity
    '@typescript-eslint/no-unnecessary-type-arguments': 'off',

    // We still use `any` fairly frequently...
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',

    // Really annoying, doesn't provide any value.
    '@typescript-eslint/no-empty-function': 'off',

    // Declaration merging with a namespace is a necessary tool when working with enums.
    '@typescript-eslint/no-namespace': 'off',

    // Reported by TypeScript
    '@typescript-eslint/no-unused-vars': 'off',
    //"no-unused-vars": ["error", {
    //  "vars": "all",
    //  "argsIgnorePattern": "^_",
    //  "destructuredArrayIgnorePattern": "^_",
    //  "args": "after-used",
    //  "caughtErrors": "all",
    //  "ignoreRestSiblings": true,
    //  "ignoreClassWithStaticInitBlock": true,
    //  "reportUsedIgnorePattern": false
    //}],

    'no-console': 'off',

    '@typescript-eslint/no-confusing-void-expression': 'off',
    '@typescript-eslint/unbound-method': 'off',

    '@typescript-eslint/prefer-literal-enum-member': [
      'error',
      {allowBitwiseExpressions: true},
    ],

    // I'd like to have this turned on, but haven't figured out how to tell it about
    // checks that are correctly linted as unnecessary for TypeDoc's usage, but not
    // for plugin permitted usage.
    '@typescript-eslint/no-unnecessary-condition': 'off',

    // Feel free to turn one of these back on and submit a PR!
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',

    'no-restricted-syntax': [
      'warn',
      {
        selector: 'ImportDeclaration[source.value=/.*perf$/]',
        message: 'Benchmark calls must be removed before committing.',
      },
      {
        selector: 'MemberExpression[object.name=type][property.name=symbol]',
        message:
          'Use type.getSymbol() instead, Type.symbol is not properly typed.',
      },
    ],

    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    // prettier conflict
    // "linebreak-style": ["error", "unix"],
    'spaced-comment': ['error', 'always', {exceptions: ['-', '+']}],
  },
}

export default tslint.config(
  {
    ignores: [
      '**/out',
      '**/*.mjs',
      '**/docs',
      '**/test/**/*.ts',
      '**/scripts',
      '**/*.d.ts',
      '**/tsup.config.ts',
      ...(ignores || []),
    ],
  },
  //...tslint.configs.strict,
  //...tslint.configs.stylistic,
  // eslint.configs.recommended,
  ...tslint.configs.strictTypeChecked,
  ...tslint.configs.recommended,
  eslintConfigPrettier,
  config,
  {
    ignores: [
      '**/out',
      '**/*.mjs',
      '**/docs',
      '**/test/**/*.ts',
      '**/scripts',
      '**/*.d.ts',
      '**/tsup.config.ts',
      ...(ignores || []),
    ],
  },
)
