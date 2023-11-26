import {LogMixinConstructor, ILogMethods, LogFunction, LogSink, ILogOpts, LogLevel} from './types'
import {configStore} from '../config'
import {log} from './log-base'
import {LogManager} from './log-manager'
import {truncate} from './log-utils'
import {LogLevelToNumeric} from './consts'

/**
 * Creates a loggable mixin class that extends a base class with logging methods (debug, info, warn, error).
 * @typeparam TBase - The base class type to extend.
 * @param Base - The base class to extend.
 * @returns A new class that extends the base class with logging functionality.
 */
export function LoggableMixin<TBase extends LogMixinConstructor>(Base: TBase) {
  return class Loggable extends Base implements ILogMethods {
    [method: string]: LogFunction | LogSink

    public debug: LogFunction = (message: string, data?: unknown, logOpts?: ILogOpts): void => {
      this._log(LogLevel.DEBUG, message, data, logOpts)
    }

    public info: LogFunction = (message: string, data?: unknown, logOpts?: ILogOpts): void => {
      this._log(LogLevel.INFO, message, data, logOpts)
    }

    public warn: LogFunction = (message: string, data?: unknown, logOpts?: ILogOpts): void => {
      this._log(LogLevel.WARN, message, data, logOpts)
    }

    public error: LogFunction = (message: string, data?: unknown, logOpts?: ILogOpts): void => {
      this._log(LogLevel.ERROR, message, data, logOpts)
    }

    private _log: LogSink = async (
      level: LogLevel,
      message: string,
      data?: unknown,
      logOpts?: ILogOpts,
      // eslint-disable-next-line @typescript-eslint/require-await
    ): Promise<void> => {
      const configuredLogLevel = configStore.get<string>('logLevelInChannel') || 'DEBUG'
      const messageLogLevel = LogLevelToNumeric[level]
      const isAllowedToLog =
        messageLogLevel >= LogLevelToNumeric[configuredLogLevel as LogLevel] ? true : false

      const dataString =
        data !== undefined
          ? truncate(
              this.data2String(data),
              logOpts?.truncate ?? configStore.get('defaultDataTruncate'),
            )
          : ''

      if (isAllowedToLog) {
        LogManager.instance.log(
          `${this._now()} [${level}]\t${truncate(
            message,
            logOpts?.truncate ?? configStore.get('defaultMessageTruncate'),
          )} ${dataString}`,
        )
      }
    }

    private data2String(data: unknown): string {
      if (data instanceof Error) {
        return data.stack ?? data.message
      }
      try {
        return typeof data === 'string' ? data : JSON.stringify(data, null, 2)
      } catch (error) {
        log.error(`Failed to stringify data: ${(error as Error).message}`)
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
