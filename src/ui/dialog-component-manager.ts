import * as vscode from 'vscode'
import { DialogComponent, disposeAllEventHandlers, isInputBox, isQuickPick } from './dialog-utils'

/**
 * Manages UI dialog components for a Visual Studio Code extension.
 * Ensures that only one component is active at a given time and handles
 * the queue of components to be displayed.
 */
export class DialogComponentManager {
  private _onDidClose = new vscode.EventEmitter<void>()
  public readonly onDidClose = this._onDidClose.event

  private component?: DialogComponent
  private disposable?: vscode.Disposable
  private queue: (() => Promise<string | undefined>)[] = []

  /**
   * Display the dialog component created by the given factory function.
   * @param componentFactory A function that creates a dialog component.
   * @returns A promise that resolves to the user's input or undefined.
   */
  public async show(componentFactory: () => DialogComponent): Promise<string | undefined> {
    return this.isActive() ? this.enqueueComponent(componentFactory) : this.showComponent(componentFactory)
  }

  /**
   * Enqueue a dialog component to be displayed when the active component closes.
   * @param componentFactory A function that creates a dialog component.
   * @returns A promise that resolves to the user's input or undefined.
   */
  private async enqueueComponent(componentFactory: () => DialogComponent): Promise<string | undefined> {
    return new Promise(resolve => {
      this.queue.push(() =>
        this.createComponentAndHandleInteraction(componentFactory)
          .then(result => {
            resolve(result)
            return result
          })
          .catch(() => {
            resolve(undefined)
            return undefined
          }),
      )
      if (!this.isActive()) {
        this.processQueue()
      }
    })
  }

  /**
   * Show a new dialog component immediately.
   * @param componentFactory A function that creates a dialog component.
   * @returns A promise that resolves to the user's input or undefined.
   */
  private async showComponent(componentFactory: () => DialogComponent): Promise<string | undefined> {
    const component = componentFactory()
    if (!component) {
      return undefined
    }
    this.component = component
    return this.handleComponentInteraction(component)
  }

  /**
   * Create a new dialog component and handle the user's interactions with it.
   * @param componentFactory A function that creates a dialog component.
   * @returns A promise that resolves to the user's input or undefined.
   */
  private async createComponentAndHandleInteraction(componentFactory: () => DialogComponent): Promise<string | undefined> {
    try {
      const component = componentFactory()
      if (!component) {
        return undefined
      }
      return (await this.handleComponentInteraction(component)) ?? undefined
    } catch (err) {
      console.error('An error occurred while creating the component:', err)
      return undefined
    }
  }

  /**
   * Handle the user's interactions with a given dialog component.
   * @param component The dialog component.
   * @returns A promise that resolves to the user's input or undefined.
   */
  private handleComponentInteraction(component: DialogComponent): Promise<string | undefined> {
    return new Promise<string | undefined>(resolve => {
      const disposables: vscode.Disposable[] = []

      const acceptCallback = () => {
        if (isQuickPick(component)) {
          const selectedItem = component.activeItems[0]
          if (selectedItem) {
            resolve(selectedItem.label || undefined)
            return
          }
        } else if (isInputBox(component)) {
          resolve(component.value || undefined)
          return
        }
        resolve(undefined)
        disposeAllEventHandlers(disposables)
      }

      const hideCallback = () => {
        resolve(undefined)
        disposeAllEventHandlers(disposables)
      }

      const acceptDisposable = component.onDidAccept(acceptCallback)
      const hideDisposable = component.onDidHide(hideCallback)

      disposables.push(acceptDisposable, hideDisposable)

      component.show()

      this.disposable = vscode.Disposable.from(component, ...disposables)
    }).finally(() => {
      this.disposable?.dispose()
      this.disposable = undefined
      if (this.component) {
        this.component.dispose()
        this.component = undefined
      }
      this.processQueue()
    })
  }

  /**
   * Process the queue of dialog components to be displayed.
   */
  private processQueue(): void {
    if (!this.isActive() && this.queue.length > 0) {
      const nextTask = this.queue.shift()
      if (nextTask) {
        nextTask()
          .then(() => {
            this.processQueue()
          })
          .catch(err => {
            console.error('An error occurred while processing the queue:', err)
          })
      }
    }
  }

  /**
   * Check if a UI component is currently active.
   * @returns {boolean} True if a component is active, false otherwise.
   */
  public isActive(): boolean {
    return this.component !== undefined
  }

  /**
   * Close the currently active UI component.
   */
  public close(): void {
    if (this.component) {
      this.component.hide()
    }
  }

  /**
   * Dispose of the currently active UI component and associated resources.
   */
  public dispose(): void {
    this.disposable?.dispose()
    this.component = undefined
    this.disposable = undefined
    this.processQueue()
  }

  /**
   * Reset the state of the manager, disposing of any active components and clearing the queue.
   */
  public reset(): void {
    this.dispose()
    this.queue = []
  }
}
