import type * as vscode from 'vscode'

import {SingletonBase} from '../../shared/utils/singleton'

/**
 * Manages a state store for the extension, allowing to save and retrieve stateful data.
 * This class follows the Singleton pattern to ensure a single instance manages the state.
 */
export class StateStore extends SingletonBase implements vscode.Disposable {
  private static state = new Map<string, unknown>()

  /**
   * Protected constructor to prevent direct instantiation and ensure singleton pattern.
   */
  protected constructor() {
    super()
  }

  /**
   * Gets the singleton instance of the StateStore.
   * Need to cast the return as a definite type to circumvent the Disposable implementation
   * @returns The singleton instance of StateStore.
   */
  static get instance(): StateStore {
    return super.getInstance<StateStore>(this) as StateStore
  }

  /**
   * Sets a state value with a specified key.
   * @param key - The key to associate the state value with.
   * @param value - The value to be stored.
   */
  // Save a value in the state
  public static setState<T>(key: string, value: T): void {
    this.state.set(key, value)
  }

  /**
   * Retrieves the state value associated with a specified key.
   * @param key - The key of the state to retrieve.
   * @returns The state value if found, or undefined if the key does not exist.
   */
  public static getState<T>(key: string): T | undefined {
    return this.state.get(key) as T | undefined
  }

  /**
   * Clears the state associated with a specified key.
   * @param key - The key of the state to clear.
   */
  public static clearState(key: string): void {
    this.state.delete(key)
  }

  /**
   * Clears all stored states in the StateStore.
   */
  public static clearAllStates(): void {
    this.state.clear()
  }

  /**
   * Disposes the StateStore by clearing all its stored states.
   */
  public dispose() {
    StateStore.clearAllStates()
  }
}
