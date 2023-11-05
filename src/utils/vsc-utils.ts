import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode'

export const showNotification = (type: 'error' | 'info' | 'warning', message: string): void => {
  const action = {
    error: vscode.window.showErrorMessage,
    info: vscode.window.showInformationMessage,
    warning: vscode.window.showWarningMessage,
  }
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  action[type](message)
}

export const outputChannel = vscode.window.createOutputChannel('ChatCopyCat')
export function log(message: string): void {
  outputChannel.appendLine(message)
}

export function clearLog(): void {
  outputChannel.clear()
}

export function showLog(): void {
  outputChannel.show()
}

export function hideLog(): void {
  outputChannel.hide()
}

function logger(message: string): void {
  log(message)
}

export function watchForExtensionChanges(): vscode.Disposable {
  const watchFolder = path.resolve(__dirname, '../../../../watchdir/done.txt')
  logger(`Watching ${watchFolder} for changes.`)

  const watcher = (curr: fs.Stats, prev: fs.Stats) => {
    if (curr.mtimeMs !== prev.mtimeMs) {
      logger(`Detected change in ${watchFolder}, reloading window.`)
      vscode.commands.executeCommand('chatcopycat.reloadWindow').then(
        () => logger('Window reloaded successfully.'),
        (err: Error) => logger('Failed to reload window: ' + err.message),
      )
    }
  }

  fs.watchFile(watchFolder, { interval: 3000 }, watcher)

  return new vscode.Disposable(() => fs.unwatchFile(watchFolder, watcher))
}
