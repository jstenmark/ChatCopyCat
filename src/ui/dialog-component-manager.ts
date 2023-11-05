import * as vscode from 'vscode'
import { log } from '../utils/vsc-utils'
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
      log('No component was created.')
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
          log('Quick pick accepted=' + selectedItem.label)
          resolve(selectedItem?.label)
        } else if (isInputBox(component)) {
          log('isInputBox accepted=' + component.value)
          resolve(component.value)
        } else {
          log('isNotValueSelectedInDialog')
          resolve(undefined)
        }
        disposeAllEventHandlers(disposables)
      }

      const hideCallback = () => {
        resolve(undefined)
        disposeAllEventHandlers(disposables)
      }

      disposables.push(component.onDidAccept(acceptCallback), component.onDidHide(hideCallback))

      component.show()

      this.disposable = vscode.Disposable.from(component, ...disposables)
    }).finally(() => this.cleanUp())
  }

  private cleanUp() {
    this.disposable?.dispose()
    this.component?.dispose()
    this.disposable = undefined
    this.component = undefined
    this.processQueue() // Assuming this method exists to handle queued tasks
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
