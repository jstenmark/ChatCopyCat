import * as vscode from 'vscode'
import { DialogComponent } from '../ui/DialogComponentManager'

export function isQuickPick(component: DialogComponent): component is vscode.QuickPick<vscode.QuickPickItem> {
  return 'activeItems' in component
}

export function isInputBox(component: DialogComponent): component is vscode.InputBox {
  return 'value' in component
}
