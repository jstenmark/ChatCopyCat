import * as vscode from 'vscode'
import { ClipboardManager } from './clipboard/clipboard-manager'
import { copy } from './commands/copy-command'
import { getFileTree } from './commands/filetree-command'
import { reloadWindow } from './commands/reload-command'
import { resetClipboard } from './commands/resetclipboard-command'
import { showClipboardMenu } from './commands/show-clipboard-menu-command'
import { getChannel } from './config/output-channel'
import { registerContext } from './config/store-util'
import { close } from './dialog/dialog-utils'
import { LogManager, log } from './logging'
import { StatusBarManager } from './statusbar/statusbar-manager'
import { watchForExtensionChanges } from './utils/file-utils'

export let statusBarManager: StatusBarManager
export let clipboardManager: ClipboardManager

/**
 * This function is called when the extension is activated.
 * It is used to setup the extension, register commands, and allocate resources.
 * @param {vscode.ExtensionContext} context - The extension context.
 */
export async function activate(context: vscode.ExtensionContext) {
  try {
    const logChannel = getChannel('ChatCopyCat')
    LogManager.instance.setChannel(logChannel)
    await registerContext()
    statusBarManager = new StatusBarManager()
    clipboardManager = new ClipboardManager(statusBarManager)

    // commands
    const copyCommand: vscode.Disposable = vscode.commands.registerCommand('chatcopycat.copy', copy)
    const closeDialogCommand: vscode.Disposable = vscode.commands.registerCommand(
      'chatcopycat.closeDialog',
      close,
    )
    const projectFilesCommand: vscode.Disposable = vscode.commands.registerCommand(
      'chatcopycat.getFileTree',
      getFileTree,
    )
    const reloadWindowCommand: vscode.Disposable = vscode.commands.registerCommand(
      'chatcopycat.reloadWindow',
      reloadWindow,
    )
    const resetClipboardCommand: vscode.Disposable = vscode.commands.registerCommand(
      'chatcopycat.resetClipboard',
      resetClipboard,
    )
    const showClipboardMenuCommand: vscode.Disposable = vscode.commands.registerCommand(
      'chatcopycat.showClipboardMenu',
      showClipboardMenu,
    )
    const watcherDisposable: vscode.Disposable = watchForExtensionChanges()

    context.subscriptions.push(
      logChannel,
      copyCommand,
      closeDialogCommand,
      projectFilesCommand,
      resetClipboardCommand,
      showClipboardMenuCommand,
      reloadWindowCommand,
      watcherDisposable,
    )

    logChannel.show(true)
  } catch (error) {
    log.error('Failed to activate extension:', error)
  }
}

export function deactivate() {
  //
}
