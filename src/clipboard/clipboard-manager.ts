import * as vscode from 'vscode'
import { log } from '../logging/log-manager'
import { StatusBarManager } from '../statusbar/statusbar-manager'
import { copyDefinitions } from '../utils/lang-utils'

export class ClipboardManager implements vscode.Disposable {
  private statusBarManager: StatusBarManager

  constructor(StatusBarManager: StatusBarManager) {
    this.statusBarManager = StatusBarManager
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  dispose() {
    this.statusBarManager.dispose()
  }

  public async resetClipboard(): Promise<void> {
    await ClipboardManager.copyText('')
    log.debug('info', 'Clipboard has been reset')

    this.statusBarManager.updateCopyCount(0)
  }

  public async copyToClipboard(text: string): Promise<void> {
    await ClipboardManager.copyText(text)
    this.statusBarManager.updateCopyCount()
    log.info('Copied to clipboard')
  }

  public async readFromClipboard(): Promise<string> {
    const text = await ClipboardManager.pasteText()
    log.debug(`[CLIPBOARD_READ]=${text.slice(0, 15)}`)
    return text
  }

  public async showClipboardMenu(): Promise<void> {
    const picks = [
      { label: 'Reset Clipboard', action: this.resetClipboard.bind(this) },
      { label: 'Show definitions', action: copyDefinitions },
    ]

    const pick = await vscode.window.showQuickPick(picks, {
      placeHolder: 'ChatCopyCatCommandCenter ',
    })
    if (pick?.action) {
      await pick.action()
    }
  }

  public static async copyText(text: string): Promise<void> {
    try {
      await vscode.env.clipboard.writeText(text)
    } catch (e) {
      log.debug('Failed to copy to clipboard:' + (e as Error).message || 'UNKNOWN ERROR')
    }
  }

  public static async pasteText(): Promise<string> {
    try {
      return await vscode.env.clipboard.readText()
    } catch (e) {
      log.debug('Failed to copy to clipboard:' + (e as Error).message || 'UNKNOWN ERROR')
      return ''
    }
  }
}
