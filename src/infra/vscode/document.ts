import {type TextEditor, type Uri, workspace} from 'vscode'

import {getRelativePathOrBasename} from '../system/file-utils'

/**
 * Gets the relative path or basename of the document in the given text editor.
 * @param editor The text editor containing the document.
 * @returns The relative path or basename of the document.
 */
export function getDocumentPath(editor: TextEditor): string {
  const resource = editor.document.uri
  const workspaceFolder = workspace.getWorkspaceFolder(resource)
  return getRelativePathOrBasename(resource.fsPath, workspaceFolder?.uri.fsPath)
}

/**
 * Gets the relative path or basename of the document in the given text editor.
 * @param editor The text editor containing the document.
 * @returns The relative path or basename of the document.
 */
export function getResourcePath(uri: Uri): string {
  const workspaceFolder = workspace.getWorkspaceFolder(uri)
  return getRelativePathOrBasename(uri.fsPath, workspaceFolder?.uri.fsPath)
}
