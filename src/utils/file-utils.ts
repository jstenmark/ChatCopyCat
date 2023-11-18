import * as fs from 'fs'
import ignore, { Ignore } from 'ignore'
import * as path from 'path'
import * as vscode from 'vscode'
import { log } from '../logging'
import { configStore } from '../config'

export function getRelativePathOrBasename(fileFsPath: string, workspaceFsPath?: string): string {
  if (workspaceFsPath) {
    const projectFolderIndex = fileFsPath.indexOf(workspaceFsPath)
    const relativePath = path.relative(workspaceFsPath, fileFsPath)

    if (!relativePath.startsWith('..') || projectFolderIndex !== -1) {
      return relativePath.replace(/\\/g, '/').replace(/^\/+/g, '')
    }
  }
  return path.basename(fileFsPath)
}

/**
 * Get an array of project root paths.
 * @returns getDiagnosticsSectionAn array of project root paths or undefined if no workspace folders exist.
 */
export function getProjectRootPaths(): string[] | undefined {
  return vscode.workspace.workspaceFolders?.map(f => f.uri.fsPath)
}
/**
 * Parse a .gitignore content and return an array of patterns.
 * @param gitignoreContent - The content of the .gitignore file.
 * @param basePath - The directory path of the .gitignore file.
 * @returns An array of patterns to be ignored.
 */
function parseGitignore(gitignoreContent: string, basePath: string): string[] {
  return gitignoreContent
    .split(/\n|\r/)
    .filter(line => !line.startsWith('#') && line.trim() !== '')
    .map(line => path.join(basePath, line))
}

export const isFullFileSelected = (editor: vscode.TextEditor): boolean => {
  return (
    editor.selection.start.isEqual(new vscode.Position(0, 0)) &&
    editor.selection.end.isEqual(editor.document.lineAt(editor.document.lineCount - 1).range.end)
  )
}

/**
 * Get diagnostics (problems) for a given document or a specific selection range.
 * @param {vscode.TextDocument} document The VSCode document to retrieve diagnostics from.
 * @param {vscode.Range} selection (Optional) The selection range to filter diagnostics. If not provided, diagnostics for the entire document will be returned.
 * @returns An array of diagnostic objects.
 */
export function getAllDiagnostics(
  document: vscode.TextDocument,
  selection: vscode.Selection | undefined,
): vscode.Diagnostic[] {
  if (typeof vscode.Selection !== 'undefined') {
    return vscode.languages.getDiagnostics(document.uri).filter(({ range }) => {
      return selection?.intersection(range)
    })
  } else {
    return vscode.languages.getDiagnostics(document.uri)
  }
}

export function watchForExtensionChanges(): vscode.Disposable {
  const watchFolder = path.resolve(__dirname, '../../../../watchdir/done.txt')
  log.debug(`Watching ${watchFolder} for changes.`)

  const watcher = (curr: fs.Stats, prev: fs.Stats) => {
    if (curr.mtimeMs !== prev.mtimeMs) {
      log.info(`Detected change in ${watchFolder}, reloading window.`)
      vscode.commands.executeCommand('chatcopycat.reloadWindow').then(
        () => log.info('Window reloaded successfully.'),
        (err: Error) => log.error('Failed to reload window: ' + err.message),
      )
    }
  }

  fs.watchFile(watchFolder, { interval: 3000 }, watcher)

  return new vscode.Disposable(() => fs.unwatchFile(watchFolder, watcher))
}

export const getUriFromFileTree = async (
  customIgnoreList: string[] = [],
  allowExtList?: Set<string>,
): Promise<IFileTreeNode[]> => {
  const rootPaths: string[] = getProjectRootPaths() ?? []
  const igInstance = ignore()
  const projectIgnoreList = configStore.get<string[]>('projectTreeIgnoreList') ?? []
  igInstance.add([...projectIgnoreList, ...customIgnoreList])
  const projectsFilesPromises = rootPaths.map(async rootPath => {
    const files = await getFileList(rootPath, rootPath, igInstance, allowExtList)
    const treeNode = convertToFileTreeNode(rootPath, files)

    return treeNode
  })

  const projectsFiles = await Promise.all(projectsFilesPromises)
  log.debug('PF', projectsFiles, { truncate: 0 })
  return projectsFiles
}

export async function getFileList(
  directory: string,
  originalRoot: string,
  ig: Ignore,
  allowExtList?: Set<string>,
): Promise<IFileListItem[]> {
  const files = await fs.promises.readdir(directory)
  const fileList: IFileListItem[] = []

  for (const file of files) {
    const fullPath = path.join(directory, file)
    const fullRelativePath = path.relative(originalRoot, fullPath)

    if (ig.ignores(fullRelativePath)) {
      continue
    }

    const stat = await fs.promises.stat(fullPath)
    const isFolder = stat.isDirectory()

    if (isFolder) {
      fileList.push({ path: fullRelativePath, isFolder: true, rootPath: originalRoot })
      if (!ig.ignores(fullRelativePath + '/')) {
        fileList.push(...(await getFileList(fullPath, originalRoot, ig, allowExtList)))
      }
    } else if (stat.isFile()) {
      const fileExt = path.extname(file)
      if (fullPath.endsWith('.gitignore')) {
        const gitignoreContent = await fs.promises.readFile(fullPath, 'utf8')
        const gitignoreDir = path.dirname(fullPath)
        const patterns = parseGitignore(gitignoreContent, gitignoreDir) // TODO: fix the fullpath ignore
        ig.add(patterns) // Todo: config this
      } else if (!allowExtList || allowExtList.has(fileExt)) {
        fileList.push({ path: fullRelativePath, isFolder: false, rootPath: originalRoot })
      }
    }
  }
  return fileList
}
export interface IFileListItem {
  path: string
  isFolder: boolean
  rootPath: string
}
interface IFileTreeNode {
  path: string
  isFolder: boolean
  children?: IFileTreeNode[]
}

function convertToFileTreeNode(rootPath: string, fileList: IFileListItem[]): IFileTreeNode {
  const rootNode: IFileTreeNode = {
    path: rootPath,
    isFolder: true,
    children: [],
  }

  const pathToNodeMap = new Map<string, IFileTreeNode>()
  pathToNodeMap.set(rootPath, rootNode)

  for (const fileItem of fileList) {
    const fullItemPath = path.join(rootPath, fileItem.path) // Full path
    const normalizedItemPath = path.normalize(fullItemPath) // Normalize the full path
    const relativeItemPath = path.relative(rootPath, normalizedItemPath) // Convert to relative path

    const currentNode: IFileTreeNode = {
      path: relativeItemPath,
      isFolder: fileItem.isFolder,
      children: fileItem.isFolder ? [] : undefined,
    }

    let parentPath: string
    if (fileItem.isFolder && relativeItemPath !== '.') {
      // For folders (except the root), the parent is one level up
      parentPath = path.relative(rootPath, path.dirname(normalizedItemPath))
    } else if (!fileItem.isFolder) {
      // For files, the parent is the folder they are in
      parentPath = path.relative(rootPath, path.dirname(normalizedItemPath))
    } else {
      // Root folder
      parentPath = '.'
    }

    if (!pathToNodeMap.has(parentPath)) {
      pathToNodeMap.set(parentPath, {
        path: parentPath === '' ? '.' : parentPath,
        isFolder: true,
        children: [],
      })
    }

    const parentNode = pathToNodeMap.get(parentPath)
    if (parentNode && !parentNode.children?.find(child => child.path === currentNode.path)) {
      parentNode.children?.push(currentNode)
    }

    pathToNodeMap.set(relativeItemPath, currentNode)
  }

  pathToNodeMap.forEach((node, _path) => {
    if (_path !== '.') {
      const parentPath = path.relative(rootPath, path.dirname(path.join(rootPath, _path)))
      const parentNode = pathToNodeMap.get(parentPath)
      if (parentNode && !parentNode.children?.includes(node)) {
        parentNode.children?.push(node)
      }
    }
  })
  return rootNode
}

export async function showFolderTreeQuickPick(fileTree: IFileTreeNode[]): Promise<IFileListItem[]> {
  const quickPickItems = fileTree.flatMap(node => formatFileTreeNode(node))
  const selectedItems = (await vscode.window.showQuickPick(quickPickItems, {
    canPickMany: true,
    placeHolder: 'Select files or folders to copy definitions from',
  })) as IQuickPickFileTreeItem[] // Cast to correct type

  if (!selectedItems) {
    return []
  }

  const selectedFileTree: IFileListItem[] = selectedItems.map(item => ({
    path: item.filePath,
    isFolder: item.isFolder,
    rootPath: item.rootPath,
  }))

  return selectedFileTree
}
export interface IQuickPickFileTreeItem extends vscode.QuickPickItem {
  filePath: string
  rootPath: string
  isFolder: boolean
}
function formatFileTreeNode(node: IFileTreeNode, indent = 0): vscode.QuickPickItem[] {
  const items: vscode.QuickPickItem[] = []
  const prefix = '  '.repeat(indent * 2) // Indentation for sub-items

  const label = node.isFolder
    ? `${prefix} $(folder) ${path.basename(node.path)}`
    : `${prefix} $(file) ${path.basename(node.path)}`

  if (node.isFolder) {
    items.push({
      label: node.path,
      description: '$(indent)'.repeat(indent),
      kind: vscode.QuickPickItemKind.Separator,
    })
    items.push({ label })
  } else {
    items.push({ label, detail: node.path })
  }

  if (node.children) {
    node.children.forEach(child => {
      items.push(...formatFileTreeNode(child, indent + 1))
    })
  }

  return items
}
