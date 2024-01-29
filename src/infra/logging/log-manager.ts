import {OutputChannel, window, Disposable} from 'vscode'
import {SingletonMixin} from '@shared/utils/singleton'

class LogManager implements Disposable {
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
