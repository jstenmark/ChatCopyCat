import * as vscode from 'vscode'

export type GetWorkspaceFolderFn = (uri: vscode.Uri) => vscode.WorkspaceFolder | undefined
