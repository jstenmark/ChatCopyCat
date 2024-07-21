import * as fs from 'fs'
import {readFile} from 'fs/promises'
import * as path from 'path'
import * as vscode from 'vscode'
import {configStore} from '../config'
import {commandHandlers} from '../../application/extension/activation'
import {log} from '../logging/log-base'
import {executeCommand} from '../system/exec'
import {getProjectRootPaths} from '../system/file-utils'
import {Notify} from '../vscode/notification'
import {BumpTypes} from '../../adapters/ui/dialog/bump-version-dialog'

export function watchForExtensionChanges(): vscode.Disposable {
  if (configStore.get<boolean>('catEnabledFolderWatcher')) {
    const watchFolder = path.resolve('~/.vscode/watchdir/done.txt')
    log.debug(`Watching ${watchFolder} for changes.`)

    const watcher = (curr: fs.Stats, prev: fs.Stats) => {
      if (curr.mtimeMs !== prev.mtimeMs) {
        log.info(`Detected change in ${watchFolder}, reloading window.`)
        commandHandlers.reloadWindow().then(
          () => log.info('Window reloaded successfully.'),
          (err: Error) => log.error('Failed to reload window: ' + err.message),
        )
      }
    }

    fs.watchFile(watchFolder, {interval: 3000}, watcher)

    return new vscode.Disposable(() => fs.unwatchFile(watchFolder, watcher))
  }
  return new vscode.Disposable(() => {/** */})
}

 
const readPackageJson = async (path: string): Promise<any> => {
  try {
    const content = await readFile(path, {encoding: 'utf8'})

     
    return JSON.parse(content)
  } catch (e) {
    log.error('Could parse package.json', e)
    throw e
  }
}

export const bumpVersion = async (versionType: BumpTypes) => {
  const pkgRootPath = getProjectRootPaths()![0]
  const packageJsonPath: string = path.join(pkgRootPath, 'package.json')


  await executeCommand(pkgRootPath, 'yarn', `version --${versionType}`, '--no-git-tag-version')

   
  const pkgJsonVersion = (await readPackageJson(packageJsonPath))?.version

  Notify.info(`Version bumped to ${pkgJsonVersion}`, true, true)
}
