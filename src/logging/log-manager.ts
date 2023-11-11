import { OutputChannel } from 'vscode'
import { Singleton } from '../common'

export class LogManager extends Singleton {
  private static _instance: LogManager | null = null
  private outputChannel: OutputChannel | null = null

  protected constructor() {
    super()
  }
  public static get instance(): LogManager {
    if (!this._instance) {
      this._instance = new LogManager()
    }
    return this._instance
  }

  public setChannel(channel: OutputChannel): void {
    this.outputChannel = channel
  }

  public getChannel(): OutputChannel | null {
    return this.outputChannel
  }

  public log(message: string): void {
    if (this.outputChannel) {
      this.outputChannel.appendLine(message)
    } else {
      console.error('OutputChannel not set in LogManager.')
    }
  }
}
