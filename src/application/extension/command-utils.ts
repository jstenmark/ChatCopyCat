

import {commands, type Disposable, type ExtensionContext, window} from 'vscode'

import {closeDialog} from '../../adapters/ui/dialog/dialog-utils'
import {type ClipboardManager as TClipboardManager} from '../../infra/clipboard/clipboard-manager'
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

export const commandHandlers: Record<string, () => Promise<void>> = {
  copyCode,
  resetClipboard: async () => await container.get<TClipboardManager>(TYPES.ClipboardManager).resetClipboard(),
  closeDialog,
  getFileTree,
  copyDefinitions,
  copyDefinitionsFromFiles,
  openMenu,
  reloadWindow: async () => await commands.executeCommand('workbench.action.reloadWindow'),
  openSettings,
  // getSymbolReferences: async () => await container.get<GetSymbolReferencesCommand>(TYPES.GetSymbolReferencesCommand).execute(),
}

function registerCommand(context: ExtensionContext, cmd: ICommandDefinition): void {
  const [, action] = cmd.command.split('.')
  const handler = commandHandlers[action]
  if (handler) {
    const command = commands.registerCommand(cmd.command, () => exec(handler))
    context.subscriptions.push(command)
  } else {
    Notify.error(`No handler found for command ${cmd.command}`, true, true)
  }
}

 async function exec(handler: () => Promise<void>): Promise<void> {
  try {
    return await handler()
  } catch (error) {
    Notify.error('Error executing handler')
    log.error('Error executing handler', error, {truncate: 0})
  }
}

export interface ICommandDefinition {
  command: string
  group: string
  title: string
}

const newCommands = [
  'chatcopycat.getSymbolReferences',
]
export function registerCommandsOld(context: ExtensionContext): void {
  const commandsList = (context.extension as any).packageJSON
    .contributes
    .commands?.filter((command: ICommandDefinition) => {
        if (newCommands.includes(command.command)) {
          log.debug(`Ignoring new command registering: ${command.command}`)
          return false
        }
        return true
    })

  // default registration
  for (const cmd of commandsList) {
    log.info('default registerCommand', {command: cmd.command}, {truncate: 0})
    registerCommand(context, cmd)
  }
}
