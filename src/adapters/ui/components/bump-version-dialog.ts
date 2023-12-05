import {bumpVersion} from '../../../infra/dev/development'
import {showQuickPick} from './window-components'

export async function showVersionBumpDialog(): Promise<void> {
  const versionTypes = ['patch',
    'minor',
    'major']
  const selectedVersionType = await showQuickPick(versionTypes, {
    placeHolder: 'Select a version type to bump',
  })

  if (!selectedVersionType) {
    return undefined
  }

  await bumpVersion(selectedVersionType as unknown as 'patch' | 'minor' | 'major')
}