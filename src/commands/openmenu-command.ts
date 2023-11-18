import * as vscode from 'vscode'
import { getFileTree } from './filetree-command'
import { copyDefinitions } from './definitions-command'
import { openSettings } from './settings-command'
import { clipboardManager } from '../clipboard'
import { log } from '../logging'

export const openMenu = async () => {
  const picks = [
    {
      label: 'Reset Clipboard',
      action: async () => await clipboardManager.resetClipboard(),
    },
    { label: 'Copy Definitions', action: async () => copyDefinitions() },
    { label: 'Copy File Tree', action: async () => getFileTree() },
    { label: 'Open Settings', action: async () => openSettings() },
  ]

  const pick = await vscode.window.showQuickPick(picks, {
    placeHolder: 'ChatCopyCatCommandCenter',
  })

  log.debug('Show menu', pick?.label)

  if (pick?.action) {
    await pick.action()
  }
}
