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

export const descriptionExamples = [
  'This is part of a larger project.',
  'Im getting a "TypeError" when running the code.',
  'This code is part of a larger project related to e-commerce.',
  'Im following a tutorial on YouTube, and Im stuck at this step.',
  'Im working on a personal project for data analysis.',
  'This code is intended to be used in a web application.',
  'Ive already tried changing the variable names, but it didnt work.',
  'Im using the latest version of Node.js.',
  'Im new to programming and trying to learn JavaScript.',
  'This code was working fine until I made some changes yesterday.',
]

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
export const metadataHeader = '# VSCode'
