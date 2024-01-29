import {Disposable} from 'vscode'
import {SingletonMixin} from '@shared/utils/singleton'

/**
 * Manages a state store for the extension, allowing to save and retrieve stateful data.
 * This class follows the Singleton pattern to ensure a single instance manages the state.
 */
export class StateStore implements Disposable {
  private static state = new Map<string, unknown>()

  /**
   * Sets a state value with a specified key.
   * @param key - The key to associate the state value with.
   * @param value - The value to be stored.
   */
  // Save a value in the state
  public static setState<T>(key: string, value: T): void {
    StateStore.state.set(key, value)
  }

  /**
   * Retrieves the state value associated with a specified key.
   * @param key - The key of the state to retrieve.
   * @returns The state value if found, or undefined if the key does not exist.
   */
  public static getState<T>(key: string): T | undefined {
    return StateStore.state.get(key) as T | undefined
  }

  /**
   * Clears the state associated with a specified key.
   * @param key - The key of the state to clear.
   */
  public static clearState(key: string): void {
    StateStore.state.delete(key)
  }

  /**
   * Disposes the StateStore by clearing all its stored states.
   */
  public dispose(): void {
    StateStore.state.clear()
  }
}

export const StateStoreSingleton = SingletonMixin(StateStore)
