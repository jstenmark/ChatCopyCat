/* eslint-disable @typescript-eslint/no-explicit-any */
import { performance } from 'perf_hooks'
import { log } from './log-base'
import { ILogMethods, LogFunction, LogLevel } from './log-mixin'
import { getTargetName, logResult } from './log-utils'

export type LogDecoratorType = <T extends (...args: any[]) => Promise<any>>(
  _target: object, //any
  _propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>,
) => TypedPropertyDescriptor<T> | void

export function TypedLogDecorator(): LogDecoratorType {
  return function <T extends (...args: any[]) => Promise<any>>(
    _target: object, //any
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

export function LogDecorator(level: LogLevel, message: string): MethodDecorator {
  return function <T>(
    _target: object, //any
    _propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ): TypedPropertyDescriptor<T> | void {
    if (typeof descriptor.value === 'function') {
      const originalMethod = descriptor.value as (...args: any[]) => any
      descriptor.value = function (this: typeof _target & ILogMethods, ...args: any[]): any {
        const _logger = log[level.toLowerCase() as keyof typeof log] as LogFunction
        if (typeof _logger === 'function') {
          _logger(message, args)
        }
        return originalMethod.apply(this, args)
      } as unknown as T
      return descriptor
    }
  }
}

export function AsyncLogDecorator(
  level: LogLevel,
  message: string,
  opts?: Record<string, unknown>,
): LogDecoratorType {
  return function <T extends (...args: any[]) => Promise<any>>(
    _target: object, //any
    _propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ): TypedPropertyDescriptor<T> | void {
    const originalMethod = descriptor.value
    if (typeof originalMethod !== 'undefined') {
      descriptor.value = async function (
        this: typeof _target,
        ...args: Parameters<T>
      ): Promise<ReturnType<T>> {
        const start = performance.now()
        try {
          const result = originalMethod.apply(this, args) as ReturnType<T>
          const end = performance.now()
          logResult(
            { message, level, opts },
            { elapsed: end - start, returnValue: result },
            { targetType: getTargetName(_target), name: String(_propertyKey), args: args },
          )
          return Promise.resolve(result)
        } catch (error) {
          const end = performance.now() // End time if there was an error
          logResult(
            {
              message,
              level: LogLevel.ERROR,
              opts,
            },
            {
              elapsed: end - start,
              err: error as Error,
            },
            {
              targetType: getTargetName(_target),
              name: String(_propertyKey),
              args: args,
            },
          )
          throw error
        }
      } as T
      return descriptor
    }
  }
}
