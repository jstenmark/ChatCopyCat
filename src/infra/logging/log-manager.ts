import {OutputChannel, window, Disposable} from 'vscode'
import {LogLevel} from './types'
import {SingletonBase} from '../../shared/utils/singleton'
/**
 * LogManager handles the creation and management of log output channels. It provides methods to log messages
 * at different levels and manages the log output destination.
 */
export class LogManager extends SingletonBase implements Disposable {
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
      this._instance.setChannel(window.createOutputChannel('ChatCopyCat', 'log'))
      this._instance.setLogLevel(LogLevel.DEBUG)
    }
    return this._instance
  }

  public setChannel(channel: OutputChannel): void {
    if (channel != null && channel !== undefined) {
      this.outputChannel = channel
      this.outputChannel.show(true)
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

  public dispose() {
    if (this.outputChannel) {
      this.outputChannel.hide()
      this.outputChannel.dispose()
    }
  }
}
