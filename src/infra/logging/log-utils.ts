import {log} from '@infra/logging/log-base'

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

interface ILogEntry {
  level: LogLevel | string
  message: string
  opts?: ILoggerSettings
}

interface ICallMetadata {
  args: unknown[]
  name: string
  targetType: string
}

interface ITraceResult {
  elapsed: number
  err?: Error
  returnValue?: unknown
}


export type LoggerMethod = (msg: string, data?: unknown, logOpts?: ILoggerSettings) => void

export interface ILoggerSettings {
  truncate?: number,
  async?: boolean
}

const logLevelMethods = {
  [LogLevel.DEBUG]: log.debug,
  [LogLevel.INFO]: log.info,
  [LogLevel.WARN]: log.warn,
  [LogLevel.ERROR]: log.error,
}


export const getTargetName = (_target: object): string =>
  _target?.constructor ? _target.constructor.name : ''

export function safeStringify(value: unknown): string {
  switch (typeof value) {
    case 'string':
      return value
    case 'symbol':
      return value.description ?? value.toString()
    case 'undefined':
      return 'undefined'
    case 'object':
      return value === null ? 'null' : `[object ${getTargetName(value)}]`
    case 'function':
      return `[function ${value.name}]`
    case 'number':
    case 'bigint':
    case 'boolean':
      return value.toString()
    default:
      return '[unknown type safeStringify]'
  }
}

function normalizeCall({targetType, name = '<anon>', args = []}: ICallMetadata): ICallMetadata {
  return {targetType: safeStringify(targetType), name, args}
}

export function truncateStr(str: string, maxLength = 300): string {
  return str.length > maxLength ? `${str.substring(0, maxLength)}...` : str
}

export function getLoggerMethod(level: LogLevel): LoggerMethod {
  return logLevelMethods[level] || (() => {throw new Error('Invalid log level')})
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isInEnum(value: any, enumType: any): boolean {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return Object.values(enumType).includes(value)
}

export function logResult({message, level, opts}: ILogEntry, traced: ITraceResult, call: ICallMetadata): void {
  const loggerMethod = getLoggerMethod(getLogLevelTyped(level) ?? LogLevel.DEBUG)
  if (opts?.async) {
    setTimeout(() => {
      const formatted = formatMessages(traced, call)
      loggerMethod(message, traced.err ? {error: traced.err, ...formatted} : formatted, opts)
    }, 0)
  } else {
    const formatted = formatMessages(traced, call)
    loggerMethod(message, traced.err ? {error: traced.err, ...formatted} : formatted, opts)
  }

}

const formatMessages = (traced: ITraceResult, call: ICallMetadata) => ({
  ms: traced.elapsed,
  hasReturnValue: traced.returnValue ? 'truthy' : 'falsy',
  ...normalizeCall(call)
})

export function getLogLevelTyped(level: string | LogLevel): LogLevel | undefined {
  return typeof level === 'string'
    ? LogLevel[level.toUpperCase() as keyof typeof LogLevel]
    : isInEnum(level, LogLevel)
      ? level : undefined
}
