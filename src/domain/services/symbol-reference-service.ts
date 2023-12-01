import {configStore} from '../../infra/config'
import {getResourcePath} from '../../infra/vscode/document'
import {SymbolProvider} from '../../infra/vscode/symbol-provider'
import {IContentConfig} from '../models/inquiry-template'
import {ISymbolReference} from '../models/lang-types'
import * as vscode from 'vscode'


export class SymbolReferenceService {
  static async processSymbolsWithComments(
    locations: vscode.Location[],
    symbolBlacklist: Set<vscode.SymbolKind>,
    symbolEncloseChild: Set<vscode.SymbolKind>,
    config: IContentConfig
  ): Promise<ISymbolReference[]> {
    const referenceSymbols: ISymbolReference[] = []
    const processedSymbols = new Set<string>()

    for (const location of locations) {
      const document = await vscode.workspace.openTextDocument(location.uri)
      if (!document) continue

      const symbols = await SymbolProvider.getSymbolsFromResource(document.uri)
      if(!symbols) {
        continue
      }

      const symbol: ISymbolReference | undefined = SymbolProvider.findEnclosingSymbol(symbols, location.range.start, symbolBlacklist,symbolEncloseChild)
      if (!symbol) {
        continue
      }


      const id = SymbolProvider.createSymbolIdentifier(document.uri, symbol)
      if (!processedSymbols.has(id)) {
        const rangeDecoratorsComments = SymbolProvider.extendRangeToIncludeDecoratorsAndComments(document, symbol.range, symbol.kind,config)
        const symbolRef = {
          ...symbol,
          id,
          rangeDecoratorsComments,
          text: SymbolReferenceService.getSymbolText(document,symbol,rangeDecoratorsComments),
          langOpts: configStore.getLangOpts(document),
          path: getResourcePath(document.uri),
        }

        referenceSymbols.push(symbolRef)
        processedSymbols.add(symbolRef.id)
      }
    }

    return referenceSymbols
  }

  static getSymbolText(document: vscode.TextDocument,symbol: vscode.DocumentSymbol,rangeDecoratorsComments: vscode.Range) {
    if(symbol.kind === vscode.SymbolKind.Class) {
      return  SymbolProvider.getClassSignature(document,symbol)
    }

    return document.getText(rangeDecoratorsComments)
  }

}

