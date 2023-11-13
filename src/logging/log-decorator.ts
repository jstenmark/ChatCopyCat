/* eslint-disable @typescript-eslint/no-explicit-any */
import { performance } from 'perf_hooks'
import { log } from './log-base'
import { ILogMethods, ILogOpts, LogFunction } from './log-mixin'
import { getTargetName, logResult } from './log-utils'

enum localDecoratorLogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export type LogDecoratorType = <T extends (...args: any[]) => Promise<any>>(
  _target: object, //any
  _propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>,
) => TypedPropertyDescriptor<T> | void

export function LogDecorator(
  level: localDecoratorLogLevel | string,
  message: string,
  logOpts?: ILogOpts,
): MethodDecorator {
  return function <T>(
    _target: object,
    _propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ): TypedPropertyDescriptor<T> | void {
    if (typeof descriptor.value === 'function') {
      const originalMethod = descriptor.value as (...args: any[]) => any
      descriptor.value = function (this: typeof _target & ILogMethods, ...args: any[]): any {
        const typedLevel = getDecoratorLogLevel(level)
        if (typedLevel !== undefined) {
          const loggerMethod = getDecoratorLoggerMethod(log, typedLevel)
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

export function AsyncLogDecorator(
  level: localDecoratorLogLevel | string,
  message: string,
  opts?: ILogOpts,
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
          const result = (await originalMethod.apply(this, args)) as ReturnType<T>
          const end = performance.now()
          logResult(
            { message, level, opts },
            { elapsed: end - start, returnValue: result },
            { targetType: getTargetName(_target), name: String(_propertyKey), args: args },
          )
          return Promise.resolve(result)
        } catch (error) {
          const end = performance.now()
          logResult(
            {
              message,
              level: localDecoratorLogLevel.ERROR,
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

function getDecoratorLoggerMethod(
  _logger: ILogMethods,
  level: localDecoratorLogLevel,
): LogFunction {
  const fallBackLogger = typeof _logger === 'undefined' ? log : _logger
  switch (level) {
    case localDecoratorLogLevel.DEBUG:
      return fallBackLogger.debug
    case localDecoratorLogLevel.INFO:
      return fallBackLogger.info
    case localDecoratorLogLevel.WARN:
      return fallBackLogger.warn
    case localDecoratorLogLevel.ERROR:
      return fallBackLogger.error
    default:
      throw new Error('Invalid log level')
  }
}

function isKeyOfEnum(key: string, enumType: Record<string, string>): key is keyof typeof enumType {
  return Object.keys(enumType).includes(key)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isInEnum(value: any, enumType: any): boolean {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return Object.values(enumType).includes(value)
}

function getDecoratorLogLevel(
  level: string | localDecoratorLogLevel,
): localDecoratorLogLevel | undefined {
  if (typeof level === 'string') {
    const upperCaseLevel = level.toUpperCase()
    return isKeyOfEnum(upperCaseLevel, localDecoratorLogLevel)
      ? localDecoratorLogLevel[upperCaseLevel as keyof typeof localDecoratorLogLevel]
      : undefined
  } else {
    return isInEnum(level, localDecoratorLogLevel) ? level : undefined
  }
}
