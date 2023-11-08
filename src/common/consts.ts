export const defaultIgnoreList = [
  'out/**',
  'docs/**',
  '.vscode/**',
  '.git/**',
  'node_modules/**',
  'docs',
  '**/__pycache__/**',
  '.vscode-test',
]
export const defaultTabSize = 2

export const functionRegex = /function\s+[a-zA-Z_]\w*\s*\(|\([\w\s,]*\)\s*=>/g
export const classRegex = /class\s+[a-zA-Z_]\w*\s*\{/

export const questionContextExamples = [
  'Optimization',
  'Syntax',
  'Logic',
  'Debugging',
  'Error Handling',
  'Code Structure',
  'Performance',
  'Testing',
  'Security',
  'Documentation',
  'Docstrings',
]
export const metadataHeader = '# ChatGPT Code inquiry'
