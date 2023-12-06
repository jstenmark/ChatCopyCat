import {ILoggerMethods, LoggerMethod, LogHandler, ILoggerSettings, LogLevel, LogLevelNumeric} from './types'
import {configStore} from '../config'
import {log} from './log-base'
import {LogManager} from './log-manager'
import {truncateStr} from './log-utils'
import {defaultJsonTabSize} from '../../shared/constants/consts'

/**
 * Creates a loggable mixin class that extends a base class with logging methods (debug, info, warn, error).
 * @typeparam TBase - The base class type to extend.
 * @param Base - The base class to extend.
 * @returns A new class that extends the base class with logging functionality.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function LoggableMixin<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class Loggable extends Base implements ILoggerMethods {
    [method: string]: LoggerMethod | LogHandler

    private logMethod(level: LogLevel): LoggerMethod {
      return (message, data, logOpts) => this._log(level, message, data, logOpts)
    }

    public debug = this.logMethod(LogLevel.DEBUG)
    public info = this.logMethod(LogLevel.INFO)
    public warn = this.logMethod(LogLevel.WARN)
    public error = this.logMethod(LogLevel.ERROR)

    private _log: LogHandler = (
      level: LogLevel,
      message: string,
      data?: unknown,
      logOpts?: ILoggerSettings,
    ): void => {
      const truncateMsgLen = logOpts?.truncate ?? configStore.get<number>('catLogMsgTruncateLen')
      const truncateDataLen = logOpts?.truncate ?? configStore.get<number>('catLogDataTruncateLen')
      const configuredLogLevel = configStore.get<LogLevel>('catLogLevel') || LogLevel.DEBUG

      if (LogLevelToNumeric[configuredLogLevel] >= LogLevelToNumeric[level]) {
        const logMeta = `${now()} [${level}]${level.length === 4 ? ' ' : ''}`
        const logMessage = truncateStr(message, truncateMsgLen)
        const logData = getDataString(data, truncateDataLen)

        LogManager.instance.log(`${logMeta}\t${logMessage} ${logData}`,
        )
      }
    }
  }
}

export const LogLevelToNumeric: Record<LogLevel, LogLevelNumeric> = {
  [LogLevel.DEBUG]: LogLevelNumeric.DEBUG,
  [LogLevel.INFO]: LogLevelNumeric.INFO,
  [LogLevel.WARN]: LogLevelNumeric.WARN,
  [LogLevel.ERROR]: LogLevelNumeric.ERROR,
}

const getDataString = (data: unknown, maxLen: number) => data !== undefined ? truncateStr(data2String(data), maxLen) : ''

const data2String = (data: unknown): string => {
  if (data instanceof Error) {
    return data.stack ?? data.message
  }
  try {
    return typeof data === 'string' ? data : JSON.stringify(data, null, defaultJsonTabSize)
  } catch (error) {
    log.error(`Failed to stringify data: ${(error as Error).message}`)
    return `Failed to stringify data: ${(error as Error).message}`
  }
}
const now = ((n: Date = new Date()) =>
  `${n.getHours().toString().padStart(2, '0')}:` +
  `${n.getMinutes().toString().padStart(2, '0')}:` +
  `${n.getSeconds().toString().padStart(2, '0')}:` +
  `${n.getMilliseconds().toString().padStart(3, '0')}`
)
