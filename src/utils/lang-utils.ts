import * as vscode from 'vscode'
import { ILangOpts } from './types'
import { log, showNotification } from './vsc-utils'

export const getLangOpts = (editor: vscode.TextEditor): ILangOpts => {
  const { tabSize: _tabSize, insertSpaces: _insertSpaces }: vscode.TextEditorOptions = editor.options
  const { languageId: language }: vscode.TextDocument = editor.document

  const tabSize: number = typeof _tabSize === 'number' ? _tabSize : 2
  const insertSpaces = !!_insertSpaces

  return { tabSize, language, insertSpaces }
}

export async function copyDefinitions() {
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    showNotification('error', 'No active editor found!')
    return
  }

  const doc = editor.document
  const allDefinitions: string[] = []

  for (let i = 0; i < doc.lineCount; i++) {
    const position = new vscode.Position(i, 0)
    const definitions = await vscode.commands.executeCommand<vscode.Location[]>('vscode.executeDefinitionProvider', doc.uri, position)

    if (definitions?.length) {
      for (const def of definitions) {
        if (def.uri.fsPath === doc.uri.fsPath) {
          allDefinitions.push(doc.getText(def.range))
        }
      }
    }
  }

  await vscode.env.clipboard.writeText(allDefinitions.join('\n'))
  log(`Copied ${allDefinitions.length} definitions to clipboard.`)
}
