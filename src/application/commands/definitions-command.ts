import * as vscode from 'vscode'

import {ClipboardManager,type ClipboardManager as TClipboardManager} from '../../infra/clipboard/clipboard-manager'
import {Notify} from '../../infra/vscode/notification'
import {StatusBarManager,type StatusBarManager as TStatusBarManager } from '../../infra/vscode/statusbar-manager'
import {container} from '../../inversify/inversify.config'
import {TYPES} from '../../inversify/types'


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

  const clipboardManager = container.get<TClipboardManager>(ClipboardManager)
  const statusBarManager = container.get<TStatusBarManager>(StatusBarManager)
  await clipboardManager.copyToClipboard(symbols.join('\n\n'))
  statusBarManager.updateCopyCount(symbols.length)
}
