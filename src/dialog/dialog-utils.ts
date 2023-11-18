import * as vscode from 'vscode'
import { inputBoxManager, quickPickManager } from './dialog-manager'
import { log } from '../logging'
import { DialogComponent } from '../common'

export const isQuickPick = (
  component: DialogComponent,
): component is vscode.QuickPick<vscode.QuickPickItem> => 'activeItems' in component
export const isInputBox = (component: DialogComponent): component is vscode.InputBox =>
  'value' in component

/**
 * Dispose of all the given disposables.
 * @param disposables An array of disposables to be disposed.
 */
export function disposeAllEventHandlers(disposables: vscode.Disposable[]): void {
  disposables.forEach(d => d.dispose() as void)
  disposables.length = 0
}

// eslint-disable-next-line @typescript-eslint/require-await
export const closeDialog = async (): Promise<void> => {
  quickPickManager.close()
  inputBoxManager.close()
}

export function handleActiveDialogs(): boolean {
  if (quickPickManager.isActive()) {
    quickPickManager.close()
    log.debug('closing quickPick')
    return true
  } else if (inputBoxManager.isActive()) {
    inputBoxManager.close()
    log.debug('closing inputBox')
    return true
  }
  return false
}
