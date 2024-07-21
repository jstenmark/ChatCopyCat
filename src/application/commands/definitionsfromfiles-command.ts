import {
  Uri,
  window,
} from 'vscode'
import * as vscode from 'vscode'
import * as path from 'path'

import {showFolderTreeDialog} from '../../adapters/ui/dialog/filetree-dialog'
import {IFileListItem, IFileTreeNode, IPathAndUri} from '../../domain/models/filetree-types'
import {
  getCustomSupportedFileExtensions,
} from '../../domain/services/definitions-utils'
import {clipboardManager} from '../../infra/clipboard'
import {configStore} from '../../infra/config'
import {log} from '../../infra/logging/log-base'
import {getFileTree} from '../../infra/file-tree/tree-transform'
import {Notify} from '../../infra/vscode/notification'
import {codeBlock} from '../../domain/models/inquiry-template'
import {statusBarManager} from '../../infra/vscode/statusbar-manager'

export async function copyDefinitionsFromFiles(): Promise<void> {
  try {
    await configStore.onConfigReady()
    const allDefinitions = await gatherDefinitions()
    if (allDefinitions.length === 0) {
      await window.showInformationMessage('No definitions found or aborted.')
      return
    }
    await clipboardManager.copyToClipboard(allDefinitions.join('\n\n'))
    await window.showInformationMessage(
      `Copied definitions from ${allDefinitions.length} files to clipboard.`,
    )
    statusBarManager.updateCopyCount(allDefinitions.length)
  } catch (error) {
    log.error('Error copying definitions from files:', error)
    Promise.resolve(window.showErrorMessage('Error occurred while copying definitions.')).catch(
      e => !!e,
    )
  }
}


export async function gatherDefinitions(): Promise<string[]> {
  const allowExtList = await getCustomSupportedFileExtensions()
  const customIgnoreList = configStore.get<string[]>('definitionsIgnoreList')
  const fileTree: IFileTreeNode[] = await getFileTree(customIgnoreList, allowExtList)
  const fileTreePicked: IFileListItem[] = await showFolderTreeDialog(fileTree)
  if (fileTreePicked.length === 0) {
    return []
  }

  const fileUris: IPathAndUri[] = fileTreePicked.map(item => ({
    uri: Uri.file(path.join(item.rootPath, item.path)),
    path: item.path,
  }))

  const allDefinitions = await Notify.processFilesWithProgress<string>(
    'Fetching Definitions',
    fileUris,
    async (uri, filePath, _reportProgress, _token) => {
      const doc = await vscode.workspace.openTextDocument(uri)
      const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
        'vscode.executeDocumentSymbolProvider',
        uri,
      )
      if (symbols) {
        return symbols.map(symbol => {
          const definitionText = doc.getText(symbol.range)
          const lineNumStart = symbol.range.start.line + 1
          const lineNumEnd = symbol.range.end.line + 1

          return codeBlock(definitionText, filePath, doc.languageId, lineNumStart, lineNumEnd)
        }).join('\n')
      }
      return ''
    },
  )

  return allDefinitions.filter(def => def)
}
