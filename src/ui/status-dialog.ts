import * as vscode from 'vscode'
import { resetClipboard, showNotification } from '../utils/vsc-utils'

export class ClipboardStatusBar {
  private statusBarItem: vscode.StatusBarItem
  private clipboardCount = 0
  public command = 'ChatCopyCat.resetClipboard'

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100)
  }

  public show() {
    this.statusBarItem.show()
  }

  public hide() {
    this.statusBarItem.hide()
  }

  public updateCount(count: number) {
    this.clipboardCount = count
    this.refresh()
  }

  public resetCount() {
    this.clipboardCount = 0
    this.refresh()
  }

  public incrementCount() {
    this.clipboardCount += 1
    this.refresh()
  }

  // @ clipboardStatusBar.command
  public async setClipboardEmpty() {
    await resetClipboard()
    await showNotification('warning', 'Clipboard has been reset')
    clipboardStatusBar.resetCount()
    this.statusBarItem.text = `C:0`
  }

  public initClickEvent() {
    this.statusBarItem.command = 'ChatCopyCat.resetClipboard'
  }

  private refresh() {
    this.statusBarItem.text = `C:${this.clipboardCount}`
  }

  public async showClipBoardMenu() {
    const action = await vscode.window.showQuickPick(['Reset Clipboard'], { placeHolder: 'Select an action' })
    if (action === 'Reset Clipboard') {
      await vscode.commands.executeCommand('ChatCopyCat.resetClipboard')
    }
  }
}

//     vscode.commands.executeCommand('ChatCopyCat.openClipboardMenu')
export const clipboardStatusBar = new ClipboardStatusBar()
