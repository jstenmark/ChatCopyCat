import * as vscode from 'vscode'

/**
 * Manages the status bar item for the ChatCopyCat extension in Visual Studio Code.
 * This class handles the creation, updates, and disposal of the status bar item,
 * including displaying the count of copies made and updating the background color
 * based on the copy count.
 */
export class StatusBarManager implements vscode.Disposable {
  private statusBarItem: vscode.StatusBarItem
  private copyCount = 0

  /**
   * Disposes of the status bar item, removing it from the VS Code status bar.
   */
  dispose() {
    this.statusBarItem.hide()
    this.statusBarItem.dispose()
  }

  /**
   * Initializes the status bar item with default settings and adds it to the VS Code status bar.
   */
  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(
      'primary',
      vscode.StatusBarAlignment.Left,
      100,
    )
    this.statusBarItem.command = 'chatcopycat.openMenu'
    this.statusBarItem.name = 'ChatCopyCat status'
    this.statusBarItem.tooltip = new vscode.MarkdownString(
      `$(settings) $(comment-discussion) $(comment-draft) $(comment-unresolved) $(comment) Click to open menu`,
      true, // TODO: change depending on content
    )
    this.statusBarItem.tooltip.isTrusted = true

    this.updateState()
  }

  /**
   * Increases the copy count by one and updates the status bar item state.
   */
  public increaseCopyCount(): void {
    this.copyCount = this.copyCount + 1
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
    this.statusBarItem.text = `$(clippy) CopyCats: ${this.copyCount}`

    if (this.copyCount > 0) {
      this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground')
    } else {
      this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.defaultBackground')
    }

    this.statusBarItem.show()
  }
}

/**
 * Singleton instance of the StatusBarManager, ensuring only one status bar item is created.
 */
export const statusBarManager = new StatusBarManager()
