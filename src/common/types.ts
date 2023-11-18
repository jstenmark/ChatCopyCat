import * as vscode from 'vscode'
import { Diagnostic, OutputChannel } from 'vscode'

export interface IProjectFile {
  files: string[]
  rootPath: string
}
export interface ILangOpts {
  insertSpaces: boolean
  language: string
  tabSize: number
}
export interface IContentSection {
  selectionDiagnostics: Diagnostic[]
  selectionSection: string
}

// Config
export interface IPackageConfiguration {
  configuration: {
    properties: IConfigurationProperties
  }
}

export interface IExtension {
  packageJSON: {
    contributes: {
      configuration?: {
        properties: IConfigurationProperties
      }
      commands?: ICommand[]
    }
  }
}

export interface ICommand {
  command: string
  group: string
  title: string
}

export type IConfigurationProperties = Record<string, IProperty>

export interface IProperty {
  default?: unknown
  description?: string
  enum?: string[]
  items?: IItems
  label?: string
  settingDetails?: IProperty
  settingKey?: string
  type: PropertyType
}
export type PropertyType = 'boolean' | 'string' | 'enum' | 'array' | 'text'

export interface IItems {
  type: string
}

export interface IPackageJson {
  contributes: {
    configuration: {
      properties: IConfigurationProperties
    }
  }
}
export interface IHeadersPresent {
  clipboardContent: string
  fileTreeEndPresent: boolean
  fileTreeHeaderPresent: boolean
  selectionHeaderPresent: boolean
}
export interface IHeaderIndex {
  clipboardContent: string
  fileTreeEndIndex: number
  fileTreeHeaderIndex: number
  selectionHeaderEnd: number
  selectionHeaderIndex: number
}
export interface IQuickPickItem {
  detail?: string
  label: string
  settingDetails?: IProperty
  settingKey: string
}
export interface ISpecialQuickPickItem {
  label: string
  picked?: boolean
  special: boolean
}
export type Properties = Record<string, IProperty>
export interface ILogManager {
  getChannel(): OutputChannel | null
  getLogLevel(): LogLevelNumeric
  log(message: string): void
  setChannel(channel: OutputChannel): void
  setLogLevel(logLevel: LogLevel): void
}
export type LogFunction = (msg: string, data?: unknown, logOpts?: ILogOpts) => void
export type LogSink = (level: LogLevel, message: string, data?: unknown, logOpts?: ILogOpts) => void
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export enum LogLevelNumeric {
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
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

export interface ICallInfo {
  // Method
  args: unknown[]
  // Class name
  name: string
  targetType: string

  // Methods args
}
export interface ILogInfo {
  level: LogLevel | string
  // Defined loglevel
  message: string
  // Defined log message
  opts?: ILogOpts

  // Logger custom options
}

export interface ITraceInfo {
  elapsed: number
  // Call result, err undefined
  err?: Error
  // Call exectution time
  returnValue?: unknown

  // Call error, returnValue undefined
}
export enum localLogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}
export type DialogComponent = vscode.QuickPick<vscode.QuickPickItem> | vscode.InputBox
export enum localDecoratorLogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LogDecoratorType = <T extends (...args: any[]) => Promise<any>>(
  _target: object,
  _propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>,
) => TypedPropertyDescriptor<T> | void

export type Optional<T extends object, K extends keyof T = keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>
