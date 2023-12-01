import {log} from './log-base'
import {ILogMethods, LogFunction, ICallInfo, ITraceInfo, ILogInfo, LogLevel} from './types'

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
      return '[unknown type]'
  }
}

function normalizeCall(call: ICallInfo): ICallInfo {
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
function formatMessages(traced: ITraceInfo, call: ICallInfo) {
  const normalizedCall = normalizeCall(call)

  const ms = traced.elapsed
  const hasReturnValue = traced.returnValue ? 'truthy' : 'falsy'

  return {ms, hasReturnValue, ...normalizedCall}
}

export function truncate(str: string, maxLength: number | undefined = 300): string {
  if (maxLength === 0) {
    return str
  }
  return str.length > maxLength ? str.substring(0, maxLength) + '...' : str
}

export function getLoggerMethod(logger: ILogMethods, level: LogLevel): LogFunction {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isInEnum(value: any, enumType: any): boolean {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return Object.values(enumType).includes(value)
}

export function getLogLevel(level: string | LogLevel): LogLevel | undefined {
  if (typeof level === 'string') {
    const upperCaseLevel = level.toUpperCase()
    return isKeyOfEnum(upperCaseLevel, LogLevel)
      ? LogLevel[upperCaseLevel as keyof typeof LogLevel]
      : undefined
  } else {
    return isInEnum(level, LogLevel) ? level : undefined
  }
}

export function logResult(logInfo: ILogInfo, traced: ITraceInfo, call: ICallInfo) {
  const {message, level, opts} = logInfo
  const formatted = formatMessages(traced, call)

  const typedLevel = getLogLevel(level)

  if (typedLevel !== undefined) {
    const loggerMethod = getLoggerMethod(log, typedLevel)
    const logData = traced.err === undefined ? formatted : {error: traced.err, ...formatted}
    loggerMethod(message, logData, opts)
  } else {
    console.warn(`Invalid log level: ${level}`)
  }
}
