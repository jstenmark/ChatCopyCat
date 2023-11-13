import * as vscode from 'vscode'
import { ClipboardManager } from './clipboard'
import { copyCode, copyDefinitions, getFileTree, openMenu, openSettings } from './commands'
import { Semaphore } from './config/semaphore-store'
import { closeDialog } from './dialog'
import { StatusBarManager } from './statusbar'
import { watchForExtensionChanges } from './utils'
import { configStore } from './config'
import { log, LogLevel } from './logging'
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
    await configStore.whenConfigReady()
    await Semaphore.initialize()

    const _logChannel = vscode.window.createOutputChannel('ChatCopyCat', 'log')
    LogManager.initialize(_logChannel, LogLevel.DEBUG)

    statusBarManager = new StatusBarManager()
    clipboardManager = new ClipboardManager(statusBarManager)

    // eslint-disable-next-line @typescript-eslint/ban-types
    const handlers: Record<string, Function> = {
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
    context.extension.packageJSON.contributes.commands.forEach((cmd: { command: string }) => {
      const [, action] = cmd.command.split('.')
      const handler = handlers[action]

      if (handler) {
        context.subscriptions.push(
          vscode.commands.registerCommand(cmd.command, async (...args) => {
            try {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
              await handler(...args)
            } catch (err) {
              log.error(`Couldnt register:${cmd.command}`, err)
              await vscode.window.showErrorMessage('Couldnt do stuff:ERROR=' + JSON.stringify(err))
            }
          }),
        )
      } else {
        log.warn(`No handler found for command ${cmd.command}`)
      }
    })

    context.subscriptions.push(_logChannel, watchForExtensionChanges())
  } catch (error) {
    log.error('Failed to activate extension:', error)
  }
}

export function deactivate() {
  //
}
