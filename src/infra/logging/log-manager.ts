import {OutputChannel, window, Disposable} from 'vscode'
import {ILogManager} from '@infra/logging/types'
import {SingletonMixin} from '@shared/utils/singleton'
/**
 * LogManager handles the creation and management of log output channels. It provides methods to log messages
 * at different levels and manages the log output destination.
 */
class LogManager implements Disposable, ILogManager {
  private outputChannel: OutputChannel | null = null

  public setChannel(channel: OutputChannel): void {
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

export const LogManagerSingleton = SingletonMixin(LogManager)
