import path from 'path'
import * as vscode from 'vscode'
import { selectFileTreeDialogItem } from './definitions-components'
import { IFileTreeNode, IFileTreeDialogItem, IFileListItem } from './types'

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

export function createLabel(node: IFileTreeNode, indent: number): string {
  const prefix = '   '.repeat(indent) + (node.isFolder ? '$(indent)' : '  ')
  const icon = node.isFolder ? '$(folder)' : '$(file)'
  return `${prefix} ${icon} ${path.basename(node.path)}`
}

function createFolderSeparator(node: IFileTreeNode, indent: number): IFileTreeDialogItem {
  return {
    label: node.path,
    description: '$(indent)'.repeat(indent),
    kind: vscode.QuickPickItemKind.Separator,
  } as IFileTreeDialogItem
}

function createFileTreeItem(node: IFileTreeNode, indent: number): IFileTreeDialogItem {
  const label = createLabel(node, indent)
  return selectFileTreeDialogItem(node, label)
}

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

export function extractAllFiles(node: IFileTreeNode): IFileListItem[] {
  if (!node.isFolder) {
    return [{ path: node.path, isFolder: false, rootPath: node.rootPath }]
  }
  return node.children?.flatMap(child => extractAllFiles(child)) ?? []
}
