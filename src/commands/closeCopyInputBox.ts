import { onDidCloseInput } from '../inquiry/inquiryUtils'
import { log } from '../utils/vsc-utils'
import * as vscode from 'vscode'

/**
 * Closes the currently active input box and any associated quick picks in the VS Code editor.
 */

export const closeCopyInputBox = async (): Promise<void> => {
  log('Closing input')
  onDidCloseInput.fire()
}

// export const closeCopyInputBox = async (): Promise<void> => {
//   log('Closing input')
//   await vscode.commands.executeCommand('setContext', 'copyInputBoxOpen', false)
//   await vscode.commands.executeCommand('workbench.action.closeQuickOpen')
// }
