import * as vscode from 'vscode'

export type GetWorkspaceFolderFn = (uri: vscode.Uri) => vscode.WorkspaceFolder | undefined
export interface IProjectFile {
  rootPath: string
  files: string[]
}
