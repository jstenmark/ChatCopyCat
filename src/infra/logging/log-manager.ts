import {OutputChannel, window, Disposable} from 'vscode'
import {ILogManager} from './types'
import {SingletonBase} from '../../shared/utils/singleton'

/**
 * LogManager handles the creation and management of log output channels. It provides methods to log messages
 * at different levels and manages the log output destination.
 */
export class LogManager extends SingletonBase implements Disposable, ILogManager {
  private static _instance: LogManager | null = null
  private outputChannel: OutputChannel | null = null

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
    }
    return this._instance
  }

  private setChannel(channel: OutputChannel): void {
    if (channel != null && channel !== undefined) {
      this.outputChannel = channel
      this.outputChannel.show()
    }
  }

  public log(message: string): void {
    if (this.outputChannel) {
      this.outputChannel.appendLine(message)
    } else {
      void window.showErrorMessage('NO OUTPUT CHANNEL SET')
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
