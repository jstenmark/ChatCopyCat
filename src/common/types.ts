import * as vscode from 'vscode'

export type GetWorkspaceFolderFn = (uri: vscode.Uri) => vscode.WorkspaceFolder | undefined
export interface IProjectFile {
  rootPath: string
  files: string[]
}

export interface ILangOpts {
  tabSize: number
  insertSpaces: boolean
  language: string
}
export interface IContentSection {
  selectionSection: string
  selectionDiagnostics: vscode.Diagnostic[]
}
