import * as vscode from 'vscode'
import { copyToClipboard, log } from '../utils/vsc-utils'

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
  public setClipboardEmpty() {
    copyToClipboard('')
    clipboardStatusBar.resetCount()
    log('Clipboard has been reset.')
    vscode.window.showInformationMessage('Clipboard has been reset.')
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
      vscode.commands.executeCommand('ChatCopyCat.resetClipboard')
    }
  }
}

//     vscode.commands.executeCommand('ChatCopyCat.openClipboardMenu')
export const clipboardStatusBar = new ClipboardStatusBar()
