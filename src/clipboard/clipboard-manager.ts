import * as vscode from 'vscode'
import { AsyncLogDecorator, LogDecorator, log } from '../logging'
import { LogLevel } from '../logging/log-mixin'
import { StatusBarManager } from '../statusbar/statusbar-manager'
import { copyDefinitions } from '../utils/lang-utils'

export class ClipboardManager implements vscode.Disposable {
  private statusBarManager: StatusBarManager

  constructor(StatusBarManager: StatusBarManager) {
    this.statusBarManager = StatusBarManager
  }

  @LogDecorator(LogLevel.WARN, 'Disposing Clipboardmanager')
  dispose() {
    this.statusBarManager.dispose()
  }

  @LogDecorator(LogLevel.INFO, 'Clipboard reset')
  public async resetClipboard(): Promise<void> {
    await ClipboardManager.copyText('')
    this.statusBarManager.updateCopyCount(0)
  }

  @LogDecorator(LogLevel.INFO, 'Copied to clipboard')
  public async copyToClipboard(text: string): Promise<void> {
    await ClipboardManager.copyText(text)
    this.statusBarManager.updateCopyCount()
  }

  @LogDecorator(LogLevel.INFO, 'Reading from clipboard')
  public async readFromClipboard(): Promise<string> {
    return await ClipboardManager.pasteText()
  }

  @AsyncLogDecorator(LogLevel.INFO, 'Show clipboard menu')
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
      log.error('Failed to copy to clipboard', e as Error)
    }
  }

  public static async pasteText(): Promise<string> {
    try {
      return await vscode.env.clipboard.readText()
    } catch (e) {
      log.error('Failed to paste to clipboard', e as Error)
      return ''
    }
  }
}
