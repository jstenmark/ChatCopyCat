import { clipboardManager } from './clipboard'
import { closeDialog } from './dialog'
import { commands, ExtensionContext, window } from 'vscode'
import { ConfigStore, SemaphoreStore, StateStore } from './config'
import {
  copyCode,
  copyDefinitions,
  copyDefinitionsFromFiles,
  getFileTree,
  openMenu,
  openSettings,
} from './commands'
import { errorMessage, watchForExtensionChanges } from './utils'
import { ICommand, IExtension } from './common'
import { log, LogManager } from './logging'
import { statusBarManager } from './statusbar'

export async function activate(context: ExtensionContext) {
  try {
    await ConfigStore.initialize()
    await SemaphoreStore.initialize()

    const handlers: Record<string, () => Promise<void>> = {
      copyCode,
      resetClipboard: clipboardManager.resetClipboard.bind(clipboardManager),
      closeDialog,
      getFileTree,
      copyDefinitions,
      copyDefinitionsFromFiles,
      openMenu,
      reloadWindow: async () => await commands.executeCommand('workbench.action.reloadWindow'),
      openSettings,
    }

    ;(context.extension as IExtension).packageJSON.contributes.commands?.forEach(
      (cmd: ICommand): void => {
        const [, action] = cmd.command.split('.')

        const handler = handlers[action]

        if (handler) {
          const command = commands.registerCommand(cmd.command, (): Promise<void> => exec(handler))
          context.subscriptions.push(command)
        } else {
          log.error(`No handler found for command ${cmd.command}`)
          Promise.resolve(
            window.showErrorMessage(`No handler found for command ${cmd.command}`),
          ).catch(e => console.error(e))
        }
      },
    )

    context.subscriptions.push(
      ConfigStore.instance,
      StateStore.instance,
      LogManager.instance,
      SemaphoreStore.instance,
      statusBarManager,
      watchForExtensionChanges(),
    )
  } catch (error) {
    log.error('Failed to activate extension:', error)
  }
}

export function deactivate() {
  // Empty
}
async function exec(handler: () => Promise<void>) {
  try {
    return await handler()
  } catch (error) {
    const message = errorMessage(error)
    log.error(`Error executing handler=${message}`, error, { truncate: 0 })
    await window.showErrorMessage(`Error executing command:${message}`)
  }
}
