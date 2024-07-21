 
import {performance} from 'perf_hooks'
import {log} from './log-base'
import {ILoggerMethods, ILoggerSettings, LoggerMethod, LogLevel, LoggingDecoratorType} from './types'
import {getLogLevelTyped, getTargetName, getLoggerMethod, logResult} from './log-utils'

/**
 * Decorator for logging method calls at a specified log level with a given message.
 * @param level - The log level or a string representation of the log level.
 * @param message - The log message to be displayed.
 * @param logOpts - Optional logging options.
 * @returns A method decorator that logs the method call.
 */
export function LogDecorator(
  level: LogLevel | string,
  message: string,
  logOpts?: ILoggerSettings,
): MethodDecorator {
  return function <T>(
    _target: object,
    _propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ): TypedPropertyDescriptor<T> | void {
    if (typeof descriptor.value === 'function') {
      const originalMethod = descriptor.value as (...args: any[]) => any
      descriptor.value = function (this: typeof _target & ILoggerMethods, ...args: any[]): any {
        const typedLevel = getLogLevelTyped(level)
        if (typedLevel !== undefined) {
          const loggerMethod: LoggerMethod = getLoggerMethod(log, typedLevel)
          loggerMethod(message, args, logOpts)
        } else {
          console.warn(`Invalid log level: ${level}`)
        }
        return originalMethod.apply(this, args)
      } as unknown as T
      return descriptor
    }
  }
}

/**
 * Decorator for asynchronously logging method calls. It logs both the start and end of the async method, including any errors.
 * @param level - The log level or a string representation of the log level.
 * @param message - The log message to be displayed.
 * @param opts - Optional logging options.
 * @returns An async method decorator that logs the method call.
 */
export function AsyncLogDecorator(
  level: LogLevel | string,
  message: string,
  opts?: ILoggerSettings,
): LoggingDecoratorType {
  return function <T extends (...args: any[]) => Promise<any>>(
    _target: object, // any
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
          const result = (await originalMethod.apply(this, args)) as ReturnType<T>
          const end = performance.now()
          logResult(
            {message, level, opts},
            {elapsed: end - start, returnValue: result},
            {targetType: getTargetName(_target), name: String(_propertyKey), args: args},
          )
          return Promise.resolve(result)
        } catch (error) {
          const end = performance.now()
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
