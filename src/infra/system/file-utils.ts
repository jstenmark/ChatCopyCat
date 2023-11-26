import * as fs from 'fs'
import * as vscode from 'vscode'
import * as path from 'path'
import {log} from '../logging/log-base'

/**
 * Check if a path is a directory or file and execute the corresponding callback.
 * @param filePath - The file path to check.
 * @param onDirectory - Callback to execute if the path is a directory.
 * @param onFile - Callback to execute if the path is a file.
 */
export async function isDirectoryOrFile<T>(
  filePath: string,
  onDirectory: () => Promise<T>,
  onFile: () => Promise<T>,
): Promise<T | void> {
  try {
    const stat = await fs.promises.stat(filePath)
    if (stat.isDirectory()) {
      return await onDirectory()
    } else if (stat.isFile()) {
      return await onFile()
    }
  } catch (err) {
    log.error('Error checking path type', err)
  }
}

/**
 * Get an array of project root paths.
 * @returns array of project root paths or undefined if no workspace folders exist.
 */
export function getProjectRootPaths(): string[] | undefined {
  return vscode.workspace.workspaceFolders?.map(f => f.uri.fsPath)
}

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
