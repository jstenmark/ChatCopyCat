import * as vscode from 'vscode'
import { log } from '../logging'
import { getRelativePathOrBasename } from './file-utils'
import { configStore } from '../extension'
let lastTrackedTextEditor: vscode.TextEditor | undefined

const validFileSchemes = new Set(['file', 'untitled'])

export async function focusLastTrackedEditor(): Promise<vscode.TextEditor | undefined> {
  if (!configStore.get('enableForceFocusLastTrackedEditor')) {
    return undefined
  }
  if (lastTrackedTextEditor) {
    await vscode.window.showTextDocument(lastTrackedTextEditor.document, {
      // Preserve focus
      viewColumn: lastTrackedTextEditor.viewColumn,
      preserveFocus: false,
      // Try to preserve selection
      selection: lastTrackedTextEditor.selection,
    })
    return lastTrackedTextEditor
  }
  return undefined
}

export function getActiveEditor(): vscode.TextEditor | undefined {
  const { activeTextEditor, visibleTextEditors } = vscode.window

  if (!visibleTextEditors.length) {
    log.warn('No visible texteditor', { getActiveEditor, visibleTextEditors }, { truncate: 0 })
    return (lastTrackedTextEditor = undefined)
  }

  if (activeTextEditor && validFileSchemes.has(activeTextEditor.document.uri.scheme)) {
    lastTrackedTextEditor = activeTextEditor
  }

  return lastTrackedTextEditor
}

export async function acitveEditorOrFocurLast() {
  const activeTextEditor: vscode.TextEditor | undefined =
    getActiveEditor() ?? (await focusLastTrackedEditor())

  if (vscode.window.state?.focused === false || !activeTextEditor) {
    log.info('Cannot execute copy', {
      focus: vscode.window.state?.focused,
      editor: !!activeTextEditor,
    })
    return undefined
  }

  return activeTextEditor
}

/**
 * Gets the relative path or basename of the document in the given text editor.
 * @param editor The text editor containing the document.
 * @returns The relative path or basename of the document.
 */
export function getDocumentPath(editor: vscode.TextEditor): string {
  const resource = editor.document.uri
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(resource)
  return getRelativePathOrBasename(resource.fsPath, workspaceFolder?.uri.fsPath)
}

// Where getRelativePathOrBasename is your existing function.
