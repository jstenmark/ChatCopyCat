import {commands, type Disposable, type ExtensionContext, window} from 'vscode'

import {log} from "../../infra/logging/log-base"

export interface ICommand {
  execute(...args: any[]): Promise<any>
  executeCommand?(...args: any[]): void
}

interface ICommandRegistryEntry {
  id: string
  instance: ICommand
}

const commandRegistry: ICommandRegistryEntry[] = []
export function registerCommands(context: ExtensionContext): void {
  log.info(`registerCommands[]: ${commandRegistry.join(', ')}`)
  for (const {id, instance} of commandRegistry) {
    const disposable = commands.registerCommand(id, (...args: any[]) => instance.execute(...args))
    context.subscriptions.push(disposable)
  }
}

export abstract class Command implements ICommand, Disposable {
  private readonly disposables: Disposable[] = []

  constructor(...commandIds: string[]) {
    commandIds.forEach((id) => {
      log.debug(`Registering decorator command ${id}`)
      const disposable = commands.registerCommand(id, this.execute.bind(this))
      this.disposables.push(disposable)
    })
  }

  abstract execute(...args: any[]): Promise<any>

  executeCommand(...args: any[]): void {
    this.execute(...args)
  }
  dispose(): void {
    this.disposables.forEach((disposable) => disposable.dispose())
  }
}
