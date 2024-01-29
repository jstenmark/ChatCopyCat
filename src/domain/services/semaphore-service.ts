import {window} from 'vscode'
import {log} from '@infra/logging/log-base'
import {ISemaphorePort} from '@domain/ports/semaphore-port'
import {errorMessage} from '@shared/utils/validate'
import {SingletonMixin} from '@shared/utils/singleton'

/**
 * Manages a semaphore state to indicate if a dialog is currently open in the extension.
 * This helps in controlling the flow and preventing overlapping dialog interactions.
 */
// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class SemaphoreService {
  private static semaphorePort: ISemaphorePort | undefined = undefined

  // eslint-disable-next-line @typescript-eslint/require-await
  static async initialize(semaphorePort: ISemaphorePort): Promise<void> {
    if (!SemaphoreService.semaphorePort) {
      SemaphoreService.semaphorePort = semaphorePort
    } else {
      throw new Error('SemaphoreService has already been initialized')
    }
  }

  /**
   * Sets the state of the dialog semaphore.
   * @param open - Boolean indicating whether a dialog is open or not.
   * @returns A promise that resolves to true if the state was set successfully.
   * @throws An error if setting the state fails.
   */
  public static async setDialogState(open: boolean): Promise<boolean> {
    try {
      if (!SemaphoreService.semaphorePort) {
        throw new Error('SemaphoreService is not initialized')
      }
      await SemaphoreService.semaphorePort.setDialogState(open)
      return true
    } catch (error) {
      void window.showErrorMessage(`Error setting sempahore flag:${errorMessage(error)}`)
      log.error('Error setting dialog flag:', error)
      throw error
    }
  }
}

export const SemaphoreServiceSingleton = SingletonMixin(SemaphoreService)
