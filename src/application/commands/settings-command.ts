import * as vscode from 'vscode'
import {
  createQuickPick,
  initQuickPick,
  showQuickPick,
  IQuickPickItemAction
} from '../../adapters/ui/components/window-components'
import {
  configStore,
  settingsByTypeObject,
  Properties,
  IExtendedQuickPickItem,
  PropertyType,
  ISettingsItem,
  ISpecialQuickPickItem,
} from '../../infra/config'
import {Notify} from '../../infra/vscode/notification'
import {extName} from '../../shared/constants/consts'

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

  const result = await initQuickPick<IExtendedQuickPickItem>(quickPick)

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
  await configStore.update(key, !currentValue)
  return true
}

export async function editStringSetting(key: string) {
  const currentValue = configStore.get<string>(key)
  const newValue = await vscode.window.showInputBox({
    prompt: `Enter new value for '${key}'`,
    value: currentValue,
  })
  if (newValue !== undefined) {
    await configStore.update(key, newValue)
  }
  return !!newValue
}

export async function handleArraySetting<T = unknown>(setting: ISettingsItem<T>) {
  const arrayValue: T[] = configStore.get<T[]>(setting.settingKey) ?? []
  const initialValue: T[] = configStore.get<T[]>(setting.settingKey) ?? []
  const itemType = setting.settingObject?.items?.itemType

  const modifyArray = async () => {
    const arrayItems: (vscode.QuickPickItem | ISpecialQuickPickItem)[] = arrayValue.map(item => ({
      label: String(item),
      picked: true,
    }))
    const addNewItem: ISpecialQuickPickItem = {label: 'Add New Item...', special: true}

    const result = await vscode.window.showQuickPick([addNewItem, ...arrayItems], {
      canPickMany: true,
      placeHolder: 'Select items or add new',
    })

    if (result?.find(item => 'special' in item && item.special)) {
      const newItem = await vscode.window.showInputBox({prompt: 'Enter new item', title: `Configure ${setting.label}`})
      if (newItem !== undefined) {
        // Handle different types of array items
        if (itemType === 'number') {
          if (!isNaN(parseFloat(newItem))) {
            arrayValue.push(parseFloat(newItem) as unknown as T)
          } else {
            Notify.error(`Couldn't update '${setting.settingKey}', enter a valid number`, true, true)
            return undefined
          }
        } else {
          // Assume string if not number
          arrayValue.push(newItem as unknown as T)
        }
      }
    } else if (result) {
      return result.map(item => item.label as unknown as T)
    }
    return arrayValue
  }
  const updatedArray = await modifyArray()
  if (typeof updatedArray !== 'undefined') {
    await configStore.update(setting.settingKey, updatedArray)
  }
  return !!updatedArray && initialValue !== arrayValue
}

export async function handleSettingWithEnum<T = unknown>(
  setting: ISettingsItem<T>,
): Promise<boolean | undefined> {
  if (setting.settingObject?.enum) {
    const currentValue = configStore.get<T>(setting.settingKey)
    const defaultValue = configStore.getDefault<T>(setting.settingKey)

    // Array of IQuickPickItemAction objects
    const enums = setting.settingObject.enum.map(item => {
      const isDefault = item === defaultValue
      const isSelected = item === currentValue
      return {
        label: `${isSelected ? '$(check)' : '   '} ${isDefault ? '$(pinned)' : '   '} ${item}`,
      }
    })

    const selectedEnum = await showQuickPick<IQuickPickItemAction>(enums, {
      title: `Configure ${setting.label}`,
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      placeHolder: `Current: '${currentValue}'. Change '${setting.settingKey}'`,
    })

    if (selectedEnum) {
      const cleanedValue = selectedEnum.label.replace(/ \$\([a-z-]+\)/g, '').trim()
      await configStore.update(setting.settingKey, cleanedValue as unknown as T) // Cast as T if necessary
      return true
    }
  }
  return undefined
}

export async function editNumberSetting(key: string) {
  const currentValue = configStore.get<number>(key)
  const newValue = await vscode.window.showInputBox({
    title: `Configure ${key}`,
    prompt: `Enter new value for '${key}' (number)`,
    value: currentValue.toString(),
    validateInput: text => (isNaN(parseFloat(text)) ? 'Please enter a valid number' : null),
  })
  if (newValue !== undefined) {
    await configStore.update(key, parseFloat(newValue))
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
