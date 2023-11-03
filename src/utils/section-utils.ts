import * as vscode from 'vscode'
import { SectionType } from './consts'

/**
 * Determines the type of section that the provided text belongs to.
 *
 * @param text - The text to analyze.
 * @param editor - The active text editor in VS Code.
 * @returns The determined section type.
 */
export const detectSectionType = (editor: vscode.TextEditor): SectionType => {
  if (isFullFileSelected(editor)) {
    return SectionType.FULL_FILE
  } else if (editor.selections.length > 1) {
    return SectionType.MULTIPLE_SELECTIONS
  } else {
    return SectionType.CODE_SNIPPET
  }
}

function isFullFileSelected(editor: vscode.TextEditor): boolean {
  const selection = editor.selection
  const document = editor.document

  return selection.start.isEqual(new vscode.Position(0, 0)) && selection.end.isEqual(document.lineAt(document.lineCount - 1).range.end)
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
