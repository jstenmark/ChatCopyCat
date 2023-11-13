import { log } from './log-base'
import { ILogMethods } from './log-mixin'
import { ILogOpts, LogFunction, LogLevel } from './log-mixin'

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

export interface ICallInfo {
  targetType: string // Class name
  name: string // Method
  args: unknown[] // Methods args
}
export interface ILogInfo {
  level: LogLevel | string // Defined loglevel
  message: string // Defined log message
  opts?: ILogOpts // Logger custom options
}

export interface ITraceInfo {
  elapsed: number // Call exectution time
  returnValue?: unknown // Call result, err undefined
  err?: Error // Call error, returnValue undefined
}

function normalizeCall(call: ICallInfo): ICallInfo {
  let { targetType, name, args } = call
  targetType = safeStringify(targetType)

  if (!name || name === '') {
    name = '<anon>'
  }
  if (!args) {
    args = []
  }
  return { targetType, name, args }
}
function formatMessages(traced: ITraceInfo, call: ICallInfo) {
  const normalziedCall = normalizeCall(call)

  const ms = traced.elapsed
  const hasReturnValue = traced.returnValue ? 'truthy' : 'falsy'

  return { ms, hasReturnValue, ...normalziedCall }
}

export function truncate(str: string, maxLength: number | undefined = 300): string {
  if (maxLength === 0) {
    return str
  }
  return str.length > maxLength ? str.substring(0, maxLength) + '...' : str
}

enum localLogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

function getLoggerMethod(logger: ILogMethods, level: localLogLevel): LogFunction {
  switch (level) {
    case localLogLevel.DEBUG:
      return logger.debug
    case localLogLevel.INFO:
      return logger.info
    case localLogLevel.WARN:
      return logger.warn
    case localLogLevel.ERROR:
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

function getLogLevel(level: string | localLogLevel): localLogLevel | undefined {
  if (typeof level === 'string') {
    const upperCaseLevel = level.toUpperCase()
    return isKeyOfEnum(upperCaseLevel, localLogLevel)
      ? localLogLevel[upperCaseLevel as keyof typeof localLogLevel]
      : undefined
  } else {
    return isInEnum(level, localLogLevel) ? level : undefined
  }
}

export function logResult(logInfo: ILogInfo, traced: ITraceInfo, call: ICallInfo) {
  const { message, level, opts } = logInfo
  const formatted = formatMessages(traced, call)

  const typedLevel = getLogLevel(level)

  if (typedLevel !== undefined) {
    const loggerMethod = getLoggerMethod(log, typedLevel)
    const logData = traced.err === undefined ? formatted : { error: traced.err, ...formatted }
    loggerMethod(message, logData, opts)
  } else {
    console.warn(`Invalid log level: ${level}`)
  }
}
