/**
 * An abstract base class for implementing the Singleton pattern.
 * This class ensures that only one instance of a derived class is created and provides access to it.
 */
export abstract class SingletonBase {
  private static instances = new Map<new () => SingletonBase, SingletonBase>()

  /**
   * Protected constructor to prevent direct instantiation from outside of the class.
   * Checks if an instance of the derived class already exists and if not, adds it to the instances map.
   */
  protected constructor() {
    const ctor = this.constructor as new () => SingletonBase
    if (SingletonBase.instances.has(ctor)) {
      return SingletonBase.instances.get(ctor)! // Use non-null assertion
    }
    SingletonBase.instances.set(ctor, this)
  }

  /**
   * Gets an instance of the Singleton class. If the instance does not exist, it is created.
   * This method ensures that only one instance of the Singleton class is ever created.
   * @typeparam T - The type of the Singleton class.
   * @returns An instance of the Singleton class.
   * @throws {Error} If the instance creation fails.
   */
  protected static getInstance<T extends SingletonBase>(this: new () => T): T {
    if (!SingletonBase.instances.has(this)) {
      SingletonBase.instances.set(this, new this())
    }
    const instance = SingletonBase.instances.get(this)
    if (!instance) {
      throw new Error('SINGLETON Instance creation failed')
    }
    return instance as T
  }
}
