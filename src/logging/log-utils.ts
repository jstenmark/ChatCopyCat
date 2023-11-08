import { log } from './log-base'
import { LogFunction, LogLevel } from './log-mixin'
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
      return value === null ? 'null' : `[object ${value.constructor.name}]`
    case 'function':
      return `[function ${value.name}]`
    default:
      return '[unknown type]'
  }
}

export interface ICallInfo {
  targetType: string
  name: string
  args: unknown[]
}
export interface ILogInfo {
  opts: unknown
  message: string
  level: LogLevel
}

export interface ITraceInfo {
  elapsed: number
  returnValue?: unknown
  err?: Error
}

function normalizeCall(call: ICallInfo): ICallInfo {
  let { targetType, name, args } = call
  if (!targetType || targetType === '') {
    targetType = 'Function'
  }
  if (!name || name === '') {
    name = '<anon>'
  }
  if (!args) {
    args = []
  }
  return { targetType, name, args }
}
function formatMessages(traced: ITraceInfo, call: ICallInfo) {
  const data = normalizeCall(call)

  const name = data.name.trim()
  const ms = traced.elapsed
  const hasReturnValue = traced.returnValue ? 'truthy' : 'falsy'

  return { ms, hasReturnValue, ...data, name }
}

export function truncate(str: string, maxLength = 200): string {
  return str.length > maxLength ? str.substring(0, maxLength) + '...' : str
}

export function logResult(logInfo: ILogInfo, traced: ITraceInfo, call: ICallInfo) {
  const formatted = formatMessages(traced, call)
  const levelMethod: keyof typeof log = logInfo.level.toLowerCase() as keyof typeof log

  if (typeof log[levelMethod] === 'function') {
    ;(log[levelMethod] as LogFunction)(
      logInfo.message,
      traced.err === undefined ? formatted : { error: traced.err, ...formatted },
    )
  } else {
    console.warn(`Log level method '${levelMethod}' is not a function.`)
  }
}
