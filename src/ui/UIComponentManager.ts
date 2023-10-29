import * as vscode from 'vscode'
import { QuickPick, QuickPickItem, InputBox } from 'vscode'

function isQuickPick(component: vscode.QuickPick<vscode.QuickPickItem> | vscode.InputBox): component is QuickPick<QuickPickItem> {
  return 'activeItems' in component
}

function isInputBox(component: vscode.QuickPick<vscode.QuickPickItem> | vscode.InputBox): component is InputBox {
  return 'value' in component
}

export class UIComponentManager<T extends vscode.QuickPick<vscode.QuickPickItem> | vscode.InputBox> {
  private readonly _onDidClose = new vscode.EventEmitter<void>()
  public readonly onDidClose = this._onDidClose.event
  private component?: T
  private disposable?: vscode.Disposable

  public show(componentFactory: () => T): Promise<string | undefined> {
    this.dispose()
    this.component = componentFactory()
    this.disposable = this._onDidClose.event(() => this.dispose())
    return new Promise<string | undefined>(resolve => {
      const callback = (value: string | undefined) => {
        resolve(value)
        this.dispose()
      }
      if (!this.component) {
        return resolve(undefined)
      }
      if (isQuickPick(this.component)) {
        const quickPick = this.component
        quickPick.onDidAccept(() => callback(quickPick.activeItems[0]?.label ?? undefined))
        quickPick.onDidHide(() => callback(undefined))
      } else if (isInputBox(this.component)) {
        const inputBox = this.component
        inputBox.onDidAccept(() => callback(inputBox.value))
        inputBox.onDidHide(() => callback(undefined))
      }
      this.component.show()
    })
  }

  public close(): void {
    this._onDidClose.fire()
  }

  public dispose(): void {
    if (this.component) {
      this.component.hide()
      this.component.dispose()
    }

    this.disposable?.dispose()
  }
}
