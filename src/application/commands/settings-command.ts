import * as vscode from 'vscode'
import {
  createQuickPick,
  initQuickPick,
  showQuickPickAction,
  IQuickPickItemAction,
  inputBox,
  showQuickPickMany
} from '../../adapters/ui/components/window-components'
import {
  configStore,
  settingsByTypeObject,
  StateStore,
} from '../../infra/config'
import {Notify} from '../../infra/vscode/notification'
import {extName} from '../../shared/constants/consts'
import {Validator, arraysAreEqual} from '../../shared/utils/validate'
import {log} from '../../infra/logging/log-base'
import {IExtendedQuickPickItem, ISettingsItem, Properties, PropertyType} from '../../shared/types/types'

export const openSettings = async (): Promise<void> => {
  await configStore.onConfigReady()
  const settingsByType = settingsByTypeObject()
  const configurationProperties: Properties = configStore.getPkgJsonProps()
  for (const [key, value] of Object.entries(configurationProperties)) {
    settingsByType[value.type].push({
      label: key,
      settingKey: key,
      settingObject: value,
    })
  }

  const picks = Object.values(settingsByType).flat()
  const quickPickItems = sortAndCreateQuickPickItems(picks)
  const quickPick = createQuickPick<IExtendedQuickPickItem>(
    quickPickItems,
    [],
    `${extName} Settings`,
    'Setting to configure',
    false,
    StateStore.getState<string>('lastSelectedSettingsItem')
  )
  quickPick.onDidTriggerItemButton(async e => {
    if (e.button === resetConfigButton) {
      const setting = e.item.setting
      if (setting) {
        quickPick.dispose()
        await resetConfigButtonAction(setting.settingKey)
        await openSettings()
      }
    }
  })

  const result = await initQuickPick<IExtendedQuickPickItem>(quickPick, 'lastSelectedSettingsItem')

  if (!result || result.length === 0) {
    return undefined
  }
  const selectedPick = [...result][0]

  if (selectedPick?.setting) {
    const setting = selectedPick.setting
    const settingKey = setting.settingKey
    const settingType = setting.settingObject?.type
    const settingObject = setting.settingObject

    let result: boolean | undefined = undefined
    if (settingObject?.enum) {
      result = await handleSettingWithEnum(setting)
    } else {
      switch (settingType) {
        case 'boolean':
          result = await toggleBooleanSetting(settingKey)
          break
        case 'string':
          result = await editStringSetting(settingKey)
          break
        case 'number':
          result = await editNumberSetting(settingKey)
          break
        case 'array':
          result = await handleArraySetting(setting)
          break
        default:
          break
      }
    }
    log.debug('update result=' + result)
    if (result) {
      Notify.info(`Setting '${settingKey}' updated`, true, true)
      await openSettings()
    }
  }
}

function getIconForType(type: PropertyType | undefined): vscode.ThemeIcon | undefined {
  switch (type) {
    case 'boolean':
      return new vscode.ThemeIcon('symbol-boolean')
    case 'string':
      return new vscode.ThemeIcon('symbol-key')
    case 'array':
      return new vscode.ThemeIcon('array')
    case 'number':
      return new vscode.ThemeIcon('symbol-number')
    default:
      return undefined // If no specific icon is needed
  }
}

export function sortAndCreateQuickPickItems(
  settingsItems: ISettingsItem[],
): IExtendedQuickPickItem[] {
  settingsItems.sort((a, b) => {
    const aType = a.settingObject?.type
    const bType = b.settingObject?.type
    if (!aType || !bType) {
      return 0
    }
    return aType.localeCompare(bType)
  })

  let previousType: string | undefined = ''
  const sortedPicks: IExtendedQuickPickItem[] = []

  for (const item of settingsItems) {
    if (item.settingObject?.type !== previousType) {
      sortedPicks.push({
        label: `${item.settingObject?.type} settings`,
        kind: vscode.QuickPickItemKind.Separator,
      })
      previousType = item.settingObject?.type
    }

    const isBoolean = item.settingObject?.type === 'boolean'
    const booleanValue = isBoolean ? configStore.get<boolean>(item.settingKey) : null
    const booleanIcon = booleanValue ? '$(check)' : '$(x)'
    const enumIndicator = item.settingObject?.enum ? '$(symbol-enum)' : '    '

    sortedPicks.push({
      label: item.settingObject?.description ?? 'No description',
      detail: `${isBoolean ? booleanIcon : enumIndicator} ${item.label}`,
      iconPath: getIconForType(item.settingObject?.type),
      setting: item,
      buttons: [resetConfigButton],
    })
  }

  return sortedPicks
}

export async function toggleBooleanSetting(key: string) {
  const currentValue = configStore.get<boolean>(key)
  await configStore.update<boolean>(key, !currentValue)
  return true
}

export async function editStringSetting(key: string) {
  const currentValue = configStore.get<string>(key)
  const newValue = await inputBox({
    prompt: `Enter new value for '${key}'`,
    value: currentValue,
    validateInput: text => new Validator<string>(text)
      .warnIfEmpty('Empty strings could have unexpected behaviors, reset to defaults is preferred')
      .getInputBoxValidationMessage()

  })
  if (newValue !== undefined) {
    await configStore.update<string>(key, newValue)
  }
  return !!newValue
}

export async function handleArraySetting<T = unknown>(setting: ISettingsItem<T>) {
  const arrayValue: T[] = configStore.get<T[]>(setting.settingKey) ?? []
  const initialValue: T[] = [...arrayValue]
  const itemType = setting.settingObject?.items?.type
  log.debug('SETTINGSOBJECT=', setting.settingObject)
  const modifyArray = async () => {
    const arrayItems = arrayValue.map<ISpecialQuickPickItem>(item => ({
      label: String(item),
      picked: true,
    }))

    const result = await showQuickPickMany<ISpecialQuickPickItem>([{label: '  [Add New Item]', addNewItemFlag: true}, ...arrayItems], {
      canPickMany: true,
      placeHolder: 'Select items or add new',
      title: 'Array configurator. Deselect items to remove. Use the "Add"-option to add'
    })

    if (result?.find(item => 'addNewItemFlag' in item && item.addNewItemFlag)) {
      const newItem = await inputBox({
        prompt: 'Enter new item',
        title: `Configure ${setting.label}`,
        validateInput: text => {
          if (itemType === 'number') {
            return new Validator<string>(text)
              .isNumber()
              .getErrorsString()
          } else if (itemType === 'string') {
            return new Validator<string>(text)
              .isNotEmpty()
              .getErrorsString()
          }
          return null
        }

      })
      if (newItem !== undefined) {
        // Handle different types of array items
        if (itemType === 'number') {
          arrayValue.push(parseFloat(newItem) as T)
        } else {
          // Assume string if not number
          arrayValue.push(newItem as T)
        }
      }
    } else if (result) {
      return result.map(item => item.label as T)
    }
    return arrayValue
  }
  const updatedArray = await modifyArray()
  const isSameValues = arraysAreEqual<T>(initialValue, updatedArray)

  if (typeof updatedArray !== 'undefined' && !isSameValues) {
    await configStore.update<T[]>(setting.settingKey, updatedArray)
    return true
  }

  return false
}

export async function handleSettingWithEnum<T = unknown>(
  setting: ISettingsItem<T>,
): Promise<boolean | undefined> {
  if (setting.settingObject?.enum) {
    const currentValue = configStore.get<T>(setting.settingKey)
    const defaultValue = configStore.getDefault<T>(setting.settingKey)

    const enums = setting.settingObject.enum.map(item => {
      const isDefault = item === defaultValue
      const isSelected = item === currentValue
      return {
        label: `${isSelected ? '$(check)' : '   '} ${isDefault ? '$(pinned)' : '   '} ${item}`,
        value: item
      }
    })

    const selectedEnum = await showQuickPickAction<IQuickPickItemAction & {value: string}>(enums, {
      title: `Configure ${setting.settingKey}`,
       
      placeHolder: `Current: '${currentValue}'. Change '${setting.settingKey}'`,
    })

    if (selectedEnum) {
      await configStore.update<T>(setting.settingKey, selectedEnum.value as T)
      return true
    }
  }
  return undefined
}

export async function editNumberSetting(key: string) {
  const currentValue = configStore.get<number>(key)
  const newValue = await inputBox({
    title: `Configure ${key}`,
    prompt: `Enter new value for '${key}' (number)`,
    value: currentValue.toString(),
    validateInput: text => new Validator<string>(text)
      .isNumber()
      .getInputBoxValidationMessage()
  })
  if (newValue !== undefined) {
    await configStore.update<number>(key, parseFloat(newValue))
  }
  return !!newValue
}

export async function resetConfigButtonAction(key: string) {
  await configStore.reset(key)
  Notify.info(`Workspace config "${key}" reset`, true, true)
}

export const resetConfigButton: {
  action?: (key: string) => Promise<void>
} & vscode.QuickInputButton = {
  iconPath: new vscode.ThemeIcon('sync-ignored'),
  tooltip: 'Reset this setting to default',
  action: async (key: string) => await resetConfigButtonAction(key),
}
export interface ISpecialQuickPickItem extends vscode.QuickPickItem {
  label: string
  picked?: boolean
  addNewItemFlag?: boolean
}
