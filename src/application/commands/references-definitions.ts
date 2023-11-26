import * as vscode from 'vscode'
import {log} from '../../infra/logging/log-base'
import {Notify} from '../../infra/vscode/notification'
import {getLangOpts} from '../../domain/services/inquiry-utils'
import {getResourcePath} from '../../infra/vscode/document'
import {ISymbolReference} from '../../domain/models/definition-types'
import {clipboardManager} from '../../infra/clipboard/clipboard-manager'
import {generateReferenceSections} from '../../adapters/ui/editor-utils'
import {acitveEditorOrFocurLast} from '../../infra/vscode/editor'


export const getSymbolReferences = async (): Promise<void> => {
  const editor: vscode.TextEditor | undefined = await acitveEditorOrFocurLast()
  if(!editor) {
    return
  }

  const references = await processSymbolsWithComments(editor)
  if(references.length === 0) {
    return
  }

  const referenceSections = generateReferenceSections(references)
  await clipboardManager.copyToClipboard(referenceSections.join('\n').trim())
  Notify.info(`Copied ${referenceSections.length} references to clipboard`)
}

function createSymbolIdentifier(uri: vscode.Uri, symbol: vscode.DocumentSymbol): string {
  return `${uri.toString()}-${symbol.kind}-${symbol.name}-${symbol.range.start.line}:${symbol.range.start.character}-${symbol.range.end.line}:${symbol.range.end.character}`
}

const getSymbolsFromSelection = async (
  editor: vscode.TextEditor,
): Promise<vscode.Location[]> => {
  return (
    await vscode.commands.executeCommand<vscode.Location[]>(
      'vscode.executeReferenceProvider',
      editor.document.uri,
      editor.selection.active,
    )
  ) ?? []
}

export const processSymbolsWithComments = async (editor: vscode.TextEditor): Promise<ISymbolReference[]> => {
  const locations = await getSymbolsFromSelection(editor)
  if(locations.length === 0) {
    Notify.temporaryStatus('No references found')
    return []
  }

  const confirmProcessing = await Notify.confirm(`Gather references from selected symbol? total refs: ${locations.length}`,'Yes', 'Cancel')
  if(!confirmProcessing) {
    return []
  }

  const referenceSymbols: ISymbolReference[] = []
  const processedSymbols = new Set<string>()
  const langOpts = getLangOpts(editor)

  for (const location of locations) {
    const document = await vscode.workspace.openTextDocument(location.uri)
    const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
      'vscode.executeDocumentSymbolProvider',
      document.uri,
      )
    const path = getResourcePath(document.uri)
    if(!symbols) {
      continue
    }
    const symbol: ISymbolReference | undefined = findEnclosingSymbol(symbols, location.range.start)

    if (!symbol) {
      continue
    }

    symbol.id = createSymbolIdentifier(document.uri, symbol)
    if (!processedSymbols.has(symbol.id)) {
      symbol.rangeDecoratorsComments = extendRangeToIncludeDecoratorsAndComments(document, symbol.range, symbol.kind)
      symbol.text = document.getText(symbol.rangeDecoratorsComments)
      symbol.langOpts = langOpts
      symbol.path = path

      referenceSymbols.push(symbol)
      processedSymbols.add(symbol.id)
    }
  }

  return referenceSymbols
}


function extendRangeToIncludeDecoratorsAndComments(
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




function findEnclosingSymbol(
  symbols: vscode.DocumentSymbol[],
  position: vscode.Position,
): vscode.DocumentSymbol | undefined {
  for (const symbol of symbols) {
    if (symbol.range.contains(position)) {
      if (symbolKindBlacklist.has(symbol.kind)) {
        continue
      }

      const childSymbol = findEnclosingSymbol(symbol.children, position)
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

