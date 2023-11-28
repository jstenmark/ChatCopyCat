import * as vscode from 'vscode'

export interface ILogInfo {
  level: LogLevel | string
  message: string
  opts?: ILogOpts
}

export interface ILogManager {
  getChannel(): vscode.OutputChannel | null
  getLogLevel(): LogLevelNumeric
  log(message: string): void
  setChannel(channel: vscode.OutputChannel): void
  setLogLevel(logLevel: LogLevel): void
}
export type LogFunction = (msg: string, data?: unknown, logOpts?: ILogOpts) => void
export type LogSink = (level: LogLevel, message: string, data?: unknown, logOpts?: ILogOpts) => void
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export enum LogLevelNumeric {
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4
}
export interface ILogMethods {
  debug: LogFunction
  error: LogFunction
  info: LogFunction
  warn: LogFunction
  [method: string]: LogFunction | LogSink
}
export interface ILogOpts {
  truncate?: number
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LogMixinConstructor = new (...args: any[]) => object

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LogDecoratorType = <T extends (...args: any[]) => Promise<any>>(
  _target: object,
  _propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>,
) => TypedPropertyDescriptor<T> | void

export interface ICallInfo {
  args: unknown[]
  name: string
  targetType: string
}
export interface ITraceInfo {
  elapsed: number
  err?: Error
  returnValue?: unknown
}

