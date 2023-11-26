import * as vscode from "vscode"
import {ISymbolReference} from "../../domain/models/definition-types"
import {SymbolReferenceService} from "../../domain/services/symbol-reference-service"
import {Notify} from "../../infra/vscode/notification"
import {SymbolProvider} from "../../infra/vscode/symbol-provider"



export const processSymbolsWithComments = async (editor: vscode.TextEditor): Promise<ISymbolReference[]> => {
  const locations = await SymbolProvider.getSymbolsFromSelection(editor)
  if (locations.length === 0) {
    Notify.temporaryStatus('No references found')
    return []
  }

  const confirmProcessing = await Notify.confirm(`Gather references from selected symbol? total refs: ${locations.length}`, 'Yes', 'Cancel')
  if (!confirmProcessing) {
    return []
  }

  const documents = await Promise.all(locations.map(location => vscode.workspace.openTextDocument(location.uri)))
  return SymbolReferenceService.processSymbolsWithComments(
    locations,
    documents,
    symbolKindBlacklist,
    symbolKindEncloseChild
  )
}

const symbolKindBlacklist = new Set([
  vscode.SymbolKind.File,
  vscode.SymbolKind.Module,
  vscode.SymbolKind.Package,
  vscode.SymbolKind.Class
])

const symbolKindEncloseChild = new Set([
  vscode.SymbolKind.Method,
  vscode.SymbolKind.Property,
  vscode.SymbolKind.Constructor,
  vscode.SymbolKind.Enum,
  vscode.SymbolKind.Field,
  vscode.SymbolKind.Interface,
  vscode.SymbolKind.Struct,
  vscode.SymbolKind.Event
])
