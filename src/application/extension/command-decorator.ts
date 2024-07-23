import {commands, type Disposable, type ExtensionContext} from 'vscode'

import {closeDialog} from '../../adapters/ui/dialog/dialog-utils'
import {type ClipboardManager} from '../../infra/clipboard/clipboard-manager'
import {log} from '../../infra/logging/log-base'
import {Notify} from '../../infra/vscode/notification'
import {container} from '../../inversify/inversify.config'
import {TYPES} from '../../inversify/types'
import {copyCode} from '../commands/copy-command'
import {copyDefinitions} from '../commands/definitions-command'
import {copyDefinitionsFromFiles} from '../commands/definitionsfromfiles-command'
import {getFileTree} from '../commands/filetree-command'
import {openMenu} from '../commands/openmenu-command'
import {type GetSymbolReferencesCommand} from '../commands/references-command'
import {openSettings} from '../commands/settings-command'

export interface ICommand {
  execute(...args: any[]): Promise<any>
  executeCommand?(...args: any[]): void
}

export interface ICommandRegistryEntry {
  id: string
  instance: ICommand
}

const commandRegistry: ICommandRegistryEntry[] = []
// const devCommands: string[] = [] // ["chatcopycat.reloadWindow"]
export const commandHandlers: Record<string, () => Promise<void>> = {
  copyCode,
  resetClipboard: async () => await container.get<ClipboardManager>(TYPES.ClipboardManager).resetClipboard(),
  closeDialog,
  getFileTree,
  copyDefinitions,
  copyDefinitionsFromFiles,
  openMenu,
  reloadWindow: async () => await commands.executeCommand('workbench.action.reloadWindow'),
  openSettings,
  getSymbolReferences: async () => await container.get<GetSymbolReferencesCommand>(TYPES.GetSymbolReferencesCommand).execute(),
}

export function registerCommands(context: ExtensionContext): void {
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

// function registerCommand(context: ExtensionContext, cmd: ICommandDefinition): void {
//  const [, action] = cmd.command.split('.')
//  const handler = commandHandlers[action]
//  if (handler) {
//    const command = commands.registerCommand(cmd.command, () => exec(handler))
//    context.subscriptions.push(command)
//  } else {
//    Notify.error(`No handler found for command ${cmd.command}`, true, true)
//  }
// }

// export function registerCommands(context: ExtensionContext): void {
//  for (const {id, instance} of commandRegistry) {
//    log.info(`Registering command: id=${id} instance=${instance}`)
//    const disposable = commands.registerCommand(id, (...args: any[]) => instance.execute(...args))
//    context.subscriptions.push(disposable)
//  }
// }

// export function registerCommands(context: ExtensionContext): void {
// const commandsList = (context.extension as any).packageJSON
//   .contributes
//   .commands?.filter((command: ICommandDefinition) => {
// if (!ConfigStore.instance.get<boolean>('catDevMode')) {
//  if (devCommands.includes(command.command)) {
//    log.debug(`Ignoring ${command.command}`)
//    return false
//  }
// }
// return true
//   })
//
// // default registration
// for (const cmd of commandsList) {
//   log.info('default registerCommand', {command: cmd.command}, {truncate: 0})
//   registerCommand(context, cmd)
// }
//
//
// // for (const {id, instance} of commandRegistry) {
// //  log.info('Registering decorator command: id=' + id + ' instance=' + instance)
// //  const disposable = commands.registerCommand(id, (...args: any[]) => instance.executeCommand(...args))
// //  context.subscriptions.push(disposable)
// // }
//
//


async function exec(handler: () => Promise<void>): Promise<void> {
  try {
    return await handler()
  } catch (error) {
    Notify.error('Error executing handler')
    log.error('Error executing handler', error, {truncate: 0})
  }
}
