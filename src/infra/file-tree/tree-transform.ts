import * as path from 'path'
import ignore from 'ignore'
import {IFileListItem} from '../../domain/models/definition-types'
import {IFileTreeNode} from '../../domain/models/definition-types'
import {getFileList} from './file-handling'
import {getProjectRootPaths} from '../system/file-utils'
import {configStore} from '../config'

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
  const igInstance = ignore()
  const projectIgnoreList = configStore.get<string[]>('projectTreeIgnoreList') ?? []
  igInstance.add([...projectIgnoreList, ...customIgnoreList])

  return await Promise.all(
    rootPaths.map(async rootPath => {
      const fileList = await getFileList(rootPath, rootPath, igInstance, allowExtList)
      return {rootPath, fileList}
    }),
  )
}