import * as vscode from 'vscode'

import {type IContentConfig} from '../../domain/models/inquiry-template'
import {configStore} from '../config/config-store'
import {log} from '../logging/log-base'


export class SymbolProvider {
  static async getSymbolRefsFromSelection(
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

  static async getSymbolsFromResource(
    uri: vscode.Uri,
  ): Promise<vscode.DocumentSymbol[] | undefined> {
    return await vscode.commands.executeCommand<vscode.DocumentSymbol[]>('vscode.executeDocumentSymbolProvider', uri)
  }

  static findEnclosingSymbol(
    symbols: vscode.DocumentSymbol[],
    position: vscode.Position,
    symbolKindBlacklist: Set<number>,
    symbolKindEncloseChild: Set<number>,
    parentKind?: vscode.SymbolKind,
  ): vscode.DocumentSymbol | undefined {
    for (const symbol of symbols) {
      if (symbol.range.contains(position)) {
        const action = SymbolProvider.determineAction(symbolKindBlacklist, symbolKindEncloseChild, symbol, parentKind)
        let childSymbol: vscode.DocumentSymbol | undefined = undefined

        log.debug(`SYMBOL: ${symbol.name}\t KIND: ${vscode.SymbolKind[symbol.kind]}\t PARENTKIND: ${parentKind ? vscode.SymbolKind[parentKind] : ''}`)

        switch (action) {
          case Action.Skip:
            continue
          case Action.Copy:
          case Action.CopySignature:
            return symbol
          case Action.CopyWithChildren:
            childSymbol = SymbolProvider.findEnclosingSymbol(symbol.children, position, symbolKindBlacklist, symbolKindEncloseChild, symbol.kind)
            return childSymbol ?? symbol
        }
      }
    }
    return undefined
  }

  static determineAction(symbolKindBlacklist: Set<number>, symbolKindEncloseChild: Set<number>, symbol: vscode.DocumentSymbol, parentKind?: vscode.SymbolKind): Action {
    // Property Handling
    if (symbol.kind === vscode.SymbolKind.Property) {
      if (parentKind === vscode.SymbolKind.Class) {
        return Action.Copy
      }
      if (parentKind === vscode.SymbolKind.Interface) {
        return Action.Skip
      }
    }

    // TypeParameter Handling
    if (symbol.kind === vscode.SymbolKind.TypeParameter) {
      if (parentKind === vscode.SymbolKind.Class) {
        return Action.Copy
      } else {
        return Action.Copy
      }
    }

    // Interface Handling
    if (symbol.kind === vscode.SymbolKind.Interface) {
      if (parentKind === vscode.SymbolKind.Class) {
        return Action.Copy
      }
    }

    // Class Handling
    if (symbol.kind === vscode.SymbolKind.Class) {
      if (!parentKind) {
        return Action.CopyWithChildren
      }

      if (parentKind === vscode.SymbolKind.Function) {
        return Action.CopyWithChildren
      }

      if (![vscode.SymbolKind.Class, vscode.SymbolKind.Function].includes(parentKind)) {
        return Action.CopyWithChildren
      }
    }

    // Method Handling
    if (symbol.kind === vscode.SymbolKind.Method) {
      if (parentKind === vscode.SymbolKind.Class) {
        return Action.Copy
      } // CopyWithChildren
    }

    // Function Handling
    if (symbol.kind === vscode.SymbolKind.Function) {
      if (symbol.children.some(childSymbol => childSymbol.kind === vscode.SymbolKind.Class)) {
        return Action.CopyWithChildren
      } else {
        return Action.Copy
      }
    }

    // Function Handling
    if (symbol.kind === vscode.SymbolKind.Variable) {
      if (symbol.children.some(childSymbol => childSymbol.kind === vscode.SymbolKind.Class)) {
        return Action.CopyWithChildren
      } else {
        return Action.Copy
      }
    }

    // Default Handling
    if (symbolKindBlacklist.has(symbol.kind)) {
      return Action.Skip
    } else if (symbolKindEncloseChild.has(symbol.kind)) {
      return Action.CopyWithChildren
    } else {
      return Action.Copy
    }

  }

  static extendRangeToIncludeDecoratorsAndComments(
    document: vscode.TextDocument,
    range: vscode.Range,
    symbolKind: vscode.SymbolKind,
    config: IContentConfig
  ): vscode.Range {
    let startLine = range.start.line

    if (configStore.get<boolean>('includeDecoratorsInReferences')) {
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
    }

    if (!config.enableCommentRemoval) {
      while (startLine > 0) {
        const lineText = document.lineAt(startLine - 1).text.trim()
        if (lineText.startsWith('//') || lineText.startsWith('*') || lineText.startsWith('/*')) {
          startLine--
        } else {
          break
        }
      }
    }

    return new vscode.Range(new vscode.Position(startLine, 0), range.end)
  }


  static getClassSignature(document: vscode.TextDocument, classSymbol: vscode.DocumentSymbol): string {
    const startLine = classSymbol.range.start.line
    const startCharacter = classSymbol.range.start.character

    let endLine = classSymbol.range.end.line
    let endCharacter = classSymbol.range.end.character

    // If the class has children, use the start of the first child as the end of the signature
    if (classSymbol.children.length > 0) {
      endLine = classSymbol.children[0].range.start.line
      endCharacter = classSymbol.children[0].range.start.character
    }

    const signatureRange = new vscode.Range(
      new vscode.Position(startLine, startCharacter),
      new vscode.Position(endLine, endCharacter)
    )

    return document.getText(signatureRange).trim()
  }

  static createSymbolIdentifier(uri: vscode.Uri, symbol: vscode.DocumentSymbol): string {
    return `${uri.toString()}-${symbol.kind}-${symbol.name}-${symbol.range.start.line}:${symbol.range.start.character}-${symbol.range.end.line}:${symbol.range.end.character}`
  }
}

enum Action {
  Copy,
  Skip,
  CopyWithChildren,
  CopySignature
}

/**
1.  File - The 'File' symbol kind.
2.  Module - The 'Module' symbol kind.
3.  Namespace - The 'Namespace' symbol kind.
4.  Package - The 'Package' symbol kind.
5.  Class - The 'Class' symbol kind.
6.  Method - The 'Method' symbol kind.
7.  Property - The 'Property' symbol kind.
8.  Field - The 'Field' symbol kind.
9.  Constructor - The 'Constructor' symbol kind.
10. Enum - The 'Enum' symbol kind.
11. Interface - The 'Interface' symbol kind.
12. Function - The 'Function' symbol kind.
13. Variable - The 'Variable' symbol kind.
14. Constant - The 'Constant' symbol kind.
15. String - The 'String' symbol kind.
16. Number - The 'Number' symbol kind.
17. Boolean - The 'Boolean' symbol kind.
18. Array - The 'Array' symbol kind.
19. Object - The 'Object' symbol kind.
20. Key - The 'Key' symbol kind.
21. Null - The 'Null' symbol kind.
22. EnumMember - The 'EnumMember' symbol kind.
23. Struct - The 'Struct' symbol kind.
24. Event - The 'Event' symbol kind.
25. Operator - The 'Operator' symbol kind.
26. TypeParameter - The 'TypeParameter' symbol kind.
 */
