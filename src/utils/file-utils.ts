import * as vscode from 'vscode'
import * as fs from 'fs'
import ignore from 'ignore'
import * as path from 'path'

type GetWorkspaceFolderFn = (uri: vscode.Uri) => vscode.WorkspaceFolder | undefined

const defaultIgnoreList = ['out/**', 'docs/**', '.vscode/**', '.git/**', 'node_modules/**']

/**
 * Extracts the relative path to the project folder.
 * @param vscodeFilePath - The full file path.
 * @param projectFolder - The project's root folder name.
 * @returns The relative path to the project folder.
 */
export function extractWorkdirPath(vscodeFilePath: string, projectFolder: string): string {
  const projectFolderIndex = vscodeFilePath.indexOf(projectFolder)
  if (projectFolderIndex !== -1) {
    const pathRelativeToProject = vscodeFilePath.substring(projectFolderIndex + projectFolder.length)
    return pathRelativeToProject.startsWith('/') ? pathRelativeToProject.substring(1) : pathRelativeToProject
  } else {
    return vscodeFilePath
  }
}

export function getRelativePathOfFile(fileAbsolutePath: string, projectRoot: string): string | undefined {
  if (projectRoot) {
    return path.relative(projectRoot, fileAbsolutePath)
  }
  return undefined
}

export function getFilePathOrFullPath(
  fileName: string | undefined,
  editor: vscode.TextEditor | undefined,
  getWorkspaceFolder: GetWorkspaceFolderFn,
): string | undefined {
  const workspaceFolder = getDocumentWorkspaceFolder(editor, getWorkspaceFolder)
  const filePath = workspaceFolder && fileName?.startsWith(workspaceFolder) ? extractWorkdirPath(fileName, workspaceFolder) : fileName || undefined
  return filePath
}

/**
 * Get the workspace folder (project folder) or undefined if not found.
 * @returns The workspace folder path or undefined.
 */
export function getDocumentWorkspaceFolder(editor: vscode.TextEditor | undefined, getWorkspaceFolder: GetWorkspaceFolderFn): string | undefined {
  const document = editor?.document
  if (document) {
    const workspaceFolder = getWorkspaceFolder(document.uri)
    return workspaceFolder?.uri.fsPath
  }
  return undefined
}

export function getProjectRootPaths(): string[] | undefined {
  if (vscode.workspace.workspaceFolders) {
    return vscode.workspace.workspaceFolders.map(f => f.uri.fsPath)
  }
  return undefined
}

export async function isDirectory(filePath: string): Promise<boolean> {
  try {
    const stat = await fs.promises.stat(filePath)
    return stat.isDirectory()
  } catch (err) {
    return false
  }
}

export async function getFileList(directory = __dirname, originalRoot = directory, ig = ignore(), ignoreList: string[] = defaultIgnoreList) {
  const fileList: string[] = []

  // These are default patterns to ignore.
  ig.add(ignoreList)

  const files = await fs.promises.readdir(directory)

  for (const file of files) {
    const fullPath = path.join(directory, file)
    const fullRelativePath = path.relative(originalRoot, fullPath)

    // Skip if the file or directory is ignored
    if (ig.ignores(fullRelativePath)) {
      continue
    }

    const stat = await fs.promises.stat(fullPath)

    if (stat.isDirectory()) {
      fileList.push(...(await getFileList(fullPath, originalRoot, ig)))
    } else if (stat.isFile()) {
      if (fullPath.endsWith('.gitignore')) {
        const gitignoreContent = await fs.promises.readFile(fullPath, 'utf8')
        const gitignoreDir = path.dirname(fullPath)
        const patterns = parseGitignore(gitignoreContent, gitignoreDir)
        ig.add(patterns)
      }

      fileList.push(fullRelativePath)
    }
  }

  return fileList
}

/**
 * Parses a .gitignore content and returns an array of patterns.
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
