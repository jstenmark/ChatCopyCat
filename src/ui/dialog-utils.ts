import * as vscode from 'vscode'

export type DialogComponent = vscode.QuickPick<vscode.QuickPickItem> | vscode.InputBox

export const isQuickPick = (component: DialogComponent): component is vscode.QuickPick<vscode.QuickPickItem> => 'activeItems' in component
export const isInputBox = (component: DialogComponent): component is vscode.InputBox => 'value' in component

/**
 * Dispose of all the given disposables.
 * @param disposables An array of disposables to be disposed.
 */
export function disposeAllEventHandlers(disposables: vscode.Disposable[]): void {
  disposables.forEach(d => d.dispose())
  disposables.length = 0
}