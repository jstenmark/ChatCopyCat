export abstract class SingletonBase {
  private static instances = new Map<new () => SingletonBase, SingletonBase>()

  protected constructor() {
    const ctor = this.constructor as new () => SingletonBase
    if (SingletonBase.instances.has(ctor)) {
      return SingletonBase.instances.get(ctor)! // Use non-null assertion
    }
    SingletonBase.instances.set(ctor, this)
  }

  // Generic method to enforce the correct instance type
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

export const Snigel = SingletonBase
