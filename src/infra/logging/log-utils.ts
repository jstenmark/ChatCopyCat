import {log} from './log-base'
import {type ICallMetadata, type ILogEntry, type ILoggerMethods, type ITraceResult, type LoggerMethod, LogLevel} from './types'

/**
 * Utility functions for logging, including methods to safely stringify of values, truncating strings, and
 * formatting log messages.
 */
export const getTargetName = (_target: object): string =>
  _target?.constructor ? _target.constructor.name : ''

export function safeStringify(value: unknown): string {
  switch (typeof value) {
    case 'string':
      return value
    case 'number':
    case 'bigint':
    case 'boolean':
      return value.toString()
    case 'symbol':
      return value.description ?? value.toString()
    case 'undefined':
      return 'undefined'
    case 'object':
      return value === null ? 'null' : `[object ${getTargetName(value)}]`
    case 'function':
      return `[function ${value.name}]`
    default:
      return '[unknown type safeStringify]'
  }
}

function normalizeCall(call: ICallMetadata): ICallMetadata {
  let {targetType, name, args} = call
  targetType = safeStringify(targetType)

  if (!name || name === '') {
    name = '<anon>'
  }
  if (!args) {
    args = []
  }
  return {targetType, name, args}
}


export function truncateStr(str: string, maxLength = 300): string {
  if (maxLength === 0) {
    return str
  }
  return str.length > maxLength ? str.substring(0, maxLength) + '...' : str
}

export function getLoggerMethod(logger: ILoggerMethods, level: LogLevel): LoggerMethod {
  switch (level) {
    case LogLevel.DEBUG:
      return logger.debug
    case LogLevel.INFO:
      return logger.info
    case LogLevel.WARN:
      return logger.warn
    case LogLevel.ERROR:
      return logger.error
    default:
      throw new Error('Invalid log level')
  }
}

function isKeyOfEnum(key: string, enumType: Record<string, string>): key is keyof typeof enumType {
  return Object.keys(enumType).includes(key)
}

function isInEnum(value: any, enumType: any): boolean {
  return Object.values(enumType).includes(value)
}


export function logResult({message, level, opts}: ILogEntry, traced: ITraceResult, call: ICallMetadata) {
  const formatted = formatMessages(traced, call)
  const typedLevel = getLogLevelTyped(level)

  if (typedLevel !== undefined) {
    const loggerMethod = getLoggerMethod(log, typedLevel)
    const logData = traced.err === undefined ? formatted : {error: traced.err, ...formatted}
    loggerMethod(message, logData, opts)
  } else {
    console.warn(`Invalid log level: ${level}`)
  }
}

const formatMessages = (traced: ITraceResult, call: ICallMetadata) => ({
  ms: traced.elapsed,
  hasReturnValue: traced.returnValue ? 'truthy' : 'falsy',
  ...normalizeCall(call)
})

export function getLogLevelTyped(level: string | LogLevel): LogLevel | undefined {
  if (typeof level === 'string') {
    const upperCaseLevel = level.toUpperCase()
    return isKeyOfEnum(upperCaseLevel, LogLevel)
      ? LogLevel[upperCaseLevel as keyof typeof LogLevel]
      : undefined
  } else {
    return isInEnum(level, LogLevel) ? level : undefined
  }
}
