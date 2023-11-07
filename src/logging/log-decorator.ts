/* eslint-disable @typescript-eslint/no-explicit-any */

export type LogDecoratorType = <T extends (...args: any[]) => Promise<any>>(
  _target: any,
  _propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>,
) => TypedPropertyDescriptor<T> | void

export function TypedLogDecorator(): LogDecoratorType {
  return function <T extends (...args: any[]) => Promise<any>>(
    _target: any,
    _propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ): TypedPropertyDescriptor<T> | void {
    const originalMethod = descriptor.value
    if (typeof originalMethod !== 'undefined') {
      descriptor.value = async function (this: typeof _target, ...args: any[]): Promise<any> {
        return originalMethod.apply(this, args)
      } as T
      return descriptor
    }
  }
}

export function LogDecorator(): MethodDecorator {
  return function <T>(
    _target: any,
    _propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ): TypedPropertyDescriptor<T> | void {
    if (typeof descriptor.value === 'function') {
      const originalMethod = descriptor.value as (...args: any[]) => any
      descriptor.value = function (this: typeof _target, ...args: any[]): any {
        return originalMethod.apply(this, args)
      } as unknown as T
      return descriptor
    }
  }
}

export function AsyncLogDecorator(): LogDecoratorType {
  return function <T extends (...args: any[]) => Promise<any>>(
    _target: any,
    _propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ): TypedPropertyDescriptor<T> | void {
    const originalMethod = descriptor.value
    if (typeof originalMethod !== 'undefined') {
      descriptor.value = async function (
        this: typeof _target,
        ...args: Parameters<T>
      ): Promise<ReturnType<T>> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return originalMethod.apply(this, args) as ReturnType<T>
      } as T
      return descriptor
    }
  }
}
