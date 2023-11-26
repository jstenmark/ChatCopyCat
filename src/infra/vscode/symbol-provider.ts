import * as vscode from 'vscode'
import {log} from "../logging/log-base"


export class SymbolProvider {
  static async getSymbolsFromSelection(
    editor: vscode.TextEditor,
  ): Promise<vscode.Location[]> {
    return (
      await vscode.commands.executeCommand<vscode.Location[]>(
        'vscode.executeReferenceProvider',
        editor.document.uri,
        editor.selection.active,
      )
    ) ?? []
  }

  static findEnclosingSymbol(
    symbols: vscode.DocumentSymbol[],
    position: vscode.Position,
    symbolKindBlacklist: Set<number>,
    symbolKindEncloseChild: Set<number>
  ): vscode.DocumentSymbol | undefined {
    for (const symbol of symbols) {
      if (symbol.range.contains(position)) {
        if (symbolKindBlacklist.has(symbol.kind)) {
          continue
        }

        const childSymbol = SymbolProvider.findEnclosingSymbol(symbol.children, position, symbolKindBlacklist,symbolKindEncloseChild)
        if (childSymbol && symbolKindEncloseChild.has(childSymbol.kind)) {
          log.info(`Child:${childSymbol.name} Kind:${childSymbol.kind}`,symbol.detail)
            return childSymbol
        }
        log.info(`Default:${symbol.name} Kind:${symbol.kind}`,symbol.detail)
        return symbol
      }
    }
    return undefined
  }

  static extendRangeToIncludeDecoratorsAndComments(
    document: vscode.TextDocument,
    range: vscode.Range,
    symbolKind: vscode.SymbolKind,
  ): vscode.Range {
    let startLine = range.start.line
    if ([vscode.SymbolKind.Method, vscode.SymbolKind.Property, vscode.SymbolKind.Class].includes(symbolKind)) {
      while (startLine > 0) {
        const lineText = document.lineAt(startLine - 1).text.trim()
        if (lineText.startsWith('@')) {
          startLine--
        } else {
          break
        }
      }
    }

    while (startLine > 0) {
      const lineText = document.lineAt(startLine - 1).text.trim()
      if (lineText.startsWith('//') || lineText.startsWith('*') || lineText.startsWith('/*')) {
        startLine--
      } else {
        break
      }
    }

    return new vscode.Range(new vscode.Position(startLine, 0), range.end)
  }

  static createSymbolIdentifier(uri: vscode.Uri, symbol: vscode.DocumentSymbol): string {
    return `${uri.toString()}-${symbol.kind}-${symbol.name}-${symbol.range.start.line}:${symbol.range.start.character}-${symbol.range.end.line}:${symbol.range.end.character}`
  }
}