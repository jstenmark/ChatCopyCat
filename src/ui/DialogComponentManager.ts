import * as vscode from 'vscode'
import { isQuickPick, isInputBox } from '../utils/dialogHelper'

export type DialogComponent = vscode.QuickPick<vscode.QuickPickItem> | vscode.InputBox

/**
 * Manages UI components
 */
export class DialogComponentManager {
  private _onDidClose = new vscode.EventEmitter<void>()
  public readonly onDidClose = this._onDidClose.event

  private component?: DialogComponent
  private disposable?: vscode.Disposable
  private queue: (() => Promise<void>)[] = []

  /**
   * Checks if a UI component is currently active.
   * @returns {boolean} True if a component is active, false otherwise.
   */
  public isActive(): boolean {
    return this.component !== undefined
  }

  /**
   * Shows a dialog UI component, created using the provided factory function.
   * @param {() => T} componentFactory A factory function to create the UI component.
   * @returns {Promise<string | undefined>} A promise that resolves to the user's input, or undefined if the input was cancelled.
   */
  public async show(componentFactory: () => DialogComponent): Promise<string | undefined> {
    if (this.isActive()) {
      return new Promise(resolve => {
        this.queue.push(() => this.show(componentFactory).then(resolve)) // handle concurrency
      })
    }

    const component = componentFactory()
    if (!component) {
      return undefined
    }

    this.component = component
    return this.handleComponentInteraction(component)
  }
  private handleComponentInteraction(component: DialogComponent): Promise<string | undefined> {
    return new Promise<string | undefined>(resolve => {
      const acceptCallback = () => {
        if (isQuickPick(component)) {
          const selectedItem = component.activeItems[0]
          if (selectedItem) {
            resolve(selectedItem.label)
          }
        } else if (isInputBox(component)) {
          resolve(component.value)
        }
        this.dispose()
      }

      const hideCallback = () => {
        resolve(undefined)
        this.dispose()
      }

      component.onDidAccept(acceptCallback)
      component.onDidHide(hideCallback)
      component.show()

      this.disposable = this._onDidClose.event(() => this.dispose())
    })
  }

  /**
   * Closes the currently active UI component.
   */
  public close(): void {
    this._onDidClose.fire()
  }

  /**
   * Disposes of the currently active UI component and associated resources.
   */
  public dispose(): void {
    if (this.component) {
      this.component.hide()
      this.component.dispose()
      this.component = undefined
    }

    this.disposable?.dispose()
    this.disposable = undefined

    this.queue.shift()?.()
  }

  /**
   * Resets the state of the manager, disposing of any active component and clearing the queue.
   */
  public reset(): void {
    this.dispose()
    this.queue = []
    this._onDidClose.fire()
  }
}
