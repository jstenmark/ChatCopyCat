import * as vscode from 'vscode'

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
export function getFilePathOrFullPath(
  fileName: string | undefined,
  editor: vscode.TextEditor | undefined,
  getWorkspaceFolder: GetWorkspaceFolderFn,
): string | undefined {
  const workspaceFolder = getDocumentWorkspaceFolder(editor, getWorkspaceFolder)
  const filePath = workspaceFolder && fileName?.startsWith(workspaceFolder) ? extractWorkdirPath(fileName, workspaceFolder) : fileName || undefined
  return filePath
}

type GetWorkspaceFolderFn = (uri: vscode.Uri) => vscode.WorkspaceFolder | undefined

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
