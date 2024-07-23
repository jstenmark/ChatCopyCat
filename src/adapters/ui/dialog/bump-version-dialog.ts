import type * as vscode from 'vscode'

import {bumpVersion} from '../../../infra/dev/development'
import {Notify} from '../../../infra/vscode/notification'
import {showQuickPick} from '../components/window-components'

export enum BumpTypes {
  MAJOR = 'major',
  MINOR = 'minor',
  PATCH = 'patch'
}

export interface IVersionBumpType extends vscode.QuickPickItem {
  description: BumpTypes;
}

export async function showVersionBumpDialog(): Promise<void> {
  const versionTypes: IVersionBumpType[] = [
    {
      label: '$(tag)   ',
      detail: 'Small fixes or changes',
      description: BumpTypes.PATCH
    },
    {
      label: '$(diff-added)   ',
      detail: 'Backward-compatible features',
      description: BumpTypes.MINOR
    },
    {
      label: '$(diff-removed)   ',
      detail: 'Significant changes, possibly breaking',
      description: BumpTypes.MAJOR,

    }
  ]

  const selectedVersionType = await showQuickPick<IVersionBumpType>(versionTypes, {
    placeHolder: 'Select a version type to bump',
    matchOnDescription: true,

  })

  if (!selectedVersionType?.description) {
    return
  }

  if (Object.values(BumpTypes).includes(selectedVersionType.description)) {
    await bumpVersion(selectedVersionType.description)
  } else {
    Notify.error('Invalid version type selected.', true, true)
  }
}
