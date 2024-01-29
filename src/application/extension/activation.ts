import {commands, Disposable, ExtensionContext, window} from 'vscode'

import {clipboardManager} from '@infra/clipboard'
import {statusBarManager} from '@infra/vscode/statusbar-manager'
import {LogManagerSingleton} from '@infra/logging/log-manager'
import {watchForExtensionChanges} from '@infra/dev/development'
import {Notify} from '@infra/vscode/notification'
import {closeDialog} from '@adapters/ui/dialog/dialog-utils'

import {copyCode} from '@application/commands/copy-command'
import {copyDefinitions} from '@application/commands//definitions-command'
import {copyDefinitionsFromFiles} from '@application/commands/definitionsfromfiles-command'
import {getFileTree} from '@application/commands/filetree-command'
import {openMenu} from '@application/commands/openmenu-command'
import {openSettings} from '@application/commands/settings-command'
import {getSymbolReferences} from '@application/commands/references-command'

import {ConfigAdapter} from '@adapters/vscode/config-adapter'
import {LanguageAdapter} from '@adapters/vscode/language-adapter'

import {SemaphoreAdapter} from '@infra/vscode/semaphore-adapter'
import {StateStoreSingleton} from '@infra/state/state-store'

import {LanguageServiceSingleton} from '@domain/services/language-service'
import {SemaphoreServiceSingleton} from '@domain/services/semaphore-service'
import {ConfigStoreSingleton} from '@infra/config/config-store'

export const devCommands: string[] = [] // ["chatcopycat.reloadWindow"]


export const initExtension = async (_context: ExtensionContext): Promise<Disposable[]> => {
  // Bootstrap infra
  LogManagerSingleton.instance // Init with fallback conf
  LogManagerSingleton.instance.setChannel(window.createOutputChannel('ChatCopyCat', 'log'))
  await ConfigStoreSingleton.instance.initialize()

  // Prepare adapters
  const semaphoreAdapter = new SemaphoreAdapter()
  const languageAdapter = new LanguageAdapter()
  const configAdapter = new ConfigAdapter() // WIP


  // Init Core
  await SemaphoreServiceSingleton.initialize(semaphoreAdapter)
  await LanguageServiceSingleton.initialize(languageAdapter, configAdapter)
  StateStoreSingleton.instance

  // Return and handle Disposables
  return [semaphoreAdapter]
}

// Read from pkgJson
export const commandHandlers: Record<string, () => Promise<void>> = {
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

export function registerDisposables(context: ExtensionContext, subscriptions: Disposable[]): void {
  context.subscriptions.push(
    ConfigStoreSingleton.instance,
    LogManagerSingleton.instance,
    StateStoreSingleton.instance,
    Notify,
    statusBarManager,
    ...subscriptions
  )
  if (ConfigStoreSingleton.instance.get<boolean>('catDevMode')) {
    context.subscriptions.push(watchForExtensionChanges())
  }
}
