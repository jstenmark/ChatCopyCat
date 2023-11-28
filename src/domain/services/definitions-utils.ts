import path from 'path'
import * as vscode from 'vscode'
import {selectFileTreeDialogItem} from '../../adapters/ui/components/filetree-dialog'
import {IFileTreeNode, IFileTreeDialogItem, IFileListItem} from '../models/filetree-types'
import {refreshDialog} from '../../adapters/ui/filetree-handler'
import {configStore, StateStore} from '../../infra/config'
import {languageExtensionMap} from '../../shared/constants/consts'
import {Notify} from '../../infra/vscode/notification'

/**
 * Converts a file tree node to a dialog item for display in a Quick Pick interface.
 *
 * @param node - The file tree node to convert.
 * @param indent - The indentation level for the item, used for visual hierarchy.
 * @returns An array of file tree dialog items.
 */
export function convertFileTreeNodeToItem(node: IFileTreeNode, indent = 0): IFileTreeDialogItem[] {
  const items: IFileTreeDialogItem[] = []

  if (node.isFolder) {
    items.push(createFolderSeparator(node, indent))
  }

  items.push(createFileTreeItem(node, indent))

  if (node.children) {
    node.children.forEach(child => {
      items.push(...convertFileTreeNodeToItem(child, indent + 1))
    })
  }

  return items
}


/**
 * Creates a label for a file tree node, including an icon and indentation.
 *
 * @param node - The file tree node for which to create a label.
 * @param indent - The indentation level for the label.
 * @returns A formatted label string.
 */
export function createLabel(node: IFileTreeNode, indent: number): string {
  const prefix = '   '.repeat(indent) + (node.isFolder ? '$(indent)' : '  ')
  const icon = node.isFolder ? '$(folder)' : '$(file)'
  return `${prefix} ${icon} ${path.basename(node.path)}`
}


/**
 * Creates a folder separator item for the Quick Pick interface.
 *
 * @param node - The file tree node representing a folder.
 * @param indent - The indentation level for the separator.
 * @returns A folder separator item for Quick Pick.
 */
function createFolderSeparator(node: IFileTreeNode, indent: number): IFileTreeDialogItem {
  return {
    label: node.path,
    description: '$(indent)'.repeat(indent),
    kind: vscode.QuickPickItemKind.Separator,
  } as IFileTreeDialogItem
}

/**
 * Creates a Quick Pick dialog item from a file tree node.
 *
 * @param node - The file tree node to convert.
 * @param indent - The indentation level for the item.
 * @returns A Quick Pick dialog item.
 */
function createFileTreeItem(node: IFileTreeNode, indent: number): IFileTreeDialogItem {
  const label = createLabel(node, indent)
  return selectFileTreeDialogItem(node, label)
}

/**
 * Finds a file tree node by its path.
 *
 * @param nodes - An array of file tree nodes to search.
 * @param searchPath - The path to search for.
 * @returns The found file tree node, or undefined if not found.
 */
export function findNodeByPath(
  nodes: IFileTreeNode[],
  searchPath: string,
): IFileTreeNode | undefined {
  for (const node of nodes) {
    if (node.path === searchPath) {
      return node
    }
    if (node.isFolder) {
      const found = findNodeByPath(node.children ?? [], searchPath)
      if (found) {
        return found
      }
    }
  }
  return undefined
}

/**
 * Extracts all file list items from a file tree node, including those in nested folders.
 *
 * @param node - The file tree node from which to extract files.
 * @returns An array of file list items.
 */
export function extractAllFiles(node: IFileTreeNode): IFileListItem[] {
  if (!node.isFolder) {
    return [{path: node.path, isFolder: false, rootPath: node.rootPath}]
  }
  return node.children?.flatMap(child => extractAllFiles(child)) ?? []
}

/**
 * Handles the action for the ignore reset button.
 * Resets the 'definitionsIgnoreList' in the config store and refreshes the quick pick items.
 * @param quickPick Optional quick pick interface to refresh.
 */
export async function handleIgnoreResetButton(quickPick?: vscode.QuickPick<IFileTreeDialogItem>) {
  await configStore.reset('definitionsIgnoreList')
  if (quickPick) {
    await refreshDialog(quickPick)
  }
  Notify.info('Workspace "definitionsIgnoreList" reset',true,true)
}

/**
 * Handles the action for the cache reset button.
 * Resets the 'definitionsAutoSelect' state and refreshes the quick pick items.
 * @param quickPick Optional quick pick interface to refresh.
 */
export async function handleSelectionResetButton(
  quickPick?: vscode.QuickPick<IFileTreeDialogItem>,
) {
  StateStore.setState<string[]>('definitionsAutoSelect', [])
  if (quickPick) {
    await refreshDialog(quickPick)
  }
  Notify.info('Selections reset',true,true)
}

export async function handleIgnoreItemButton(
  quickPick: vscode.QuickPick<IFileTreeDialogItem>,
  item: IFileTreeDialogItem,
) {
  if (path.basename(item.filePath) === '.') {
    Notify.warn('Cannot add Workspace root to ignore config',false,true)
  } else {
    await configStore.update('definitionsIgnoreList', [
      ...configStore.get<string[]>('definitionsIgnoreList'),
      item.filePath
    ])
    Notify.info(`add to ignore definitions ignore config:${item.filePath}`,true,true)
    await refreshDialog(quickPick)
  }
}

export async function getCustomSupportedFileExtensions(): Promise<Set<string>> {
  await configStore.onConfigReady()
  const extensionsSet = new Set<string>()
  const langs = await vscode.languages.getLanguages()
  for (const lang of langs) {
    const extensions = languageExtensionMap[lang]
    if (extensions) {
      extensions.forEach(ext => extensionsSet.add(ext))
    }
  }
  configStore.get<string[]>('definitionsAllowList').forEach(ext => extensionsSet.add(ext))
  return extensionsSet
}

