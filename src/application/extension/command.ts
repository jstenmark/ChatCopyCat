import {commands, type Disposable} from 'vscode'

import {log} from "../../infra/logging/log-base"
import {type ICommand} from './command-utils'


export abstract class Command implements ICommand, Disposable {
  private readonly disposables: Disposable[] = []
  private static registeredCommands: Set<string> = new Set()

  constructor(...commandIds: string[]) {
    commandIds.forEach((id) => {
      // Check if the command is already registered
      log.debug(`registerCommand: ${id}`)
      if (!Command.registeredCommands.has(id)) {
        const disposable = commands.registerCommand(id, this.execute.bind(this))
        this.disposables.push(disposable)
        Command.registeredCommands.add(id)
      } else {
        log.debug(`Command ${id} already registered, skipping registration.`)
      }
    })
  }

  abstract execute(...args: any[]): Promise<any>

  dispose(): void {
    this.disposables.forEach((disposable) => disposable.dispose())
  }
}
