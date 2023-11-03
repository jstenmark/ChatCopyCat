import * as vscode from 'vscode'
import { getProjectsFileTree } from '../commands/project-files'
import { copyToClipboard, showNotification } from '../utils/vsc-utils'

export class ClipboardStatusBar {
  private statusBarItem: vscode.StatusBarItem
  private clipboardCount = 0
  private readonly command = 'ChatCopyCat.resetClipboard'

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
    if (count !== this.clipboardCount) {
      this.clipboardCount = count
      this.refresh()
    }
  }
  public resetCount() {
    if (this.clipboardCount !== 0) {
      this.clipboardCount = 0
      this.refresh()
    }
  }
  public incrementCount() {
    this.updateCount(this.clipboardCount + 1)
  }

  // @ clipboardStatusBar.command
  public async setClipboardEmpty() {
    await copyToClipboard('')
    await showNotification('warning', 'Clipboard has been reset')
    this.resetCount()
  }

  private refresh() {
    this.statusBarItem.text = `C:${this.clipboardCount}`
  }

  public async showClipboardMenu() {
    const picks = [
      { label: 'Reset Clipboard', action: this.setClipboardEmpty.bind(this) },
      { label: 'Get project Files', action: getProjectsFileTree },
      // Add more actions here as needed
    ]

    const pick = await vscode.window.showQuickPick(picks, { placeHolder: 'Clipboard Actions' })

    if (pick?.action) {
      await pick.action()
    }
  }
}

//     vscode.commands.executeCommand('ChatCopyCat.openClipboardMenu')
export const clipboardStatusBar = new ClipboardStatusBar()
