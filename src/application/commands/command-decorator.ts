// src/application/commands/command-decorator.ts
import {commands, Disposable, ExtensionContext} from 'vscode'

export interface ICommand {
  execute(...args: any[]): Promise<any>
}

export interface ICommandRegistryEntry {
  id: string
  instance: ICommand
}

const commandRegistry: ICommandRegistryEntry[] = []

export interface ICommand {
  execute(...args: any[]): Promise<any>
  executeCommand(...args: any[]): void
}

export function command(id: string): MethodDecorator {
  return (_target: any, _propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    if (!(typeof descriptor.value === 'function')) {
      throw new Error('Command decorator can only be applied to methods.')
    }
    commandRegistry.push({id, instance: descriptor.value})
  }
}

export function registerCommands(context: ExtensionContext): void {
  for (const {id, instance} of commandRegistry) {
    const disposable = commands.registerCommand(id, (...args: any[]) => instance.executeCommand(...args))
    context.subscriptions.push(disposable)
  }
}

export abstract class Command implements ICommand, Disposable {
  private readonly disposables: Disposable[] = []

  constructor(...commandIds: string[]) {
    commandIds.forEach((id) => {
      const disposable = commands.registerCommand(id, this.execute.bind(this))
      this.disposables.push(disposable)
    })
  }

  abstract execute(...args: any[]): Promise<any>

  // Provide a default implementation for executeCommand
  executeCommand(...args: any[]): void {
    this.execute(...args)
  }

  dispose(): void {
    this.disposables.forEach((disposable) => disposable.dispose())
  }
}
