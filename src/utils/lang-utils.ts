const defaultCodeSnippetLanguage = '[Specify the programming language]'
import { showErrorMessage, log } from './vsc-utils'
import * as vscode from 'vscode'

export function getCodeSnippetLanguageInfo(editor: vscode.TextEditor): string {
  return editor?.document.languageId || defaultCodeSnippetLanguage
}

export async function copyDefinitions() {
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    showErrorMessage('No active editor found!')
    return
  }

  const doc = editor.document
  const allDefinitions: string[] = []

  for (let i = 0; i < doc.lineCount; i++) {
    const position = new vscode.Position(i, 0)
    const definitions = await vscode.commands.executeCommand<vscode.Location[]>('vscode.executeDefinitionProvider', doc.uri, position)

    if (definitions && definitions.length) {
      for (const def of definitions) {
        if (def.uri.fsPath === doc.uri.fsPath) {
          allDefinitions.push(doc.getText(def.range))
        }
      }
    }
  }

  vscode.env.clipboard.writeText(allDefinitions.join('\n'))
  log(`Copied ${allDefinitions.length} definitions to clipboard.`)
}
