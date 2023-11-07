import * as fs from 'fs'
import ignore from 'ignore'
import * as path from 'path'
import * as vscode from 'vscode'
import { defaultIgnoreList } from '../common/consts'
import { log } from '../logging/log-manager'

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
 * Get a list of files based on directory, ignoring patterns from gitignore files.
 * @param directory - The directory path.
 * @param originalRoot - The original root directory.
 * @param ig - Ignore instance.
 * @param ignoreList - List of patterns to ignore.
 * @returns A promise that resolves to an array of file paths.
 */
export async function getFileList(
  directory = __dirname,
  originalRoot = directory,
  ig = ignore(),
  ignoreList: string[] = defaultIgnoreList,
): Promise<string[]> {
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
  selection: vscode.Selection,
): vscode.Diagnostic[] {
  return vscode.languages.getDiagnostics(document.uri).filter(({ range }) => {
    return selection.intersection(range)
  })
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
