import * as vscode from 'vscode'
import { iconLightChill, iconDarkChill } from '../common'
import { log } from '../logging'
import { configStore } from '../extension'

export const openSettings = async () => {
  const iconPath = {
    light: iconLightChill,
    dark: iconDarkChill,
  }

  const bool_settings = [
    'enableClipboardResetCombo',
    'inquiryType',
    'enableDiagnostics',
    'enableCommentRemoval',
    'convertSpacesToTabs',
    'enableForceFocusLastTrackedEditor',
    'showLanguageInSnippets',
  ]

  const text_settings = [
    'customDiagnosticsMessage',
    'defaultMessageTruncate',
    'defaultDataTruncate',
  ]

  const picks_bool = bool_settings.map(setting => {
    const current = configStore.get(setting)
    const toggleLabel = `${current ? 'Disable' : 'Enable'}`
    return {
      label: `[ ${setting} ]`,
      featureKey: setting,
      iconPath,
      currentSetting: current,
      description: `Click to ${toggleLabel}`,
      isTextSetting: false,
    }
  })

  const picks_text = text_settings.map(setting => {
    return {
      label: `[ ${setting} ]`,
      featureKey: setting,
      iconPath,
      currentSetting: undefined,
      isTextSetting: true,
      description: `Click to edit`,
    }
  })

  const allPicks = [...picks_bool, ...picks_text]

  const pick = await vscode.window.showQuickPick(allPicks, {
    placeHolder: 'ChatCopyCat Quick Settings',
  })

  log.debug('Show menu', pick?.label)

  if (pick?.featureKey) {
    if (pick.isTextSetting) {
      const result = await vscode.window.showInputBox({
        prompt: `Enter new value for ${pick.featureKey}`,
        value: configStore.get<string>(pick.featureKey),
        ignoreFocusOut: true,
      })

      if (result !== undefined) {
        await configStore.update(pick.featureKey, result)
        log.debug('Updated config for', { featureKey: pick.featureKey, value: result })
      }
    } else {
      await configStore.update(pick.featureKey, !pick.currentSetting)
      log.debug('Toggled config for', { featureKey: pick.featureKey })
    }
  }
}
