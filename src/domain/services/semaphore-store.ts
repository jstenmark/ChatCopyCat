import * as vscode from 'vscode'
import {log} from '../../infra/logging/log-base'
import {SingletonBase} from '../../shared/utils/singleton'

/**
 * Manages a semaphore state to indicate if a dialog is currently open in the extension.
 * This helps in controlling the flow and preventing overlapping dialog interactions.
 */
export class SemaphoreStore extends SingletonBase implements vscode.Disposable {
  private static _instance: SemaphoreStore | null = null
  private _isDialogOpen = false
  private readonly dialog_context_key = 'chatcopycat:semaphoreDialogOpen'

  /**
   * Protected constructor to prevent direct instantiation and ensure singleton pattern.
   */
  protected constructor() {
    super()
  }

  /**
   * Gets the singleton instance of the SemaphoreStore.
   * @returns The singleton instance of SemaphoreStore.
   */
  public static get instance(): SemaphoreStore {
    if (!this._instance) {
      this._instance = new SemaphoreStore()
    }
    return this._instance
  }

  /**
   * Gets the current dialog open state.
   * @returns True if a dialog is currently open, otherwise false.
   */
  public get isDialogOpen(): boolean {
    return this._isDialogOpen
  }

  /**
   * Initializes the semaphore store by setting the initial dialog state to false.
   */
  public static async initialize(): Promise<void> {
    await this.instance.setDialogState(false)
  }

  /**
   * Disposes the resources used by the SemaphoreStore and resets the dialog state.
   */
  public dispose(): void {
    Promise.resolve(this.setDialogState(false)).catch(error => {
      log.error(`Error resetting dialog state on dispose`, error)
      throw error
    })
  }

  /**
   * Sets the state of the dialog semaphore.
   * @param open - Boolean indicating whether a dialog is open or not.
   * @returns A promise that resolves to true if the state was set successfully.
   * @throws An error if setting the state fails.
   */
  public async setDialogState(open: boolean): Promise<boolean> {
    try {
      await vscode.commands.executeCommand('setContext', this.dialog_context_key, open)
      this._isDialogOpen = open
      return true
    } catch (error) {
      log.error(`Error setting dialog state:`, error)
      throw error
    }
  }
}
