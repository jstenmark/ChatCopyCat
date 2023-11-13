import { Diagnostic } from 'vscode'

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
  selectionDiagnostics: Diagnostic[]
}
