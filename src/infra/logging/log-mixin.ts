import {configStore} from '@infra/config'
import {LogManagerSingleton} from '@infra/logging/log-manager'
import {truncateStr, LoggerMethod, ILoggerSettings, LogLevel} from '@infra/logging/log-utils'
import {defaultJsonTabSize} from '@shared/constants/consts'

/**
 * Creates a loggable mixin class that extends a base class with logging methods (debug, info, warn, error).
 * @typeparam TBase - The base class type to extend.
 * @param Base - The base class to extend.
 * @returns A new class that extends the base class with logging functionality.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ChannelLoggerMixin<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class ChannelLogger extends Base {
    public debug: LoggerMethod = channelLoggerMethodFactory(LogLevel.DEBUG)
    public info: LoggerMethod = channelLoggerMethodFactory(LogLevel.INFO)
    public warn: LoggerMethod = channelLoggerMethodFactory(LogLevel.WARN)
    public error: LoggerMethod = channelLoggerMethodFactory(LogLevel.ERROR)
  }
}

function channelLoggerMethodFactory(level: LogLevel): LoggerMethod {
  return (message, data = {}, loggerOptions = {}) => {
    const {truncateOptions, logLevel} = getLogConfiguration()
    if (LogLevelNumeric[level] >= LogLevelNumeric[logLevel]) {
      const {logMeta, logMessage, logData} = buildLogEnvelope(message, data, level, loggerOptions, truncateOptions)
      LogManagerSingleton.instance.log(`${logMeta} ${logMessage} ${logData}`)
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

export enum LogLevelNumeric {
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4
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
