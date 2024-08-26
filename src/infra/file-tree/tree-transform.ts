import * as path from 'path'

import {type IFileListItem, type IFileTreeNode} from '../../domain/models/filetree-types'
import {parseGitignorePatterns} from '../../shared/utils/ignore'
import {configStore} from '../config'
import {getProjectRootPaths} from '../system/file-utils'
import {getFileList} from './file-handling'

export function convertToFileTreeNode(rootPath: string, fileList: IFileListItem[]): IFileTreeNode {
  const rootNode: IFileTreeNode = {
    path: '.',
    isFolder: true,
    children: [],
    rootPath,
  }
  const pathToNodeMap = new Map<string, IFileTreeNode>()
  pathToNodeMap.set('.', rootNode)

  for (const fileItem of fileList) {
    const fullItemPath = path.join(rootPath, fileItem.path)
    const normalizedItemPath = path.normalize(fullItemPath)
    const relativeItemPath = path.relative(rootPath, normalizedItemPath)

    const currentNode: IFileTreeNode = {
      path: relativeItemPath,
      isFolder: fileItem.isFolder,
      children: fileItem.isFolder ? [] : undefined,
      rootPath,
    }

    let parentPath = path.dirname(relativeItemPath)
    if (parentPath === '.') {
      parentPath = '.'
    }

    if (!pathToNodeMap.has(parentPath)) {
      pathToNodeMap.set(parentPath, {
        path: parentPath,
        isFolder: true,
        children: [],
        rootPath,
      })
    }

    const parentNode = pathToNodeMap.get(parentPath)
    if (parentNode && !parentNode.children?.find(child => child.path === relativeItemPath)) {
      parentNode.children?.push(currentNode)
    }

    pathToNodeMap.set(relativeItemPath, currentNode)
  }
  return rootNode
}

export async function getFileTree(
  customIgnoreList: string[] = [],
  allowExtList?: Set<string>,
): Promise<IFileTreeNode[]> {
  const projectFiles = await fetchWorkspaceFiles(customIgnoreList, allowExtList)
  return projectFiles.map(({rootPath, fileList}) => convertToFileTreeNode(rootPath, fileList))
}

export async function getFlatFileList(
  customIgnoreList: string[] = [],
  allowExtList?: Set<string>,
): Promise<{rootPath: string; files: string[]}[]> {
  const projectFiles = await fetchWorkspaceFiles(customIgnoreList, allowExtList)
  return projectFiles.map(({rootPath, fileList}) => ({
    rootPath,
    files: fileList.map(file => file.path),
  }))
}

async function fetchWorkspaceFiles(
  customIgnoreList: string[] = [],
  allowExtList?: Set<string>,
): Promise<{rootPath: string; fileList: IFileListItem[]}[]> {
  const rootPaths: string[] = getProjectRootPaths() ?? []
  const projectIgnoreList = configStore.get<string[]>('fileTreeIgnoreList')
  const ignorePatterns = parseGitignorePatterns([...projectIgnoreList, ...customIgnoreList].join('\n'))

  return await Promise.all(
    rootPaths.map(async rootPath => {
      const fileList = await getFileList(rootPath, rootPath, ignorePatterns, allowExtList)
      return {rootPath, fileList}
    }),
  )
}
