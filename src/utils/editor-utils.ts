import { TextEditor, window, workspace } from 'vscode'
import { log } from '../logging'
import { getRelativePathOrBasename } from './file-utils'
import { configStore } from '../config'
import * as vscode from 'vscode'
import { IContentSection, ILangOpts, validFileSchemes } from '../common'
import { getContentSection } from '../inquiry'

export let lastTrackedTextEditor: TextEditor | undefined

export async function focusLastTrackedEditor(): Promise<TextEditor | undefined> {
  if (!configStore.get('enableForceFocusLastTrackedEditor')) {
    return undefined
  }
  if (lastTrackedTextEditor) {
    await window.showTextDocument(lastTrackedTextEditor.document, {
      viewColumn: lastTrackedTextEditor.viewColumn,
      preserveFocus: false,
      selection: lastTrackedTextEditor.selection,
    })
    return lastTrackedTextEditor
  }
  return undefined
}

export async function getActiveEditor(): Promise<TextEditor | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100))
  const { activeTextEditor, visibleTextEditors } = window

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
  const activeTextEditor = await getActiveEditor()

  if (activeTextEditor) {
    return activeTextEditor
  }

  return focusLastTrackedEditor()
}

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

export const errorMessage = (error: unknown, defaultMessage?: string) => {
  return error instanceof Error
    ? `${defaultMessage ? defaultMessage : ''}${error.message}`
    : String(error)
}

export const errorTypeCoerce = (error: unknown, customErrorMessage?: string): Error => {
  if (error instanceof Error) {
    error.message = errorMessage(`${customErrorMessage}. ${error.message}`)
    return error
  }
  if (typeof error === 'string') {
    return new Error(`${error}. ${customErrorMessage}`)
  }
  return new Error(customErrorMessage)
}

/**
 * Generates content sections from the selections in a text editor.
 * If there are no selections, it uses the entire content of the editor.
 *
 * @param editor The text editor.
 * @param langOpts Language options for the editor.
 * @param relativePathOrBasename The relative path or basename of the file in the editor.
 * @returns An array of content sections.
 */

export function generateSelectionSections(
  editor: vscode.TextEditor,
  langOpts: ILangOpts,
): string[] {
  const relativePathOrBasename: string = getDocumentPath(editor)

  if (editor.selections.some(selection => !selection.isEmpty)) {
    return editor.selections
      .filter(selection => !selection.isEmpty)
      .map(selection => getContentSection(selection, editor, langOpts, relativePathOrBasename))
      .filter(section => section.selectionSection.length > 0)
      .map(section => section.selectionSection)
  } else {
    const { selectionSection }: IContentSection = getContentSection(
      undefined,
      editor,
      langOpts,
      relativePathOrBasename,
    )
    return [selectionSection]
  }
}
