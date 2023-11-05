import * as vscode from 'vscode'
import { Clipboard } from './clipboard/clipboard'
import { copy } from './commands/copy'
import { getProjectsFileTree } from './commands/project-files'
import { StatusBar } from './ui/statusbar'
import { outputChannel, watchForExtensionChanges } from './utils/vsc-utils'

export const StatusBarManager = new StatusBar()
export const ClipboardManager = new Clipboard(StatusBarManager)

const resetClipboardCommand = vscode.commands.registerCommand('chatcopycat.resetClipboard', ClipboardManager.resetClipboard.bind(ClipboardManager))

const showClipboardMenuCommand = vscode.commands.registerCommand('chatcopycat.showClipboardMenu', ClipboardManager.showClipboardMenu.bind(ClipboardManager))

/**
 * This function is called when the extension is activated.
 * It is used to setup the extension, register commands, and allocate resources.
 * @param {vscode.ExtensionContext} context - The extension context.
 */
export function activate(context: vscode.ExtensionContext) {
  const copyCommand = vscode.commands.registerCommand('chatcopycat.copy', copy)
  const projectFilesCommand = vscode.commands.registerCommand('chatcopycat.projectFiles', getProjectsFileTree)
  const reloadWindowCommand = vscode.commands.registerCommand('chatcopycat.reloadWindow', async () => {
    await vscode.commands.executeCommand('workbench.action.reloadWindow')
  })
  const watcherDisposable: vscode.Disposable = watchForExtensionChanges()

  context.subscriptions.push(
    outputChannel,
    copyCommand,
    projectFilesCommand,
    resetClipboardCommand,
    showClipboardMenuCommand,
    reloadWindowCommand,
    watcherDisposable,
  )

  outputChannel.show(true)
}

/**
 * This function is called when the extension is deactivated.
 * It is used to dispose of resources and clean up before the extension is unloaded.
 */
export function deactivate() {
  outputChannel.dispose()
}
