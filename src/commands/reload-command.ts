import * as vscode from 'vscode'

export const reloadWindow = async () => {
  await vscode.commands.executeCommand('workbench.action.reloadWindow')
}
