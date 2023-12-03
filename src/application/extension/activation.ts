import {commands, Disposable, ExtensionContext} from 'vscode'
import {clipboardManager} from '../../infra/clipboard'
import {ConfigStore, SemaphoreService, StateStore} from '../../infra/config'
import {watchForExtensionChanges} from '../../infra/dev/development'
import {LogManager} from '../../infra/logging/log-manager'
import {Notify} from '../../infra/vscode/notification'

import {copyCode} from '../commands/copy-command'
import {copyDefinitions} from '../commands//definitions-command'
import {copyDefinitionsFromFiles} from '../commands/definitionsfromfiles-command'
import {getFileTree} from '../commands/filetree-command'
import {openMenu} from '../commands/openmenu-command'
import {openSettings} from '../commands/settings-command'
import {getSymbolReferences} from '../commands/references-command'
import {SemaphoreAdapter} from '../../infra/vscode/semaphore-adapter'
import {statusBarManager} from '../../infra/vscode/statusbar-manager'
import {closeDialog} from '../../adapters/ui/dialog/dialog-utils'

import {ConfigAdapter} from '../../adapters/vscode/config-adapter'
import {LanguageAdapter} from '../../adapters/vscode/language-adapter'
import {LanguageService} from '../../domain/services/language-service'



export const initExtension = async (_context: ExtensionContext): Promise<Disposable[]> => {
  const semaphoreAdapter = new SemaphoreAdapter()
  const languageAdapter = new LanguageAdapter()
  const configAdapter = new ConfigAdapter()

  await ConfigStore.initialize()
  await SemaphoreService.initialize(semaphoreAdapter)
  await LanguageService.initialize(languageAdapter,configAdapter)
  StateStore.instance

  return [semaphoreAdapter]
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
export function registerSubscriptions(context: ExtensionContext, subscriptions: Disposable[]): void {
  context.subscriptions.push(
    ConfigStore.instance,
    StateStore.instance,
    LogManager.instance,
    Notify,
    statusBarManager,
    ...subscriptions
  )
  if(ConfigStore.instance.get<boolean>('catDevMode')) {
    context.subscriptions.push(watchForExtensionChanges())
  }
}
