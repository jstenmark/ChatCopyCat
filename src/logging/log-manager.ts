import { OutputChannel } from 'vscode'
import { SingletonBase } from '../common/singleton'
import { LogLevelNumeric, LogLevel } from './log-mixin'

export interface ILogManager {
  setChannel(channel: OutputChannel): void
  getChannel(): OutputChannel | null
  log(message: string): void
  getLogLevel(): LogLevelNumeric
  setLogLevel(logLevel: LogLevel): void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class LogManager extends SingletonBase {
  private static _instance: LogManager | null = null
  private outputChannel: OutputChannel | null = null
  private LogLevel: LogLevel = LogLevel.DEBUG

  protected constructor() {
    super()
  }

  /**
   * Returns a singleton instance of the LogManager class.
   * @returns {LogManager} The singleton instance of the LogManager class.
   */
  public static get instance(): LogManager {
    if (!this._instance) {
      this._instance = new LogManager()
    }
    return this._instance
  }

  public static initialize(channel: OutputChannel, logLevel: LogLevel): LogManager {
    const instance = this.instance
    instance.setChannel(channel)
    instance.setLogLevel(logLevel)
    return instance
  }

  public setChannel(channel: OutputChannel): void {
    if (channel != null && channel !== undefined) {
      this.outputChannel = channel
      this.outputChannel.show()
    }
  }

  public getChannel(): OutputChannel | null {
    return this.outputChannel
  }

  public getLogLevel(): LogLevel {
    return this.LogLevel
  }

  public setLogLevel(logLevel: LogLevel): void {
    this.LogLevel = logLevel
  }

  public log(message: string): void {
    if (this.outputChannel) {
      this.outputChannel.appendLine(message)
    } else {
      console.error('OutputChannel not set in LogManager.')
    }
  }

  // public disposeChannel() {}
}
