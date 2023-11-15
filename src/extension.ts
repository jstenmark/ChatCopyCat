import * as vscode from 'vscode'
import { ClipboardManager } from './clipboard'
import { copyCode, copyDefinitions, getFileTree, openMenu, openSettings } from './commands'
import { closeDialog } from './dialog'
import { StatusBarManager } from './statusbar'
import { watchForExtensionChanges, errorMessage } from './utils'
import { ConfigStore, StateStore, SemaphoreStore } from './config'
import { log } from './logging'
import { LogManager } from './logging/log-manager'

export let statusBarManager: StatusBarManager
export let clipboardManager: ClipboardManager

/**
 * This function is called when the extension is activated.
 * It is used to setup the extension, register commands, and allocate resources.
 * @param {vscode.ExtensionContext} context - The extension context.
 */
export async function activate(context: vscode.ExtensionContext) {
  try {
    await ConfigStore.initialize()
    await SemaphoreStore.initialize()

    statusBarManager = new StatusBarManager()
    clipboardManager = new ClipboardManager(statusBarManager)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handlers: Record<string, (...args: any[]) => Promise<void>> = {
      copyCode,
      resetClipboard: clipboardManager.resetClipboard.bind(clipboardManager),
      closeDialog,
      getFileTree,
      copyDefinitions,
      openMenu,
      reloadWindow: async () =>
        await vscode.commands.executeCommand('workbench.action.reloadWindow'),
      openSettings,
    }

    // eslint-disable-next-line
    context.extension.packageJSON.contributes.commands.forEach(async (cmd: { command: string }) => {
      const [, action] = cmd.command.split('.')
      const handler = handlers[action]

      if (handler) {
        context.subscriptions.push(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          vscode.commands.registerCommand(cmd.command, (...args: any[]) =>
            executeCommandHandler(handler, args),
          ),
        )
      } else {
        await vscode.window.showErrorMessage(`No handler found for command ${cmd.command}`)
        log.error(`No handler found for command ${cmd.command}`)
      }
    })

    context.subscriptions.push(
      ConfigStore.instance,
      StateStore.instance,
      LogManager.instance,
      SemaphoreStore.instance,
      watchForExtensionChanges(),
    )
  } catch (error) {
    log.error('Failed to activate extension:', error)
  }
}

export function deactivate() {
  //
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function executeCommandHandler(handler: (...args: any[]) => Promise<void>, args: any[]) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return await handler(...args)
  } catch (error) {
    const message = errorMessage(error)
    log.error(`Error executing handler=${message}`)
    await vscode.window.showErrorMessage(`Error executing command:${message}`)
  }
}
