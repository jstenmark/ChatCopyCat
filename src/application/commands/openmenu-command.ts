import * as vscode from 'vscode'
import {getFileTree} from './filetree-command'
import {copyDefinitions} from './definitions-command'
import {copyDefinitionsFromFiles} from './definitionsfromfiles-command'
import {
  handleSelectionResetButton,
  handleIgnoreResetButton,
} from '../../domain/services/definitions-utils'
import {executeCommand} from '../../infra/system/exec'
import {showQuickPick} from '../../adapters/ui/dialog/dialog-components'
import {openSettings} from './settings-command'
import {clipboardManager} from '../../infra/clipboard'
import {getProjectRootPaths} from '../../infra/system/file-utils'

export const openMenu = async () => {
  const picks = [
    {kind: vscode.QuickPickItemKind.Separator, label: 'Definitions'},
    {label: '$(copy) Copy Definitions', action: async () => copyDefinitions()},
    {
      label: '$(file-submodule) Copy Definitions from files',
      action: async () => copyDefinitionsFromFiles(),
    },
    {
      label: '      $(clear-all) Clear Definitions Selections',
      action: async () => await handleSelectionResetButton(),
    },
    {
      label: '      $(clear-all) Reset Definitions Ignore list',
      action: async () => await handleIgnoreResetButton(),
    },
    {kind: vscode.QuickPickItemKind.Separator, label: 'Files'},
    {label: '$(folder-library) Copy File Tree', action: async () => getFileTree()},
    {kind: vscode.QuickPickItemKind.Separator, label: 'Clipboard'},
    {
      label: '$(trash) Reset Clipboard',
      action: async () => await clipboardManager.resetClipboard(),
    },
    {kind: vscode.QuickPickItemKind.Separator, label: 'Configuration'},
    {label: '$(settings) Open Settings', action: async () => openSettings()},
    {kind: vscode.QuickPickItemKind.Separator, label: 'Development'},
    {
      label: '$(terminal-bash) yarn pkg',
      action: async () => {
        (await executeCommand(getProjectRootPaths()![0], 'yarn pkg')) &&
          (await vscode.commands.executeCommand('workbench.action.reloadWindow'))
      },
    },
  ]

  await showQuickPick(picks, {
    placeHolder: 'ChatCopyCat Command Center',
  })
}
