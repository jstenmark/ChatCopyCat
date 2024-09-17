export const defaultTabSize = 2
export const defaultJsonTabSize = 2

export const selectionHeader = '[Code Inquiry'
export const fileTreeHeader = '[File Tree] Root:'
export const fileTreeEnd = '[File Tree End]'

export const validFileSchemes = new Set(['file', 'untitled'])

export const ERROR_MESSAGES = {
  INVALID_CONFIRMATION: 'Invalid confirmation value. Please enter "yes" or "no".',
  ONLY_LOWER_CASE_ALLOWED: 'Only lowercase letters are allowed.',
  INVALID_URL: 'Invalid URL format.',
  VALUE_CANNOT_BE_EMPTY: 'Value cannot be empty.',
  INVALID_ARRAY_ITEM: 'The item youre trying to add does not meet the required type criteria for this array.',
  INVALID_ARRAY: 'The provided value is not a valid array. Please ensure its an array type.',
  INVALID_NUMBER: 'The entered value must be a number. Please check and enter a valid numeric value.',
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

export const extPublisher = 'JStenmark'
export const extId = 'chatcopycat'
export const extName = 'ChatCopyCat'
