import * as path from 'path'
import { getFileList, getProjectRootPaths } from './file-handling'
import { IFileListItem } from '../definitions/types'
import ignore from 'ignore'
import { configStore } from '../config'
import { IFileTreeNode } from '../definitions/types'

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
  const rootPaths: string[] = getProjectRootPaths() ?? []
  const igInstance = ignore()
  const projectIgnoreList = configStore.get<string[]>('projectTreeIgnoreList') ?? []
  igInstance.add([...projectIgnoreList, ...customIgnoreList])

  const projectsFilesPromises = rootPaths.map(async rootPath => {
    const files = await getFileList(rootPath, rootPath, igInstance, allowExtList)
    return convertToFileTreeNode(rootPath, files)
  })

  return await Promise.all(projectsFilesPromises)
}
export async function getFlatFileList(
  customIgnoreList: string[] = [],
  allowExtList?: Set<string>,
): Promise<{ rootPath: string; files: string[] }[]> {
  const rootPaths: string[] = getProjectRootPaths() ?? []
  const igInstance = ignore()
  const projectIgnoreList = configStore.get<string[]>('projectTreeIgnoreList') ?? []
  igInstance.add([...projectIgnoreList, ...customIgnoreList])

  const projectsFilesPromises = rootPaths.map(async rootPath => {
    const files = await getFileList(rootPath, rootPath, igInstance, allowExtList)
    return { rootPath, files: files.map(file => file.path) }
  })

  return await Promise.all(projectsFilesPromises)
}
