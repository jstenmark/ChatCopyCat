
import {type Disposable, type ExtensionContext} from 'vscode'

import {ConfigAdapter} from '../../adapters/vscode/config-adapter'
import {LanguageAdapter} from '../../adapters/vscode/language-adapter'
import {LanguageService} from '../../domain/services/language-service'
import {ConfigStore, SemaphoreService, StateStore} from '../../infra/config'
import {watchForExtensionChanges} from '../../infra/dev/development'
import {LogManager} from '../../infra/logging/log-manager'
import {Notify} from '../../infra/vscode/notification'
import {SemaphoreAdapter} from '../../infra/vscode/semaphore-adapter'
import {Command, registerCommands} from './command-decorator'

export const initExtension = async (context: ExtensionContext): Promise<Disposable[] | void> => {
  LogManager.instance
  await ConfigStore.initialize()

  // Init adapters
  const semaphoreAdapter = new SemaphoreAdapter()
  const languageAdapter = new LanguageAdapter()
  const configAdapter = new ConfigAdapter() // WIP

  await SemaphoreService.initialize(semaphoreAdapter)
  await LanguageService.initialize(languageAdapter, configAdapter)
  StateStore.instance

  registerCommands(context) // Register traditional command handlers


  // Command.registerAllCommands(context) // Ensure all decorator-based commands are registered
  // Disposeables
  context.subscriptions.push(
    ConfigStore.instance,
    StateStore.instance,
    LogManager.instance,
    Notify,
    // statusBarManager,
    semaphoreAdapter
  )

  if (ConfigStore.instance.get<boolean>('catDevMode')) {
    context.subscriptions.push(watchForExtensionChanges())
  }
}

