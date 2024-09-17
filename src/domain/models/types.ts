import type * as vscode from 'vscode'

import {type ILangOpts} from '../../shared/types/types'

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

export interface ISymbolReference extends vscode.DocumentSymbol {
  rangeDecoratorsComments?: vscode.Range
  text?: string
  id?: string
  langOpts?: ILangOpts
  path?: string
}
