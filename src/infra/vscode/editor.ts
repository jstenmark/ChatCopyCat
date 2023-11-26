
import * as vscode from 'vscode'
import {validFileSchemes} from '../../shared/constants/consts'
import {configStore} from '../config'
import {log} from '../../infra/logging/log-base'

export let lastTrackedTextEditor: vscode.TextEditor | undefined

export async function focusLastTrackedEditor(): Promise<vscode.TextEditor | undefined> {
  if (!configStore.get('enableForceFocusLastTrackedEditor')) {
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
    log.warn('No visible texteditor', {getActiveEditor, visibleTextEditors}, {truncate: 0})
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

