import * as vscode from 'vscode'
import {IFileTreeNode} from '../../../domain/models/definition-types'

export const ignoreButton: vscode.QuickInputButton = {
  iconPath: new vscode.ThemeIcon('eye-closed'),
  tooltip: 'Ignore this item',
}
export const ignoreResetButton: vscode.QuickInputButton = {
  iconPath: new vscode.ThemeIcon('archive'),
  tooltip: 'Reset ignore list',
}
export const cacheResetButton: vscode.QuickInputButton = {
  iconPath: new vscode.ThemeIcon('history'),
  tooltip: 'Clear selection cache',
}

export const selectFileTreeDialogItem = (node: IFileTreeNode, label: string) => ({
  label,
  filePath: node.path,
  isFolder: node.isFolder,
  rootPath: node.rootPath,
  buttons: [cacheResetButton, ignoreResetButton, ignoreButton],
})
