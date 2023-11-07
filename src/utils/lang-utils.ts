import * as vscode from 'vscode'
import { ILangOpts } from '../common/types'

export const getLangOpts = (editor: vscode.TextEditor): ILangOpts => {
  const { tabSize: _tabSize, insertSpaces: _insertSpaces }: vscode.TextEditorOptions =
    editor.options
  const { languageId: language }: vscode.TextDocument = editor.document

  const tabSize: number = typeof _tabSize === 'number' ? _tabSize : 2
  const insertSpaces = !!_insertSpaces

  return { tabSize, language, insertSpaces }
}

export async function copyDefinitions(): Promise<void> {
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    await vscode.window.showErrorMessage('No active editor found!')
    return
  }
  const doc = editor.document
  const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
    'vscode.executeDocumentSymbolProvider',
    doc.uri,
  )

  if (!symbols) {
    await vscode.window.showInformationMessage('No symbols found in the document.')
    return
  }

  const allDefinitions: string[] = symbols.map(symbol => doc.getText(symbol.range))

  await vscode.env.clipboard.writeText(allDefinitions.join('\n\n')) // Separated by two newlines for readability
  await vscode.window.showInformationMessage(
    `Copied ${allDefinitions.length} definitions to clipboard.`,
  )
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
