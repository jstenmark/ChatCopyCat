import { LogLevel, LogLevelNumeric } from './types'

export const defaultTabSize = 2

export const functionRegex = /function\s+[a-zA-Z_]\w*\s*\(|\([\w\s,]*\)\s*=>/g
export const classRegex = /class\s+[a-zA-Z_]\w*\s*\{/

export const selectionHeader = '[Code Inquiry'
export const fileTreeHeader = '[File Tree] // Root path:'
export const fileTreeEnd = '[File Tree End]'

export const validFileSchemes = new Set(['file', 'untitled'])

export const LogLevelToNumeric: Record<LogLevel, LogLevelNumeric> = {
  [LogLevel.DEBUG]: LogLevelNumeric.DEBUG,
  [LogLevel.INFO]: LogLevelNumeric.INFO,
  [LogLevel.WARN]: LogLevelNumeric.WARN,
  [LogLevel.ERROR]: LogLevelNumeric.ERROR,
}

export const languageExtensionMap: Record<string, string[]> = {
  plaintext: ['.txt'],
  log: ['.log'],
  bat: ['.bat', '.cmd'],
  clojure: ['.clj', '.cljs', '.cljc', '.edn'],
  coffeescript: ['.coffee', '.cson'],
  json: ['.json'],
  c: ['.c'],
  cpp: ['.cpp', '.cxx', '.cc', '.h', '.hpp'],
  csharp: ['.cs'],
  css: ['.css'],
  dart: ['.dart'],
  diff: ['.diff', '.patch'],
  dockerfile: ['Dockerfile'],
  fsharp: ['.fs', '.fsx', '.fsi'],
  go: ['.go'],
  groovy: ['.groovy', '.gvy', '.gy', '.gsh'],
  handlebars: ['.hbs', '.handlebars'],
  hlsl: ['.hlsl', '.hlsli'],
  html: ['.html', '.htm', '.xhtml'],
  ini: ['.ini'],
  properties: ['.properties'],
  java: ['.java'],
  javascript: ['.js', '.mjs'],
  'jsx-tags': ['.jsx'],
  jsonl: ['.jsonl'],
  julia: ['.jl'],
  latex: ['.tex', '.latex', '.ltx'],
  less: ['.less'],
  lua: ['.lua'],
  makefile: ['Makefile'],
  markdown: ['.md', '.markdown'],
  'objective-c': ['.m'],
  'objective-cpp': ['.mm'],
  perl: ['.pl', '.pm'],
  php: ['.php', '.phtml', '.php4', '.php5', '.phps'],
  powershell: ['.ps1', '.psm1', '.psd1'],
  python: ['.py', '.pyw', '.pyc', '.pyo', '.pyd'],
  r: ['.r', '.R'],
  ruby: ['.rb'],
  rust: ['.rs'],
  scss: ['.scss'],
  sql: ['.sql'],
  swift: ['.swift'],
  typescript: ['.ts', '.mts'],
  vb: ['.vb'],
  xml: ['.xml', '.xsl', '.xsd', '.svg'],
  yaml: ['.yaml', '.yml'],
}
