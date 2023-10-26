import * as vscode from 'vscode'

import { outputChannel } from './utils/vsc-utils'
import { copy, closeCopyInputBox } from './commands/copy'
import { getProjectsFileTree } from './commands/projectfiles'

const copyCommand: vscode.Disposable = vscode.commands.registerCommand('ChatCopyCat.copy', copy)
const closeCopyInputBoxCommand: vscode.Disposable = vscode.commands.registerCommand('ChatCopyCat.closecopy', closeCopyInputBox)
const projectFilesCommand: vscode.Disposable = vscode.commands.registerCommand('ChatCopyCat.projectfiles', getProjectsFileTree)

/**
 * This function is called when the extension is activated.
 * It is used to setup the extension, register commands, and allocate resources.
 * @param {vscode.ExtensionContext} context - The extension context.
 */
export async function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(outputChannel)
  outputChannel.show(true)
  context.subscriptions.push(copyCommand, closeCopyInputBoxCommand, projectFilesCommand)
}

/**
 * This function is called when the extension is deactivated.
 * It is used to dispose of resources and clean up before the extension is unloaded.
 */
export function deactivate() {
  copyCommand.dispose()
  outputChannel.dispose()
}
