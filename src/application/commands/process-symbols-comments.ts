import * as vscode from 'vscode'
import {ISymbolReference} from '../../domain/models/lang-types'
import {SymbolReferenceService} from '../../domain/services/symbol-reference-service'
import {Notify} from '../../infra/vscode/notification'
import {SymbolProvider} from '../../infra/vscode/symbol-provider'



export const processSymbolsWithComments = async (editor: vscode.TextEditor): Promise<ISymbolReference[]> => {
  const locations = await SymbolProvider.getSymbolRefsFromSelection(editor)
  if (locations.length === 0) {
    Notify.temporaryStatus('No references found')
    return []
  }

  const confirmProcessing = await Notify.confirm(`Gather references from selected symbol? total refs: ${locations.length}`, 'Yes', 'Cancel')
  if (!confirmProcessing) {
    return []
  }

  // TODO: load document per location in the processSymbolsWithComments for-of loop
  // const documents = await Promise.all(locations.map(location => vscode.workspace.openTextDocument(location.uri)))
  return SymbolReferenceService.processSymbolsWithComments(
    locations,
    symbolKindBlacklist,
    symbolKindEncloseChild
  )
}

const symbolKindBlacklist = new Set([
  vscode.SymbolKind.File,
  vscode.SymbolKind.Module,
  vscode.SymbolKind.Package,
])

const symbolKindEncloseChild = new Set([
  vscode.SymbolKind.Method,
  vscode.SymbolKind.Constructor,
  vscode.SymbolKind.Field,
  vscode.SymbolKind.Struct,
  vscode.SymbolKind.Event,
])
