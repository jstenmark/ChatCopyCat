import * as vscode from 'vscode'

export interface ILogEntry {
  level: LogLevel | string
  message: string
  opts?: ILoggerSettings
}

export interface ILogManager {
  getChannel(): vscode.OutputChannel | null
  setChannel(channel: vscode.OutputChannel): void
  log(message: string): void
}
export type LoggerMethod = (msg: string, data?: unknown, logOpts?: ILoggerSettings) => void
export type LogHandler = (level: LogLevel, message: string, data?: unknown, logOpts?: ILoggerSettings) => void
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
export interface ILoggerMethods {
  debug: LoggerMethod
  error: LoggerMethod
  info: LoggerMethod
  warn: LoggerMethod
  [method: string]: LoggerMethod | LogHandler
}

export interface ILoggerSettings {
  truncate?: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LoggerMixinConstructor = new (...args: any[]) => object

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LoggingDecoratorType = <T extends (...args: any[]) => Promise<any>>(
  _target: object,
  _propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>,
) => TypedPropertyDescriptor<T> | void

export interface ICallMetadata {
  args: unknown[]
  name: string
  targetType: string
}
export interface ITraceResult {
  elapsed: number
  err?: Error
  returnValue?: unknown
}
