import {inject, injectable} from 'inversify'
import * as vscode from 'vscode'

import {log} from '../../infra/logging/log-base'
import {AsyncLogDecorator} from '../../infra/logging/log-decorator'
import {LogLevel} from '../../infra/logging/types'
import {TYPES} from '../../inversify/types'
import {StatusBarManager} from '../vscode/statusbar-manager'
/**
 * Manages clipboard operations for the ChatCopyCat extension, including copying, reading,
 * appending, and prepending text to the clipboard. It also interacts with the StatusBarManager
 * to update the copy count displayed in the status bar.
 */
@injectable()
export class ClipboardManager implements vscode.Disposable {
  private statusBarManager: StatusBarManager

  constructor(@inject(TYPES.StatusBarManager) statusBarManager: StatusBarManager) {
    this.statusBarManager = statusBarManager
  }

  dispose() {
    this.statusBarManager.dispose()
  }

  @AsyncLogDecorator(LogLevel.INFO, 'Clipboard reset')
  public async resetClipboard(): Promise<void> {
    await ClipboardManager.copyText('')
    this.statusBarManager.updateCopyCount(0)
  }

  @AsyncLogDecorator(LogLevel.INFO, 'Copied to clipboard', {truncate: 20})
  public async copyToClipboard(text: string, resetCount: number | undefined = undefined): Promise<void> {
    await ClipboardManager.copyText(text)
    if (resetCount) {
      this.statusBarManager.updateCopyCount(resetCount)
    }
  }

  @AsyncLogDecorator(LogLevel.DEBUG, 'Reading from clipboard', {truncate: 20})
  public async readFromClipboard(): Promise<string> {
    return await ClipboardManager.pasteText()
  }

  @AsyncLogDecorator(LogLevel.INFO, 'Prepending to clipboard', {truncate: 20})
  public async prependToClipboard(
    textToPrepend: string,
    clipboardContent?: string,
    increaseCount?: number,
  ): Promise<void> {
    if (clipboardContent?.length === 0) {
      clipboardContent = await ClipboardManager.pasteText()
    }
    await ClipboardManager.copyText(textToPrepend + (clipboardContent ?? ''))
    if (increaseCount) {
      this.statusBarManager.increaseCopyCount(increaseCount)
    }
  }

  @AsyncLogDecorator(LogLevel.INFO, 'Appending to clipboard', {truncate: 20})
  public async appendToClipboard(
    textToAppend: string,
    clipboardContent?: string,
    increaseCount?: number,
  ): Promise<void> {
    if (clipboardContent?.length === 0) {
      clipboardContent = await ClipboardManager.pasteText()
    }
    await ClipboardManager.copyText((clipboardContent ?? '') + textToAppend)
    if (increaseCount) {
      this.statusBarManager.increaseCopyCount(increaseCount)
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

// export const clipboardManager = new ClipboardManager(statusBarManager)

// https://github.com/microsoft/vscode/blob/main/src/vs/platform/clipboard/common/clipboardService.ts
