import * as vscode from 'vscode'

export class StatusBarManager implements vscode.Disposable {
  private statusBarItem: vscode.StatusBarItem
  private copyCount = 0

  private tooltip: vscode.MarkdownString = new vscode.MarkdownString(
    `$(settings) Click to open menu`,
    true,
  )

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
    this.statusBarItem.command = 'chatcopycat.openMenu'
    this.statusBarItem.name = '$(eye) CopyCatCommandCenter'
    this.statusBarItem.tooltip = this.tooltip
    this.statusBarItem.tooltip.isTrusted = true

    this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground')

    this.updateState()
  }

  public increaseCopyCount(): void {
    this.copyCount = this.copyCount + 1
    this.updateState()
  }

  public updateCopyCount(count: number) {
    this.copyCount = count
    this.updateState()
  }

  private updateState() {
    this.statusBarItem.text = `$(clippy) CopyCats: ${this.copyCount}`

    if (this.copyCount > 0) {
      this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground')
    } else {
      this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.defaultBackground')
    }

    this.statusBarItem.show()
  }
}
