import * as vscode from 'vscode'
import { SingletonBase } from '../common/singleton'

export class Semaphore extends SingletonBase {
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

  public static async initialize(): Promise<Semaphore> {
    const instance = this.instance
    await instance.setDialogState(false)
    return instance
  }

  public get isDialogOpen(): boolean {
    return this._isDialogOpen
  }

  public async setDialogState(open: boolean): Promise<boolean> {
    try {
      await vscode.commands.executeCommand('setContext', this.dialog_context_key, open)
      this._isDialogOpen = open
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error(`Error setting dialog state: ${errorMessage}`)
      throw error
    }
  }
}

export const semaphoreStore = Semaphore.instance
