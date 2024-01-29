/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

const instances = new Map<Function, any>()

export function SingletonMixin<TBase extends new (...args: any[]) => any>(Base: TBase) {
  return class Singleton extends Base {
    private static _allowInstantiation = true

    constructor(...args: any[]) {
      super(...args)
      if (!Singleton._allowInstantiation) {
        throw new Error(`Use singleton instance getter instead of 'new' ${Base.name}`)
      }
    }

    static get instance(): InstanceType<TBase> {
      const Class = this
      if (!instances.has(Class)) {
        Singleton._allowInstantiation = true
        instances.set(Class, new Class())
        Singleton._allowInstantiation = false
      }
      return instances.get(Class)
    }

    public dispose(): void { /**/}
  }
}
