
import * as vscode from 'vscode'
import {showQuickPick} from '../components/window-components'


export interface IAppendOrCopyOption extends vscode.QuickPickItem {
  action: 'append' | 'copy'
}

export async function showAppendOrCopyDialog(): Promise<IAppendOrCopyOption['action'] | undefined> {
  const options: IAppendOrCopyOption[] = [
    {label: 'Append to Clipboard', action: 'append'},
    {label: 'Copy to Clipboard', action: 'copy'}
  ]

  const select = await showQuickPick<IAppendOrCopyOption>(options, {
    placeHolder: 'Choose an action',
    matchOnDescription: true
  })

  return select?.action
}
