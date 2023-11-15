import { SingletonBase } from '../common/singleton'
import * as vscode from 'vscode'

export class StateStore extends SingletonBase implements vscode.Disposable {
  private static _instance: StateStore | null = null
  private state = new Map<string, unknown>()

  protected constructor() {
    super()
  }
  public static get instance(): StateStore {
    if (!this._instance) {
      this._instance = new StateStore()
    }
    return this._instance
  }

  // Save a value in the state
  public setState<T>(key: string, value: T): void {
    this.state.set(key, value)
  }

  public getState<T>(key: string): T | undefined {
    return this.state.get(key) as T | undefined
  }

  public clearState(key: string): void {
    this.state.delete(key)
  }

  public clearAllStates(): void {
    this.state.clear()
  }

  public dispose() {
    this.state.clear()
  }
}
