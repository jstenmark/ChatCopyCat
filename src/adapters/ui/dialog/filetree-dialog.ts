import * as vscode from 'vscode'

import {type IFileListItem, type IFileTreeDialogItem, type IFileTreeNode} from '../../../domain/models/types'
import {convertFileTreeNodeToItem} from '../../../domain/services/definitions-utils'
import {StateStore} from '../../../infra/state/state-store'
import {createQuickPick, initQuickPick} from '../components/window-components'
import {handleButtonAction, processSelectionResults,updateDefinitionsDialogAutoselect} from '../filetree-handler'


export const selectFileTreeDialogItem = (node: IFileTreeNode, label: string) => ({
  label,
  filePath: node.path,
  isFolder: node.isFolder,
  rootPath: node.rootPath,
  buttons: [cacheResetButton, ignoreResetButton, ignoreButton],
})

export const ignoreButton: vscode.QuickInputButton = {
  iconPath: new vscode.ThemeIcon('eye-closed'),
  tooltip: 'Ignore this item',
}
export const ignoreResetButton: vscode.QuickInputButton = {
  iconPath: new vscode.ThemeIcon('archive'),
  tooltip: 'Reset ignore list',
}
export const cacheResetButton: vscode.QuickInputButton = {
  iconPath: new vscode.ThemeIcon('history'),
  tooltip: 'Clear selection cache',
}

/**
 * Displays a Quick Pick interface with a tree structure of files and folders.
 * Allows users to select multiple items for processing definitions.
 *
 * @param fileTree - Array of file tree nodes representing files and folders.
 * @returns A Promise that resolves to an array of selected file list items.
 */

export async function showFolderTreeDialog(fileTree: IFileTreeNode[]): Promise<IFileListItem[]> {
  const quickPickItems = fileTree.flatMap(node => convertFileTreeNodeToItem(node))
  const definitionsAutoSelect = StateStore.getState<string[]>('definitionsAutoSelect') ?? []
  const initialAutoSelect = new Set(definitionsAutoSelect)
  const selectedItems: IFileTreeDialogItem[] = []
  quickPickItems.forEach(item => {
    if (initialAutoSelect.has(item.filePath)) {
      selectedItems.push(item)
    }
  })

  const quickPick = createQuickPick<IFileTreeDialogItem>(
    quickPickItems,
    selectedItems,
    'Copy Definition from Files',
    'Select files or folders to copy definitions from',
    true
  )
  quickPick.onDidTriggerItemButton(
    async (e: vscode.QuickPickItemButtonEvent<IFileTreeDialogItem>) => await handleButtonAction(e.button, e.item, quickPick)
  )

  const result = await initQuickPick<IFileTreeDialogItem>(quickPick)

  if (!result) {
    return []
  }

  const mutableResult = [...result]
  updateDefinitionsDialogAutoselect(mutableResult, definitionsAutoSelect)
  return processSelectionResults(mutableResult, fileTree)
}
