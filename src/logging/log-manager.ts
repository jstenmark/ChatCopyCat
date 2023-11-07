import { OutputChannel, window } from 'vscode'
import { getChannel } from '../config/output-channel'
import { LogLevel } from './log-utils'

class LogManager {
  private readonly outputChannel: OutputChannel

  public constructor() {
    this.outputChannel = window.createOutputChannel('ChatCopyCat')
  }

  public debug(message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, data)
  }

  public info(message: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, data)
  }

  public warn(message: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, data)
  }

  public error(message: string, data?: unknown): void {
    this.log(LogLevel.ERROR, message, data)
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    this.outputChannel.appendLine(`${this._now()}\t[${level}] ${message}`)
    if (data !== undefined) {
      this.outputChannel.appendLine(this.data2String(data))
    }
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

  public getChannel() {
    return getChannel()
  }
}

export const log = new LogManager()

//export const notify = (level: NotifyLevel, message: string): void => {
//  const action = {
//    error: window.showErrorMessage,
//    info: window.showInformationMessage,
//    warning: window.showWarningMessage,
//  }
//  await action[level: NotifyLevel](message: string)
//}
//
//const Logger = new Log()
//export default Logger
