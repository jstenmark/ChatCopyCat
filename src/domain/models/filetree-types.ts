import * as vscode from 'vscode'


export interface IFileTreeNode {
  path: string
  isFolder: boolean
  children?: IFileTreeNode[]
  rootPath: string
}

export interface IPathAndUri {
  path: string
  uri: vscode.Uri
}

export interface IFileListItem {
  path: string
  isFolder: boolean
  rootPath: string
}

export interface IFileTreeDialogItem extends vscode.QuickPickItem {
  filePath: string
  rootPath: string
  isFolder: boolean
}
