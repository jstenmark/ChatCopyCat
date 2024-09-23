
import * as path from 'path'
import {
  commands,
  type DocumentSymbol,
  Uri,
  window,
  workspace,
} from 'vscode'

import {showFolderTreeDialog} from '../../adapters/ui/dialog/filetree-dialog'
import {codeBlock} from '../../domain/models/inquiry-template'
import {type IFileListItem, type IFileTreeNode, type IPathAndUri} from '../../domain/models/types'
import {
  getCustomSupportedFileExtensions,
} from '../../domain/services/definitions-utils'
import {type ClipboardManager} from '../../infra/clipboard/clipboard-manager'
import {configStore} from '../../infra/config/config-store'
import {getFileTree} from '../../infra/file-tree/tree-transform'
import {log} from '../../infra/logging/log-base'
import {Notify} from '../../infra/vscode/notification'
import {type StatusBarManager} from '../../infra/vscode/statusbar-manager'
import {container} from '../../inversify/inversify.config'
import {TYPES} from '../../inversify/types'

export async function copyDefinitionsFromFiles(): Promise<void> {
  try {
    await configStore.onConfigReady()
    const allDefinitions = await gatherDefinitions()
    if (allDefinitions.length === 0) {
      await window.showInformationMessage('No definitions found or aborted.')
      return
    }
    const clipboardManager = container.get<ClipboardManager>(TYPES.ClipboardManager)
    const statusBarManager = container.get<StatusBarManager>(TYPES.StatusBarManager)

    await clipboardManager.copyToClipboard(allDefinitions.join('\n\n'))
    await window.showInformationMessage(
      `Copied definitions from ${allDefinitions.length.toString()} files to clipboard.`,
    )
    statusBarManager.updateCopyCount(allDefinitions.length)
  } catch (error) {
    log.error('Error copying definitions from files:', error)
    Promise.resolve(window.showErrorMessage('Error occurred while copying definitions.')).catch(
      (e: unknown) => !!e,
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
      const doc = await workspace.openTextDocument(uri)
      const symbols = await commands.executeCommand<DocumentSymbol[]>(
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
