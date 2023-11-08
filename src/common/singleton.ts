export abstract class Singleton {
  private static instances = new Map<new () => Singleton, Singleton>()

  protected constructor() {
    const ctor = this.constructor as new () => Singleton
    if (Singleton.instances.has(ctor)) {
      return Singleton.instances.get(ctor)! // Use non-null assertion
    }
    Singleton.instances.set(ctor, this)
  }

  // Generic method to enforce the correct instance type
  protected static getInstance<T extends Singleton>(this: new () => T): T {
    if (!Singleton.instances.has(this)) {
      Singleton.instances.set(this, new this())
    }
    const instance = Singleton.instances.get(this)
    if (!instance) {
      throw new Error('Instance creation failed')
    }
    return instance as T
  }
}
