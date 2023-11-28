import * as vscode from 'vscode'

export interface ILangOpts {
  insertSpaces: boolean
  language: string
  tabSize: number
}
export interface IContentSection {
  selectionDiagnostics: vscode.Diagnostic[]
  selectionSection: string
}

export interface IHeadersPresent {
  clipboardContent: string
  fileTreeEndPresent: boolean
  fileTreeHeaderPresent: boolean
  selectionHeaderPresent: boolean
}

export interface IHeaderIndex {
  clipboardContent: string
  fileTreeEndIndex: number
  fileTreeHeaderIndex: number
  selectionHeaderEnd: number
  selectionHeaderIndex: number
}

export type DialogComponent = vscode.QuickPick<vscode.QuickPickItem> | vscode.InputBox

export type Optional<T extends object, K extends keyof T = keyof T> = Omit<T, K> &
Partial<Pick<T, K>>
