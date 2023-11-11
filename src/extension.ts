import * as vscode from 'vscode'
import { ClipboardManager } from './clipboard'
import { copyCode, copyDefinitions, getFileTree, openMenu, openSettings } from './commands'
import { Semaphore } from './config'
import { closeDialog } from './dialog'
import { LogManager, createChannel, log } from './logging'
import { StatusBarManager } from './statusbar'
import { watchForExtensionChanges } from './utils'
import { ConfigStore } from './config'

export let statusBarManager: StatusBarManager
export let clipboardManager: ClipboardManager
export let configStore: ConfigStore

/**
 * This function is called when the extension is activated.
 * It is used to setup the extension, register commands, and allocate resources.
 * @param {vscode.ExtensionContext} context - The extension context.
 */
export async function activate(context: vscode.ExtensionContext) {
  try {
    configStore = new ConfigStore('JStenmark', 'chatcopycat')
    const _logChannel = createChannel('ChatCopyCat')
    LogManager.instance.setChannel(_logChannel)
    await Semaphore.instance.registerDialogContext()

    statusBarManager = new StatusBarManager()
    clipboardManager = new ClipboardManager(statusBarManager)
    LogManager.instance.getChannel()?.show(true)

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
            } catch (error) {
              console.error(`Error executing command ${cmd.command}:`, error)
              log.error(`Error executing command ${cmd.command}:`, error)
            }
          }),
        )
      } else {
        console.warn(`No handler found for command ${cmd.command}`)
        log.warn(`No handler found for command ${cmd.command}`)
      }
    })

    context.subscriptions.push(_logChannel, watchForExtensionChanges())
  } catch (error) {
    console.error('Failed to activate extension:', error)
    log.error('Failed to activate extension:', error)
  }
}

export function deactivate() {
  //
}
