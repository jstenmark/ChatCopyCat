import {ILoggerMethods, LoggerMethod, LogHandler, ILoggerSettings, LogLevel, LogLevelNumeric} from '@infra/logging/types'
import {configStore} from '@infra/config'
import {LogManagerSingleton} from '@infra/logging/log-manager'
import {truncateStr} from '@infra/logging/log-utils'
import {defaultJsonTabSize} from '@shared/constants/consts'

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

    private createLoggerMethod(level: LogLevel): LoggerMethod {
      return (message, data, loggerOptions) => void this.processLog(level, message, data, loggerOptions)
    }

    public debug = this.createLoggerMethod(LogLevel.DEBUG)
    public info = this.createLoggerMethod(LogLevel.INFO)
    public warn = this.createLoggerMethod(LogLevel.WARN)
    public error = this.createLoggerMethod(LogLevel.ERROR)

    private processLog(
      level: LogLevel,
      message: string,
      data?: unknown,
      loggerOptions?: ILoggerSettings,
    ): void {
      const {truncateOptions, logLevel} = getLogConfiguration()

      if (LogLevelToNumberMap[level] >= LogLevelToNumberMap[logLevel]) {
        const {logMeta, logMessage, logData} = buildLogEnvelope(message, data, level, loggerOptions!, truncateOptions)

        LogManagerSingleton.instance.log(`${logMeta} ${logMessage} ${logData}`,
        )
      }
    }
  }
}


const formatDataAsString = (data: unknown, maxLen: number) =>
  data !== undefined
    ? truncateStr(convertDataToString(data), maxLen)
    : ''

const convertDataToString = (data: unknown): string => {
  if (data instanceof Error) {
    return data.stack ?? data.message
  }
  try {
    return typeof data === 'string' ? data : JSON.stringify(data, null, defaultJsonTabSize)
  } catch (error) {
    return `Failed to stringify data: ${(error as Error).message}`
  }
}

const now = ((n: Date = new Date()) =>
  `${n.getHours().toString().padStart(2, '0')}:` +
  `${n.getMinutes().toString().padStart(2, '0')}:` +
  `${n.getSeconds().toString().padStart(2, '0')}:` +
  `${n.getMilliseconds().toString().padStart(3, '0')}`
)

export const LogLevelToNumberMap: Record<LogLevel, LogLevelNumeric> = {
  [LogLevel.DEBUG]: LogLevelNumeric.DEBUG,
  [LogLevel.INFO]: LogLevelNumeric.INFO,
  [LogLevel.WARN]: LogLevelNumeric.WARN,
  [LogLevel.ERROR]: LogLevelNumeric.ERROR,
}

interface ILoggerConfiguration {
  truncateOptions: {
    msgTruncate: number
    dataTruncate: number
  },
  logLevel: LogLevel
}
const getLogConfiguration = (): ILoggerConfiguration => ({
  truncateOptions: {
    msgTruncate: configStore.get<number>('catLogMsgTruncateLen') ?? 201,
    dataTruncate: configStore.get<number>('catLogDataTruncateLen') ?? 202,
  },
  logLevel: configStore.get<LogLevel>('catLogLevel') ?? LogLevel.DEBUG
})


interface ILogMessageStructure {
  logMeta: string,
  logMessage: string,
  logData: string
}
const buildLogEnvelope = (
  message: string,
  data: unknown,
  level: LogLevel,
  logOpts: ILoggerSettings,
  {msgTruncate, dataTruncate}: ILoggerConfiguration['truncateOptions']
): ILogMessageStructure => ({
  logMeta: `${now()} [${level}]${level.length === 4 ? ' ' : ''}`,
  logMessage: truncateStr(message, logOpts?.truncate ?? msgTruncate),
  logData: formatDataAsString(data, logOpts?.truncate ?? dataTruncate)
})