const defaultCodeSnippetLanguage = '[Specify the programming language]'
import * as vscode from 'vscode'

export function getCodeSnippetLanguageInfo(editor: vscode.TextEditor): string {
  return editor?.document.languageId || defaultCodeSnippetLanguage
}
