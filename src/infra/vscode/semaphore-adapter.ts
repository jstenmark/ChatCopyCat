import * as vscode from 'vscode'
import {ISemaphorePort} from '../../domain/ports/semaphore-port'
import {log} from '../logging/log-base'
import {extId} from '../../shared/constants/consts'

export class SemaphoreAdapter implements ISemaphorePort, vscode.Disposable {
  private readonly dialog_context_key = `${extId}:semaphoreDialogOpen`

  public async setDialogState(open: boolean): Promise<boolean> {
    try {
      log.debug(`Setting dialog state. Key: ${this.dialog_context_key}, Open: ${open}`)
      await vscode.commands.executeCommand('setContext', this.dialog_context_key, open)
      return true
    } catch (error) {
      log.error('Error setting dialog state:', error)
      throw error
    }
  }

  /**
   * Disposes the resources used by the SemaphoreService and resets the dialog state.
   */
  public dispose(): void {
    Promise.resolve(this.setDialogState(false)).catch(error => {
      throw error
    })
  }
}