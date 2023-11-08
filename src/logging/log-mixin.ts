import { LogManager } from './log-manager'
import { truncate } from './log-utils'

export type LogFunction = (msg: string, data?: unknown) => void
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}
export interface ILogMethods {
  [method: string]:
    | LogFunction
    | LogManager
    | ((level: LogLevel, message: string, data?: unknown) => void)
  debug: LogFunction
  info: LogFunction
  warn: LogFunction
  error: LogFunction
  __log: (level: LogLevel, message: string, data?: unknown) => void
  logManager: LogManager
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LogMixinConstructor = new (...args: any[]) => object

export function LoggableMixin<TBase extends LogMixinConstructor>(Base: TBase) {
  return class Loggable extends Base implements ILogMethods {
    [method: string]:
      | LogFunction
      | LogManager
      | ((level: LogLevel, message: string, data?: unknown) => void)
    logManager: LogManager = LogManager.instance

    public debug: LogFunction = (message: string, data?: unknown): void => {
      this.__log(LogLevel.DEBUG, message, data)
    }

    public info: LogFunction = (message: string, data?: unknown): void => {
      this.__log(LogLevel.INFO, message, data)
    }

    public warn: LogFunction = (message: string, data?: unknown): void => {
      this.__log(LogLevel.WARN, message, data)
    }

    public error: LogFunction = (message: string, data?: unknown): void => {
      this.__log(LogLevel.ERROR, message, data)
    }

    public __log(level: LogLevel, message: string, data?: unknown): void {
      const dataString = data !== undefined ? truncate(this.data2String(data)) : ''
      this.logManager.log(`${this._now()}\t[${level}] ${truncate(message)} ${dataString}`)
    }

    private data2String(data: unknown): string {
      if (data instanceof Error) {
        return data.stack ?? data.message
      }
      try {
        return typeof data === 'string' ? data : JSON.stringify(data, null, 2)
      } catch (error) {
        return `Failed to stringify data: ${(error as Error).message}`
      }
    }

    private _now(): string {
      const now = new Date()
      return `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now
        .getMilliseconds()
        .toString()
        .padStart(3, '0')}`
    }
  }
}
