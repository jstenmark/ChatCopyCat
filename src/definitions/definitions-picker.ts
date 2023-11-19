import * as vscode from 'vscode'
import * as path from 'path'

import { StateStore, configStore } from '../config'
import {} from './types'
import { getCustomSupportedFileExtensions } from '../utils'
import { getFileTree } from '../utils/tree-transform'
import { log } from '../logging'
import { ignoreButton, ignoreResetButton, cacheResetButton } from './definitions-components'
import { extractAllFiles, convertFileTreeNodeToItem, findNodeByPath } from './definitions-utils'
import { IFileTreeNode, IFileTreeDialogItem, IFileListItem } from './types'

export async function showFolderTreeQuickPick(fileTree: IFileTreeNode[]): Promise<IFileListItem[]> {
  const quickPickItems = fileTree.flatMap(node => convertFileTreeNodeToItem(node))
  const definitionsAutoSelect =
    StateStore.instance.getState<string[]>('definitionsAutoSelect') ?? []
  const initialAutoSelect = new Set(definitionsAutoSelect)
  const selectedItems: IFileTreeDialogItem[] = []
  quickPickItems.forEach(item => {
    if (initialAutoSelect.has(item.filePath)) {
      selectedItems.push(item)
    }
  })

  const quickPick = vscode.window.createQuickPick<IFileTreeDialogItem>()
  quickPick.items = quickPickItems
  quickPick.canSelectMany = true
  quickPick.placeholder = 'Select files or folders to copy definitions from'
  quickPick.selectedItems = selectedItems

  quickPick.onDidTriggerItemButton(
    async (e: vscode.QuickPickItemButtonEvent<IFileTreeDialogItem>) =>
      await handleButtonAction(e.button, e.item, quickPick),
  )

  quickPick.show()

  const result = await Promise.race([
    new Promise<readonly IFileTreeDialogItem[]>(resolve =>
      quickPick.onDidAccept(() => resolve(quickPick.selectedItems)),
    ),
    new Promise<undefined>(resolve => quickPick.onDidHide(() => resolve(undefined))),
  ])

  quickPick.dispose()
  if (!result) {
    return [] // Invalid pick
  }

  const mutableResult = [...result]
  updateDefinitionsAutoSelect(mutableResult, definitionsAutoSelect)
  return processSelectionResults(mutableResult, fileTree)
}

function updateDefinitionsAutoSelect(
  result: IFileTreeDialogItem[],
  definitionsAutoSelect: string[],
) {
  result.forEach(item => {
    if (item?.filePath && !definitionsAutoSelect.includes(item.filePath)) {
      definitionsAutoSelect.push(item.filePath)
    }
  })

  const updatedAutoSelect = definitionsAutoSelect.filter(
    path => result.some(item => item.filePath === path) ?? true,
  )

  StateStore.instance.setState<string[]>('definitionsAutoSelect', updatedAutoSelect)
}

function processSelectionResults(
  result: IFileTreeDialogItem[],
  fileTree: IFileTreeNode[],
): IFileListItem[] {
  const selectedFileTree: IFileListItem[] = []
  const uniquePaths = new Set<string>()

  result.forEach(item => {
    if (item.isFolder) {
      const folderNode = findNodeByPath(fileTree, item.filePath)
      if (folderNode) {
        const folderFiles = extractAllFiles(folderNode)
        folderFiles.forEach(file => {
          if (!uniquePaths.has(file.path)) {
            uniquePaths.add(file.path)
            selectedFileTree.push(file)
          }
        })
      }
    } else {
      if (!uniquePaths.has(item.filePath)) {
        uniquePaths.add(item.filePath)
        selectedFileTree.push({
          path: item.filePath,
          isFolder: item.isFolder,
          rootPath: item.rootPath,
        })
      }
    }
  })

  return selectedFileTree
}
export async function refreshQuickPick(quickPick: vscode.QuickPick<IFileTreeDialogItem>) {
  const currentPickedItemsPaths = new Set(quickPick.selectedItems.map(item => item.filePath))
  const allowExtList = await getCustomSupportedFileExtensions()
  const customIgnoreList = configStore.get<string[]>('definitionsIgnoreList')
  const fileTree = await getFileTree(customIgnoreList, allowExtList)
  const quickPickItems = fileTree.flatMap(node => convertFileTreeNodeToItem(node))

  quickPick.items = quickPickItems
  quickPick.selectedItems = quickPickItems.filter(item =>
    currentPickedItemsPaths.has(item.filePath),
  )
}

export async function handleButtonAction(
  button: vscode.QuickInputButton,
  item: IFileTreeDialogItem,
  quickPick: vscode.QuickPick<IFileTreeDialogItem>,
) {
  switch (button) {
    case ignoreButton:
      if (path.basename(item.filePath) === '.') {
        log.warn('Cannot add project root to ignore list')
        await vscode.window.showWarningMessage('Cannot add project root to ignore list')
        break
      } else {
        const igList = [...configStore.get<string[]>('definitionsIgnoreList'), item.filePath]
        await configStore.update('definitionsIgnoreList', igList)
        await refreshQuickPick(quickPick)
        log.info('add to ignore:', item.filePath)
        break
      }
    case ignoreResetButton:
      await configStore.reset('definitionsIgnoreList')
      await refreshQuickPick(quickPick)
      await vscode.window.showInformationMessage('Workspace "definitionsIgnoreList" reset')
      log.info('Reset ignorelist')
      break
    case cacheResetButton:
      StateStore.instance.setState<string[]>('definitionsAutoSelect', [])
      await refreshQuickPick(quickPick)
      await vscode.window.showInformationMessage('Selection cache reset')
      log.info('Selection cache reset')
      break
    default:
      log.info('Unknown button action')
  }
}
