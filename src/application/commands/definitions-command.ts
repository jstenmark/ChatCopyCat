import * as vscode from 'vscode'
import {Notify} from '../../infra/vscode/notification'
import {statusBarManager} from '../../infra/vscode/statusbar-manager'
import {ClipboardManager} from '../../infra/clipboard/clipboard-manager'
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
  await clipboardManager.copyToClipboard(symbols.join('\n\n'))
  statusBarManager.updateCopyCount(symbols.length)
}
