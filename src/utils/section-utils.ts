import * as vscode from 'vscode'

export enum SectionType { // eslint-disable-line @typescript-eslint/naming-convention
  MULTIPLE_FUNCTIONS_AND_CLASSES = 'Selection (Multiple Functions and Classes)', // eslint-disable-line @typescript-eslint/naming-convention
  MULTIPLE_FUNCTIONS = 'Selection (Multiple Functions)', // eslint-disable-line @typescript-eslint/naming-convention
  MULTIPLE_CLASSES = 'Selection (Multiple Classes)', // eslint-disable-line @typescript-eslint/naming-convention
  CODE_SNIPPET = 'Selection (Code Snippet)', // eslint-disable-line @typescript-eslint/naming-convention
  FULL_FILE = 'File Content', // eslint-disable-line @typescript-eslint/naming-convention
}
/**
 * Determines the type of section that the provided text belongs to.
 *
 * @param text - The text to analyze.
 * @param editor - The active text editor in VS Code.
 * @returns The determined section type.
 */
export const detectSectionType = (text: string, editor: vscode.TextEditor): SectionType => {
  const functionRegex = /function\s+[a-zA-Z_]\w*\s*\(|\([\w\s,]*\)\s*=>/g
  const classRegex = /class\s+[a-zA-Z_]\w*\s*\{/
  const functionMatches = text.match(functionRegex) || []
  const classMatches = text.match(classRegex) || []

  if (isFullFileSelected(editor)) {
    return SectionType.FULL_FILE
  }

  if (functionMatches.length > 1 && classMatches.length > 1) {
    return SectionType.MULTIPLE_FUNCTIONS_AND_CLASSES
  } else if (functionMatches.length > 1) {
    return SectionType.MULTIPLE_FUNCTIONS
  } else if (classMatches.length > 1) {
    return SectionType.MULTIPLE_CLASSES
  } else {
    return SectionType.CODE_SNIPPET
  }
}

function isFullFileSelected(editor: vscode.TextEditor): boolean {
  if (!editor) {
    return false
  }

  const selection = editor.selection
  const document = editor.document

  // Check if the selection and document exist
  if (!selection || !document) {
    return false
  }

  // Check if the selection covers the entire document
  const isFullSelection =
    selection.start.line === 0 && // Start of the document
    selection.start.character === 0 &&
    selection.end.line === document.lineCount - 1 && // End of the document
    selection.end.character === document.lineAt(document.lineCount - 1).text.length

  return isFullSelection
}

/**
 * Adds a debounce to a function call, ensuring that the function is not called too frequently.
 *
 * @param func - The function to debounce.
 * @param wait - The amount of time in milliseconds to wait before allowing the next invocation of the function.
 * @returns A debounced version of the provided function.
 */
export const debounce = (func: () => void, wait: number): (() => void) => {
  let timeout: NodeJS.Timeout | null = null
  return () => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      func()
    }, wait)
  }
}
