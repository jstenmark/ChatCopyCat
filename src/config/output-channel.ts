import * as vscode from 'vscode'

export function getChannel(name: string): vscode.OutputChannel {
  return vscode.window.createOutputChannel(name)
}
