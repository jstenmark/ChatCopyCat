import * as fs from 'fs'
import ignore from 'ignore'
import * as path from 'path'
import * as vscode from 'vscode'
import { defaultIgnoreList } from './consts'

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
 * @returns An array of project root paths or undefined if no workspace folders exist.
 */
export function getProjectRootPaths(): string[] | undefined {
  return vscode.workspace.workspaceFolders?.map(f => f.uri.fsPath)
}

/**
 * Check if a path is a directory.
 * @param filePath - The file path.
 * @returns True if it's a directory, false otherwise.
 */
export async function isDirectory(filePath: string): Promise<boolean> {
  try {
    const stat = await fs.promises.stat(filePath)
    return stat.isDirectory()
  } catch (err) {
    return false
  }
}

/**
 * Get a list of files based on directory, ignoring patterns from gitignore files.
 * @param directory - The directory path.
 * @param originalRoot - The original root directory.
 * @param ig - Ignore instance.
 * @param ignoreList - List of patterns to ignore.
 * @returns A promise that resolves to an array of file paths.
 */
export async function getFileList(directory = __dirname, originalRoot = directory, ig = ignore(), ignoreList: string[] = defaultIgnoreList): Promise<string[]> {
  ig.add(ignoreList)
  const files = await fs.promises.readdir(directory)
  const fileList: string[] = []

  for (const file of files) {
    const fullPath = path.join(directory, file)
    const fullRelativePath = path.relative(originalRoot, fullPath)

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
