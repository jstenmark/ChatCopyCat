import * as vscode from 'vscode'
import { SingletonBase } from '../common/singleton'
import { log } from '../logging'

export class SemaphoreStore extends SingletonBase implements vscode.Disposable {
  private static _instance: SemaphoreStore | null = null
  private _isDialogOpen = false
  private readonly dialog_context_key = 'chatcopycat:semaphoreDialogOpen'

  protected constructor() {
    super()
  }
  public static get instance(): SemaphoreStore {
    if (!this._instance) {
      this._instance = new SemaphoreStore()
    }
    return this._instance
  }
  public get isDialogOpen(): boolean {
    return this._isDialogOpen
  }
  public static async initialize(): Promise<void> {
    await this.instance.setDialogState(false)
  }

  public dispose(): void {
    Promise.resolve(this.setDialogState(false)).catch(error => {
      log.error(`Error resetting dialog state on dispose`, error)
      throw error
    })
  }

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
