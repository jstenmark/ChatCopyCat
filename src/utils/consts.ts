export const defaultIgnoreList = ['out/**', 'docs/**', '.vscode/**', '.git/**', 'node_modules/**', 'docs', '**/__pycache__/**', '.vscode-test']
export const defaultTabSize = 2

export enum SectionType {
  MULTIPLE_SELECTIONS = 'Selections',
  MULTIPLE_FUNCTIONS_AND_CLASSES = 'Selection (Multiple Functions and Classes)',
  MULTIPLE_FUNCTIONS = 'Selection (Multiple Functions)',
  MULTIPLE_CLASSES = 'Selection (Multiple Classes)',
  CODE_SNIPPET = 'Selection (Code Snippet)',
  FULL_FILE = 'File Content',
}
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
]
export const metadataHeader = '# ChatGPT Code inquiry'
