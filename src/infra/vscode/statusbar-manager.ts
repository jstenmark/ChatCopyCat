
import {injectable} from 'inversify'
import * as vscode from 'vscode'

import {extId, extName} from '../../shared/constants/consts'
import {log} from '../logging/log-base'

/**
 * Manages the status bar item for the ChatCopyCat extension in Visual Studio Code.
 * This class handles the creation, updates, and disposal of the status bar item,
 * including displaying the count of copies made and updating the background color
 * based on the copy count.
 */
@injectable()
export class StatusBarManager implements vscode.Disposable {
  private statusBarItem: vscode.StatusBarItem
  private copyCount = 0

  /**
   * Disposes of the status bar iEtem, removing it from the VS Code status bar.
   */
  dispose() {
    this.statusBarItem.hide()
    this.statusBarItem.dispose()
  }

  /**
   * Initializes the status bar item with default settings and adds it to the VS Code status bar.
   */
  constructor() {
    log.debug('Initializing status bar manager')
    this.statusBarItem = vscode.window.createStatusBarItem(
      'primary',
      vscode.StatusBarAlignment.Right,
      100,
    )
    this.statusBarItem.command = `${extId}.openMenu`
    this.statusBarItem.name = extName
    this.statusBarItem.tooltip = new vscode.MarkdownString('\n$(settings) Click to open menu\n', true)
    this.statusBarItem.tooltip.isTrusted = true

    this.updateState()
  }

  /**
   * Increases the copy count by one and updates the status bar item state.
   */
  public increaseCopyCount(add?: number): void {
    this.copyCount += (add ?? 1)
    this.updateState()
  }

  /**
   * Updates the copy count to a specific value and refreshes the status bar item state.
   * @param count - The new copy count to set.
   */
  public updateCopyCount(count: number) {
    this.copyCount = count
    this.updateState()
  }

  /**
   * Updates the state of the status bar item based on the current copy count.
   * Changes the displayed text and background color.
   */
  private updateState() {
    this.statusBarItem.text = `$(comment-discussion) CopyCats: ${this.copyCount}`

    if (this.copyCount > 0) {
      this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground')
    } else {
      this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.defaultBackground')
    }

    this.statusBarItem.show()
  }
}

