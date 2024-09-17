import * as vscode from 'vscode'

import {showQuickPickAction} from '../../adapters/ui/components/window-components'
import {showVersionBumpDialog} from '../../adapters/ui/dialog/bump-version-dialog'
import {
  handleIgnoreResetButton,
  handleSelectionResetButton,
} from '../../domain/services/definitions-utils'
import {type ClipboardManager,type ClipboardManager as TClipboardManager} from '../../infra/clipboard/clipboard-manager'
import {ConfigStore} from '../../infra/config/config-store'
import {executeCommand} from '../../infra/system/exec'
import {getProjectRootPaths} from '../../infra/system/file-utils'
import {container} from '../../inversify/inversify.config'
import {TYPES} from '../../inversify/types'
import {extName} from '../../shared/constants/consts'
import {copyDefinitions} from './definitions-command'
import {copyDefinitionsFromFiles} from './definitionsfromfiles-command'
import {getFileTree} from './filetree-command'
import {type GetSymbolReferencesCommand,type GetSymbolReferencesCommand as TGetSymbolReferencesCommand} from './references-command'
import {openSettings} from './settings-command'

export const openMenu = async () => {
  const getSymbolReferences = await container.getAsync<GetSymbolReferencesCommand>(TYPES.GetSymbolReferencesCommand)
  const clipboardManager = await container.getAsync<ClipboardManager>(TYPES.ClipboardManager)

  const picks = [
    {kind: vscode.QuickPickItemKind.Separator, label: 'Symbols and definitions'},
    {label: '$(copy) Copy Definitions', action: async () => getSymbolReferences.execute()},
    {label: '$(clippy) Copy references', action: async () => copyDefinitions()},
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

  ]

  if (ConfigStore.instance.get<boolean>('catDevMode')) {
    const devItems = [
      {kind: vscode.QuickPickItemKind.Separator, label: 'Development'},
      {
        label: '$(terminal-bash) yarn pkg',
        action: async () => {
          (await executeCommand(getProjectRootPaths()![0], 'yarn pkg')) &&
            (await vscode.commands.executeCommand('workbench.action.reloadWindow'))
        },
      },
      {
        label: '$(versions) Bump Version',
        action: async () => await showVersionBumpDialog()
      }
    ]
    picks.push(...devItems)
  }

  await showQuickPickAction(picks, {
    placeHolder: `${extName} Command Center`,
  })
}
