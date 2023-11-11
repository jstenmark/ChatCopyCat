import * as vscode from 'vscode'
import { ILangOpts } from '../common'

export const getLangOpts = (editor: vscode.TextEditor): ILangOpts => {
  const { tabSize: _tabSize, insertSpaces: _insertSpaces }: vscode.TextEditorOptions =
    editor.options
  const { languageId: language }: vscode.TextDocument = editor.document

  const tabSize: number = typeof _tabSize === 'number' ? _tabSize : 2
  const insertSpaces = !!_insertSpaces

  return { tabSize, language, insertSpaces }
}

/**
 * Adds a debounce to a function call, ensuring that the function is not called too frequently.
 *
 * @param func - The function to debounce.
 * @param wait - The amount of time in milliseconds to wait before allowing the next invocation of the function.
 * @returns A debounced vscode.version of the provided function.
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
