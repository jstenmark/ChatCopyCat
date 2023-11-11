import * as vscode from 'vscode'
import { log } from './log-base'
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
  level: LogLevel // Defined loglevel
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

export function logResult(logInfo: ILogInfo, traced: ITraceInfo, call: ICallInfo) {
  const { message, level, opts } = logInfo
  const formatted = formatMessages(traced, call)
  const levelMethod: keyof typeof log = level.toLowerCase() as keyof typeof log

  if (typeof log[levelMethod] === 'function') {
    ;(log[levelMethod] as LogFunction)(
      message,
      traced.err === undefined ? formatted : { error: traced.err, ...formatted },
      opts,
    )
  } else {
    console.warn(`Log level method '${levelMethod}' is not a function.`)
  }
}

export function createChannel(name: string): vscode.OutputChannel {
  return vscode.window.createOutputChannel(name, 'log')
}
