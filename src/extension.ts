import * as vscode from 'vscode'
import { copy } from './commands/copy'
import { getProjectsFileTree } from './commands/project-files'
import { clipboardStatusBar } from './ui/status-dialog'
import { outputChannel } from './utils/vsc-utils'

let copyCommand: vscode.Disposable

/**
 * This function is called when the extension is activated.
 * It is used to setup the extension, register commands, and allocate resources.
 * @param {vscode.ExtensionContext} context - The extension context.
 */
export function activate(context: vscode.ExtensionContext) {
  copyCommand = vscode.commands.registerCommand('ChatCopyCat.copy', copy)
  const projectFilesCommand: vscode.Disposable = vscode.commands.registerCommand('ChatCopyCat.projectFiles', getProjectsFileTree)
  const resetClipboardCommand = vscode.commands.registerCommand('ChatCopyCat.resetClipboard', clipboardStatusBar.setClipboardEmpty.bind(clipboardStatusBar))
  const showClipBoardMenu = vscode.commands.registerCommand('ChatCopyCat.showClipBoardMenu', clipboardStatusBar.showClipboardMenu.bind(clipboardStatusBar))

  context.subscriptions.push(outputChannel)
  outputChannel.show(true)
  clipboardStatusBar.show()
  context.subscriptions.push(copyCommand, projectFilesCommand, resetClipboardCommand, showClipBoardMenu)
}

/**
 * This function is called when the extension is deactivated.
 * It is used to dispose of resources and clean up before the extension is unloaded.
 */
export function deactivate() {
  copyCommand.dispose()
  outputChannel.dispose()
}
