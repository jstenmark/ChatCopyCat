import * as vscode from 'vscode'

import {codeBlock} from '../../domain/models/inquiry-template'
import {ClipboardManager, type ClipboardManager as TClipboardManager} from '../../infra/clipboard/clipboard-manager'
import {configStore} from '../../infra/config/config-store'
import {getDocumentPath} from '../../infra/vscode/document'
import {Notify} from '../../infra/vscode/notification'
import {StatusBarManager, type StatusBarManager as TStatusBarManager} from '../../infra/vscode/statusbar-manager'
import {container} from '../../inversify/inversify.config'


export async function copyDefinitions(): Promise<void> {
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    Notify.info('No active editor', true, true)
    return
  }

  const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
    'vscode.executeDocumentSymbolProvider',
    editor.document.uri,
  )

  const filePath = configStore.get<boolean>('enablePath') ? getDocumentPath(editor) : undefined

  const formattedSymbols: string[] = symbols.map(symbol => {
    const definitionText = editor.document.getText(symbol.range)
    const lineNumStart = symbol.range.start.line + 1
    const lineNumEnd = symbol.range.end.line + 1

    return codeBlock(definitionText, filePath, editor.document.languageId, lineNumStart, lineNumEnd)
  })

  const clipboardManager = container.get<TClipboardManager>(ClipboardManager)
  const statusBarManager = container.get<TStatusBarManager>(StatusBarManager)
  await clipboardManager.copyToClipboard(formattedSymbols.join('\n'))
  statusBarManager.updateCopyCount(formattedSymbols.length)
}
