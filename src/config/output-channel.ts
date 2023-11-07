import * as vscode from 'vscode'

export function getChannel(): vscode.OutputChannel {
  return vscode.window.createOutputChannel('ChatCopyCat')
}
