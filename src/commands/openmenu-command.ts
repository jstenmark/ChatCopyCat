import * as vscode from 'vscode'
import { getFileTree, openSettings } from '../commands'
import { iconDark, iconLight } from '../common'
import { clipboardManager } from '../extension'
import { log } from '../logging'
import { copyDefinitions } from './definitions-command'

export const openMenu = async () => {
  const iconPath = {
    light: iconLight,
    dark: iconDark,
  }

  const picks = [
    {
      label: 'Reset Clipboard',
      action: async () => await clipboardManager.resetClipboard(),
      iconPath,
    },
    { label: 'Copy Definitions', action: async () => copyDefinitions(), iconPath },
    { label: 'Copy File Tree', action: async () => getFileTree(), iconPath },
    { label: 'Open Settings', action: async () => openSettings(), iconPath },
  ]

  const pick = await vscode.window.showQuickPick(picks, {
    placeHolder: 'ChatCopyCatCommandCenter',
  })

  log.debug('Show menu', pick?.label)

  if (pick?.action) {
    await pick.action()
  }
}
