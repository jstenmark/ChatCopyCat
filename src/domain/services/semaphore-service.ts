import {window} from 'vscode'
import {log} from '../../infra/logging/log-base'
import {SingletonBase} from '../../shared/utils/singleton'
import {ISemaphorePort} from '../ports/semaphore-port'
import {errorMessage} from '../../shared/utils/validate'

/**
 * Manages a semaphore state to indicate if a dialog is currently open in the extension.
 * This helps in controlling the flow and preventing overlapping dialog interactions.
 */
export class SemaphoreService extends SingletonBase {
  private static semaphorePort: ISemaphorePort | undefined = undefined

  private constructor() {
    super()
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  static async initialize(semaphorePort: ISemaphorePort): Promise<void> {
    if (!this.semaphorePort) {
      this.semaphorePort = semaphorePort
      this.instance
    } else {
      throw new Error('SemaphoreService has already been initialized')
    }
  }

  static get instance(): SemaphoreService {
    if (!this.semaphorePort) {
      throw new Error('SemaphoreService is not initialized')
    }
    return super.getInstance<SemaphoreService>(this)
  }

  /**
   * Sets the state of the dialog semaphore.
   * @param open - Boolean indicating whether a dialog is open or not.
   * @returns A promise that resolves to true if the state was set successfully.
   * @throws An error if setting the state fails.
   */
  public static async setDialogState(open: boolean): Promise<boolean> {
    try {
      if (!this.semaphorePort) {
        throw new Error('SemaphoreService is not initialized')
      }
      await this.semaphorePort.setDialogState(open)
      return true
    } catch (error) {
      void window.showErrorMessage('Error setting sempahore flag:' + errorMessage(error))
      log.error('Error setting dialog flag:', error)
      throw error
    }
  }
}
