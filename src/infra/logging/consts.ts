import {LogLevel, LogLevelNumeric} from './types'

export const LogLevelToNumeric: Record<LogLevel, LogLevelNumeric> = {
  [LogLevel.DEBUG]: LogLevelNumeric.DEBUG,
  [LogLevel.INFO]: LogLevelNumeric.INFO,
  [LogLevel.WARN]: LogLevelNumeric.WARN,
  [LogLevel.ERROR]: LogLevelNumeric.ERROR,
}
