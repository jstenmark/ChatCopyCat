/** @type {import("prettier").Config} */
const config = {
  trailingComma: "all",
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  printWidth: 160,
  bracketSpacing: true,
  bracketSameLine: true,
  arrowParens: "avoid",
  htmlWhitespaceSensitivity: "strict",
  endOfLine: "lf",
  openingBraceNewLine: "false",
  braceStyle: "1tbs",
  documentSelectors: [
    "**/*.{js,jsx,ts,tsx,vue,html,css,scss,less,json,md,mdx,graphql,yaml,yml,php}"
  ]
};

export default config;
