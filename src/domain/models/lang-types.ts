import type * as vscode from 'vscode'

import {type ILangOpts} from '../../shared/types/types'

export interface ISymbolReference extends vscode.DocumentSymbol {
  rangeDecoratorsComments?: vscode.Range
  text?: string
  id?: string
  langOpts?: ILangOpts
  path?: string
}
