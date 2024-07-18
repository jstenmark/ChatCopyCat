import * as vscode from 'vscode'
import {log} from '../../infra/logging/log-base'
import {validFileSchemes} from '../../shared/constants/consts'
import {ILangOpts} from '../../shared/types/types'
import {configStore} from '../config'


export let lastTrackedTextEditor: vscode.TextEditor | undefined

export async function focusLastTrackedEditor(): Promise<vscode.TextEditor | undefined> {
  if (!configStore.get<boolean>('enableForceFocusLastTrackedEditor')) {
    return undefined
  }
  if (lastTrackedTextEditor) {
    await vscode.window.showTextDocument(lastTrackedTextEditor.document, {
      viewColumn: lastTrackedTextEditor.viewColumn,
      preserveFocus: false,
      selection: lastTrackedTextEditor.selection,
    })
    return lastTrackedTextEditor
  }
  return undefined
}

export async function getActiveEditor(): Promise<vscode.TextEditor | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100))
  const {activeTextEditor, visibleTextEditors} = vscode.window

  if (!visibleTextEditors.length) {
    log.warn('No visible text-editor', {getActiveEditor, visibleTextEditors}, {truncate: 0})
    return (lastTrackedTextEditor = undefined)
  }

  if (activeTextEditor && validFileSchemes.has(activeTextEditor.document.uri.scheme)) {
    lastTrackedTextEditor = activeTextEditor
  }

  return lastTrackedTextEditor
}

export async function activeEditorOrFocusLast() {
  const activeTextEditor = await getActiveEditor()

  if (activeTextEditor) {
    return activeTextEditor
  }

  return focusLastTrackedEditor()
}

export const getLangOpts = (editor: vscode.TextEditor): ILangOpts => {
  const {tabSize: _tabSize, insertSpaces: _insertSpaces}: vscode.TextEditorOptions = editor.options
  const {languageId: language}: vscode.TextDocument = editor.document

  const tabSize: number = typeof _tabSize === 'number' ? _tabSize : 2
  const insertSpaces = !!_insertSpaces

  return {tabSize, language, insertSpaces}
}

