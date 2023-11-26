import {getResourcePath} from "../../infra/vscode/document"
import {SymbolProvider} from "../../infra/vscode/symbol-provider"
import {ISymbolReference} from "../models/definition-types"
import * as vscode from 'vscode'


export class SymbolReferenceService {
  static async processSymbolsWithComments(
    locations: vscode.Location[],
    documents: vscode.TextDocument[],
    symbolBlacklist: Set<vscode.SymbolKind>,
    symbolEncloseChild: Set<vscode.SymbolKind>
  ): Promise<ISymbolReference[]> {
    const referenceSymbols: ISymbolReference[] = []
    const processedSymbols = new Set<string>()

    for (const location of locations) {
      const document = documents.find(doc => doc.uri.toString() === location.uri.toString())
      if (!document) continue

      const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
        'vscode.executeDocumentSymbolProvider',
        document.uri,
      )

      if(!symbols) {
        continue
      }

      const path = getResourcePath(document.uri)
      const symbol: ISymbolReference | undefined = SymbolProvider.findEnclosingSymbol(symbols, location.range.start, symbolBlacklist,symbolEncloseChild)

      if (!symbol) {
        continue
      }

      symbol.id = SymbolProvider.createSymbolIdentifier(document.uri, symbol)
      if (!processedSymbols.has(symbol.id)) {
        symbol.rangeDecoratorsComments = SymbolProvider.extendRangeToIncludeDecoratorsAndComments(document, symbol.range, symbol.kind)
        symbol.text = document.getText(symbol.rangeDecoratorsComments)
        symbol.langOpts = {language: document.languageId, insertSpaces: true, tabSize: 2}
        symbol.path = path

        referenceSymbols.push(symbol)
        processedSymbols.add(symbol.id)
      }
    }

    return referenceSymbols
  }

}