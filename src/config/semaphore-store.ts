import * as vscode from 'vscode'
import { log } from '../logging'
import { Singleton } from '../common'

export class Semaphore extends Singleton {
  private static _instance: Semaphore | null = null
  private _isDialogOpen = false
  private dialog_context_key = 'chatcopycat:semaphoreDialogOpen'

  protected constructor() {
    super()
  }
  public static get instance(): Semaphore {
    if (!this._instance) {
      this._instance = new Semaphore()
    }
    return this._instance
  }

  public get isDialogOpen(): boolean {
    return this._isDialogOpen
  }

  public async setDialogState(open: boolean, source?: string): Promise<void> {
    log.info('Dialog state changed', { open, source })
    await vscode.commands.executeCommand('setContext', this.dialog_context_key, open)
    this._isDialogOpen = open
  }

  public async registerDialogContext(): Promise<void> {
    try {
      await vscode.commands.executeCommand('setContext', this.dialog_context_key, false)
    } catch (error) {
      log.error('Failed to set semaphore state', error)
    }
  }
}
