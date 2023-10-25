import * as vscode from 'vscode'

import { outputChannel } from './utils/vsc-utils'
import { copy, closeCopyInputBox } from './commands/copy'
import { getProjectsFileTree } from './commands/projectfiles'

const copyCommand: vscode.Disposable = vscode.commands.registerCommand('ChatCopyCat.copy', copy)
const closeCopyInputBoxCommand: vscode.Disposable = vscode.commands.registerCommand('ChatCopyCat.closecopy', closeCopyInputBox)
const projectFilesCommand: vscode.Disposable = vscode.commands.registerCommand('ChatCopyCat.projectfiles', getProjectsFileTree)

export async function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(outputChannel)
  outputChannel.show(true)

  context.subscriptions.push(copyCommand)
  context.subscriptions.push(closeCopyInputBoxCommand)
  context.subscriptions.push(projectFilesCommand)
}
export function deactivate() {
  if (copyCommand) {
    copyCommand.dispose()
    outputChannel.dispose()
  }
}
