import typescriptEslint from "@typescript-eslint/eslint-plugin"
import stylisticTs from '@stylistic/eslint-plugin-ts'
import parserTs from '@typescript-eslint/parser'


export default [
  {
    files: ["src/**/*.ts"],
    ignores: [
      "src/test/**",
      "out",
      "scripts",
      "scripts/node_modules",
      "**/*.d.ts",
    ],
    plugins: {
      "@typescript-eslint": typescriptEslint,
      "@stylistic/ts": stylisticTs,
    },
    languageOptions: {
      parser: parserTs,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: true,
        lib: ["ES2022", "ESNext.AsyncIterable"],
      },
    },
    rules: {
      "@stylistic/ts/indent": ["error", 2],
      "@stylistic/ts/no-extra-semi": ["error"],
      "@stylistic/ts/quotes": ["error", "single", {
        avoidEscape: true,
        allowTemplateLiterals: false,
      }],
      "@typescript-eslint/no-unused-vars": ["error", {
        argsIgnorePattern: "^_",
        vars: "all",
        args: "after-used",
        ignoreRestSiblings: true,
        caughtErrors: "none",
      }],
      "@stylistic/ts/brace-style": ["error", "1tbs", {
        allowSingleLine: true,
      }],
      "@stylistic/ts/no-underscore-dangle": "off",
      "@typescript-eslint/naming-convention": ["error", {
        selector: "interface",
        format: ["PascalCase"],
        custom: {
          regex: "^I[A-Z]",
          match: true,
        },
      }],
      "@stylistic/ts/semi": ["error", "never"],
      "@stylistic/ts/comma-dangle": ["error", {
        arrays: "only-multiline",
        objects: "only-multiline",
        imports: "only-multiline",
        exports: "only-multiline",
        functions: "ignore",
      }],
      "linebreak-style": ["error", "unix"],
      "spaced-comment": ["error", "always", {"exceptions": ["-", "+"]}],
      "eqeqeq": "warn",
      "no-throw-literal": "warn",
    },
  },
  //jsLint.configs.recommended,
  //typescriptEslint.configs["recommended-type-checked"],
  //stylisticTs.configs["recommended"],
]


