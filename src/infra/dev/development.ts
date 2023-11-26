import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode'
import {log} from '../logging/log-base'
import {handlers} from '../../application/extension/activation'

export function watchForExtensionChanges(): vscode.Disposable {
  const watchFolder = path.resolve('/home/johannes/.vscode/watchdir/done.txt')
  log.debug(`Watching ${watchFolder} for changes.`)

  const watcher = (curr: fs.Stats, prev: fs.Stats) => {
    if (curr.mtimeMs !== prev.mtimeMs) {
      log.info(`Detected change in ${watchFolder}, reloading window.`)
      handlers.reloadWindow().then(
        () => log.info('Window reloaded successfully.'),
        (err: Error) => log.error('Failed to reload window: ' + err.message),
      )
    }
  }

  fs.watchFile(watchFolder, {interval: 3000}, watcher)

  return new vscode.Disposable(() => fs.unwatchFile(watchFolder, watcher))
}
