import * as vscode from 'vscode'

import {type ClipboardManager} from '../../infra/clipboard/clipboard-manager'
import {Notify} from '../../infra/vscode/notification'
import {type StatusBarManager} from '../../infra/vscode/statusbar-manager'
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

  const clipboardManager = container.get<ClipboardManager>(TYPES.ClipboardManager)
  const statusBarManager = container.get<StatusBarManager>(TYPES.StatusBarManager)
  await clipboardManager.copyToClipboard(symbols.join('\n\n'))
  statusBarManager.updateCopyCount(symbols.length)
}
