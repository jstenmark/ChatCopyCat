import * as vscode from 'vscode'

export class StatusBarManager implements vscode.Disposable {
  private readonly statusBarItem: vscode.StatusBarItem
  private copyCount = 0
  private purpleColor = '#800080'
  private invertColor = '#7FFF7F'

  dispose() {
    this.statusBarItem.hide()
    this.statusBarItem.dispose()
  }

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(
      'primary',
      vscode.StatusBarAlignment.Left,
      100,
    )
    this.statusBarItem.command = 'chatcopycat.showClipboardMenu'
    this.statusBarItem.name = 'CopyCatCommandCenter'
    this.updateCopyCount(0)
  }

  public updateCopyCount(count?: number) {
    this.copyCount = count ?? this.copyCount + 1
    this.updateState()
  }

  private updateState() {
    this.statusBarItem.color = this.copyCount > 1 ? this.invertColor : this.purpleColor
    this.statusBarItem.tooltip = `CopyCats: ${this.copyCount} - Click to open menu`
    this.statusBarItem.text = `$(clippy${this.copyCount > 1 ? '-spin' : ''}) CopyCats: ${
      this.copyCount
    }`
    this.statusBarItem.show()
  }
}
