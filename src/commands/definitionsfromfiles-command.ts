import {
  Uri,
  window,
  DocumentSymbol,
  commands,
  workspace,
  ProgressLocation,
  CancellationToken,
  Progress,
} from 'vscode'
import * as path from 'path'
import { log } from '../logging'
import { configStore } from '../config'
import { getFileTree, getCustomSupportedFileExtensions, codeBlock } from '../utils'
import { clipboardManager } from '../clipboard'
import { showFolderTreeQuickPick } from '../definitions/definitions-picker'
import { IFileListItem, IFileTreeNode, IPathAndUri } from '../definitions/types'

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
  } catch (error) {
    log.error('Error copying definitions from files:', error)
    Promise.resolve(window.showErrorMessage('Error occurred while copying definitions.')).catch(
      e => !!e,
    )
  }
}

async function gatherDefinitions(): Promise<string[]> {
  const allowExtList = await getCustomSupportedFileExtensions()
  const customIgnoreList = configStore.get<string[]>('definitionsIgnoreList')
  const fileTree: IFileTreeNode[] = await getFileTree(customIgnoreList, allowExtList)
  const fileTreePicked: IFileListItem[] = await showFolderTreeQuickPick(fileTree)
  if (fileTreePicked.length === 0) {
    return []
  }

  const fileUris: IPathAndUri[] = fileTreePicked.map(item => ({
    uri: Uri.file(path.join(item.rootPath, item.path)),
    path: item.path,
  }))

  const allDefinitions: string[] = []
  await window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: 'Fetching Definitions',
      cancellable: true,
    },
    async (
      progress: Progress<{ increment: number; message: string }>,
      token: CancellationToken,
    ) => {
      token.onCancellationRequested(() => {
        console.log('User canceled the long running operation')
      })

      for (let i = 0; i < fileUris.length; i++) {
        const { uri, path } = fileUris[i]

        const increment = (i / fileUris.length) * 100
        progress.report({ increment, message: `Processing file ${i + 1} of ${fileUris.length}` })

        const doc = await workspace.openTextDocument(uri)
        const symbols = await commands.executeCommand<DocumentSymbol[]>(
          'vscode.executeDocumentSymbolProvider',
          uri,
        )

        if (symbols) {
          const definitions = symbols.map(symbol => doc.getText(symbol.range))
          allDefinitions.push(codeBlock(definitions, path, doc.languageId))
        }

        if (token.isCancellationRequested) {
          break
        }
      }
    },
  )

  return allDefinitions
}
