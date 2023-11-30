/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode'
import {Notify} from '../../infra/vscode/notification'
import {clipboardManager} from '../../infra/clipboard'
import {statusBarManager} from '../../infra/vscode/statusbar-manager'


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

  await clipboardManager.copyToClipboard(symbols.join('\n\n'))
  statusBarManager.updateCopyCount(symbols.length)
}
