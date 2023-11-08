import * as vscode from 'vscode'
import { log } from '../logging'
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
    return this.isActive()
      ? this.enqueueComponent(componentFactory)
      : this.showComponent(componentFactory)
  }

  /**
   * Enqueue a dialog component to be displayed when the active component closes.
   * @param componentFactory A function that creates a dialog component.
   * @returns A promise that resolves to the user's input or undefined.
   */
  private async enqueueComponent(
    componentFactory: () => DialogComponent,
  ): Promise<string | undefined> {
    if (this.isActive()) {
      return new Promise<string | undefined>(resolve => {
        this.queue.push(() =>
          this.createComponentAndHandleInteraction(componentFactory)
            .then(result => {
              log.debug('[DIALOGMANAGER] enqueueComponent interaction:', result)
              resolve(result)
              return result
            })
            .catch(e => {
              log.debug('Error during enqueueComponent:', e)
              resolve(undefined)
              return undefined as string | undefined
            }),
        )
      })
    } else {
      return this.showComponent(componentFactory)
    }
  }

  /**
   * Show a new dialog component immediately.
   * @param componentFactory A function that creates a dialog component.
   * @returns A promise that resolves to the user's input or undefined.
   */
  private async showComponent(
    componentFactory: () => DialogComponent,
  ): Promise<string | undefined> {
    const component = componentFactory()
    if (!component) {
      log.debug('No component was created.')
      return undefined
    }
    this.component = component
    // Make sure to return the result of handleComponentInteraction.
    return this.handleComponentInteraction(component)
  }

  /**
   * Create a new dialog component and handle the user's interactions with it.
   * @param componentFactory A function that creates a dialog component.
   * @returns A promise that resolves to the user's input or undefined.
   */
  private async createComponentAndHandleInteraction(
    componentFactory: () => DialogComponent,
  ): Promise<string | undefined> {
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
  private async handleComponentInteraction(
    component: DialogComponent,
  ): Promise<string | undefined> {
    return new Promise<string | undefined>(resolve => {
      const disposables: vscode.Disposable[] = []

      const acceptCallback = () => {
        if (isQuickPick(component)) {
          const selectedItem = component.activeItems[0]
          log.debug('Quick pick accepted=' + selectedItem.label)
          resolve(selectedItem?.label)
        } else if (isInputBox(component)) {
          log.debug('isInputBox accepted=' + component.value)
          resolve(component.value)
        } else {
          log.debug('isNotValueSelectedInDialog')
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
    }).finally(() => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.cleanUp()
    })
  }

  private async cleanUp() {
    this.disposable?.dispose()
    this.component?.dispose()
    this.disposable = undefined
    this.component = undefined
    await this.processQueue() // Assuming this method exists to handle queued tasks
  }

  /**
   * Process the queue of dialog components to be displayed.
   */
  private async processQueue(): Promise<void> {
    while (!this.isActive() && this.queue.length > 0) {
      const nextTask = this.queue.shift()
      if (nextTask) {
        try {
          await nextTask()
        } catch (err) {
          console.error('An error occurred while processing the queue:', err)
        }
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
  public async dispose(): Promise<void> {
    this.disposable?.dispose()
    this.component = undefined
    this.disposable = undefined
    await this.processQueue()
  }

  /**
   * Reset the state of the manager, disposing of any active components and clearing the queue.
   */
  public async reset(): Promise<void> {
    await this.dispose()
    this.queue = []
  }
}
