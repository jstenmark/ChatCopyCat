import * as vscode from 'vscode'
import {
  IFileTreeNode,
  IFileListItem,
  IFileTreeDialogItem,
} from '../../../domain/models/definition-types'
import {
  convertFileTreeNodeToItem,
  findNodeByPath,
  extractAllFiles,
  getCustomSupportedFileExtensions,
  handleIgnoreItemButton,
  handleIgnoreResetButton,
  handleSelectionResetButton,
} from '../../../domain/services/definitions-utils'
import {StateStore, configStore} from '../../../infra/config'
import {getFileTree} from '../../../infra/file-tree/tree-transform'
import {log} from '../../../infra/logging/log-base'
import {createQuickPick, initQuickPick} from '../dialog/dialog-components'
import {ignoreButton, ignoreResetButton, cacheResetButton} from './definitions-components'

/**
 * Displays a Quick Pick interface with a tree structure of files and folders.
 * Allows users to select multiple items for processing definitions.
 *
 * @param fileTree - Array of file tree nodes representing files and folders.
 * @returns A Promise that resolves to an array of selected file list items.
 */
export async function showFolderTreeDialog(fileTree: IFileTreeNode[]): Promise<IFileListItem[]> {
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

  const quickPick = createQuickPick<IFileTreeDialogItem>(
    quickPickItems,
    selectedItems,
    'Copy Definition from Files',
    'Select files or folders to copy definitions from',
    true,
  )
  quickPick.onDidTriggerItemButton(
    async (e: vscode.QuickPickItemButtonEvent<IFileTreeDialogItem>) =>
      await handleButtonAction(e.button, e.item, quickPick),
  )

  const result = await initQuickPick<IFileTreeDialogItem>(quickPick)

  if (!result) {
    return []
  }

  const mutableResult = [...result]
  updateDialogAutoselect(mutableResult, definitionsAutoSelect)
  return processSelectionResults(mutableResult, fileTree)
}

/**
 * Updates the auto select state based on the user's selections in the Quick Pick.
 *
 * @param result - Array of selected items from the Quick Pick.
 * @param definitionsAutoSelect - Array of paths that are auto-selected.
 */
function updateDialogAutoselect(
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

/**
 * Processes the selection results from the Quick Pick, extracting all files
 * and ensuring unique selections.
 *
 * @param result - Array of selected items from the Quick Pick.
 * @param fileTree - Array of file tree nodes to search for files.
 * @returns An array of file list items based on the selected items.
 */
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

/**
 * Refreshes the items in the Quick Pick interface based on current state and past selections.
 *
 * @param quickPick - The Quick Pick interface to be refreshed.
 */
export async function refreshDialog(quickPick: vscode.QuickPick<IFileTreeDialogItem>) {
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

/**
 * Handles actions triggered by button presses in the Quick Pick interface.
 *
 * @param button - The button that was pressed.
 * @param item - The item associated with the button press.
 * @param quickPick - The Quick Pick interface where the button was pressed.
 */
export async function handleButtonAction(
  button: vscode.QuickInputButton,
  item: IFileTreeDialogItem,
  quickPick: vscode.QuickPick<IFileTreeDialogItem>,
) {
  switch (button) {
    case ignoreButton:
      await handleIgnoreItemButton(quickPick, item)
      break
    case ignoreResetButton:
      await handleIgnoreResetButton(quickPick)
      break
    case cacheResetButton:
      await handleSelectionResetButton(quickPick)
      break
    default:
      log.info('Unknown button action')
  }
}

