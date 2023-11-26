import {commands, ExtensionContext} from 'vscode'
import {clipboardManager} from '../../infra/clipboard'
import {ConfigStore, SemaphoreStore, StateStore} from '../../infra/config'
import {watchForExtensionChanges} from '../../infra/dev/development'
import {LogManager} from '../../infra/logging/log-manager'
import {Notify} from '../../infra/vscode/notification'
import {statusBarManager} from '../../interfaces/statusbar'

import {copyCode} from '../commands/copy-command'
import {copyDefinitions} from '../commands//definitions-command'
import {copyDefinitionsFromFiles} from '../commands/definitionsfromfiles-command'
import {getFileTree} from '../commands/filetree-command'
import {openMenu} from '../commands/openmenu-command'
import {openSettings} from '../commands/settings-command'
import {closeDialog} from '../../adapters/ui/dialog/dialog-utils'
import {getSymbolReferences} from '../commands/references-command'



export const initExtension = async () => {
  await ConfigStore.initialize()
  await SemaphoreStore.initialize()
}

export const devCommands: string[] =  [] // ["chatcopycat.reloadWindow"]

export const handlers: Record<string, () => Promise<void>> = {
  copyCode,
  resetClipboard: clipboardManager.resetClipboard.bind(clipboardManager),
  closeDialog,
  getFileTree,
  copyDefinitions,
  copyDefinitionsFromFiles,
  getSymbolReferences,
  openMenu,
  reloadWindow: async () => await commands.executeCommand('workbench.action.reloadWindow'),
  openSettings,
}
export function registerSubscriptions(context: ExtensionContext): void {
  context.subscriptions.push(
    ConfigStore.instance,
    StateStore.instance,
    LogManager.instance,
    SemaphoreStore.instance,
    Notify,
    statusBarManager,
  )
  if(ConfigStore.instance.get<boolean>('enableDevelopmentMode')) {
    context.subscriptions.push(watchForExtensionChanges())
  }
}
