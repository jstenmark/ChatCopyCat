
import {type Disposable, type ExtensionContext} from 'vscode'

import {ConfigAdapter} from '../../adapters/vscode/config-adapter'
import {LanguageAdapter} from '../../adapters/vscode/language-adapter'
import {LanguageService} from '../../domain/services/language-service'
import {SemaphoreService} from '../../domain/services/semaphore-service'
import {ConfigStore} from '../../infra/config/config-store'
import {watchForExtensionChanges} from '../../infra/dev/development'
import {LogManager} from '../../infra/logging/log-manager'
import {StateStore} from '../../infra/state/state-store'
import {Notify} from '../../infra/vscode/notification'
import {SemaphoreAdapter} from '../../infra/vscode/semaphore-adapter'
import {container} from '../../inversify/inversify.config'
import {GetSymbolReferencesCommand,GetSymbolReferencesCommand as TGetSymbolReferencesCommand} from '../commands/references-command'
import {registerCommands, registerCommandsOld} from './command-utils'

export const initExtension = async (context: ExtensionContext): Promise<Disposable[] | void> => {
  LogManager.instance
  await ConfigStore.initialize()


  // Init adapters
  const semaphoreAdapter = new SemaphoreAdapter()
  const languageAdapter = new LanguageAdapter()
  const configAdapter = new ConfigAdapter() // WIP

  container.get<GetSymbolReferencesCommand>(GetSymbolReferencesCommand)

  await SemaphoreService.initialize(semaphoreAdapter)
  await LanguageService.initialize(languageAdapter, configAdapter)
  StateStore.instance

  registerCommands(context) // Old command type registration
  registerCommandsOld(context) // DI type command registration

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

