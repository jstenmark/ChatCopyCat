import * as vscode from 'vscode'
import { copy } from './commands/copy'
import { getProjectsFileTree } from './commands/project-files'
import { outputChannel } from './utils/vsc-utils'
import { clipboardStatusBar } from './ui/status-dialog'

const copyCommand: vscode.Disposable = vscode.commands.registerCommand('ChatCopyCat.copy', copy)
const projectFilesCommand: vscode.Disposable = vscode.commands.registerCommand('ChatCopyCat.projectfiles', getProjectsFileTree)
const resetClipBoardCommand = vscode.commands.registerCommand('ChatCopyCat.resetClipboard', clipboardStatusBar.setClipboardEmpty)
const showClipBoardMenu = vscode.commands.registerCommand('ChatCopyCat.showClipBoardMenu', clipboardStatusBar.showClipBoardMenu)

/**
 * This function is called when the extension is activated.
 * It is used to setup the extension, register commands, and allocate resources.
 * @param {vscode.ExtensionContext} context - The extension context.
 */
export async function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(outputChannel)
  outputChannel.show(true)
  clipboardStatusBar.show()
  context.subscriptions.push(copyCommand, projectFilesCommand, resetClipBoardCommand, showClipBoardMenu)
}

/**
 * This function is called when the extension is deactivated.
 * It is used to dispose of resources and clean up before the extension is unloaded.
 */
export async function deactivate() {
  copyCommand.dispose()
  outputChannel.dispose()
}
