/* eslint-disable @typescript-eslint/no-unused-vars */
import * as vscode from 'vscode'
import { iconLightChill, iconDarkChill } from '../common'
import { configStore } from '../config'
import { IProperty, PropertyType } from '../config/config-utils'
import { log } from '../logging'

export const openSettings = async (): Promise<void> => {
  await configStore.onConfigReady()
  const settingsByType: Record<PropertyType, IQuickPickItem[]> = {
    boolean: [] as IQuickPickItem[],
    string: [] as IQuickPickItem[],
    enum: [] as IQuickPickItem[],
    array: [] as IQuickPickItem[],
    text: [] as IQuickPickItem[],
  }
  const configurationProperties: Properties = configStore.getPkgJsonProps()
  for (const [_key, _value] of Object.entries(configurationProperties)) {
    const key: string = _key
    const value: IProperty = _value
    const settingType = value.type
    settingsByType[settingType]?.push({
      label: `${key} - ${settingType}`,
      settingKey: key,
      settingDetails: value,
    })
  }
  const picks = ([] as IQuickPickItem[]).concat(...Object.values(settingsByType)).map(setting => ({
    label: setting.label,
    detail: setting.settingDetails?.description,
    setting,
    iconPath: { dark: iconDarkChill, light: iconLightChill },
  }))

  picks.sort((a, b) => {
    const aType: PropertyType | undefined = a.setting.settingDetails?.type
    const bType: PropertyType | undefined = b.setting.settingDetails?.type
    if (!aType) {
      return 0
    } else if (!bType) {
      return 0
    }

    if (aType < bType) {
      return -1
    }
    if (aType > bType) {
      return 1
    }
    return 0
  })

  const sortedPicks = []
  let previousType: string | undefined = ''
  for (const pick of picks) {
    if (pick.setting.settingDetails?.type !== previousType) {
      log.debug('QuickPickItem', pick.setting)
      sortedPicks.push({
        label: 'Meow!',
        description: '',
        alwaysShow: true,
        enabled: false,
        kind: vscode.QuickPickItemKind.Separator,
        setting: undefined,
      })
    }
    sortedPicks.push(pick)
    previousType = pick.setting?.settingDetails?.type
  }

  const pick = await vscode.window.showQuickPick(sortedPicks, {
    placeHolder: 'ChatCopyCat Settings',
  })

  if (pick?.label && pick?.setting) {
    const setting = pick.setting
    const settingKey = setting.settingKey
    const settingType = setting.settingDetails?.type

    switch (settingType) {
      case 'boolean':
        await toggleBooleanSetting(settingKey)
        break
      case 'string':
        await editStringSetting(settingKey)
        break
      case 'enum':
        await chooseEnumSetting(settingKey, setting.settingDetails)
        break
      case 'array':
        await handleArraySetting(setting)
        break
      default:
        break
    }
  }
}

async function toggleBooleanSetting(key: string) {
  const currentValue = configStore.get<boolean>(key)
  await configStore.update(key, !currentValue)
  await vscode.window.showInformationMessage(`Setting '${key}' updated to ${!currentValue}`)
}

async function editStringSetting(key: string) {
  const currentValue = configStore.get<string>(key)
  const newValue = await vscode.window.showInputBox({
    prompt: `Enter new value for '${key}'`,
    value: currentValue,
  })
  if (newValue !== undefined) {
    await configStore.update(key, newValue)
    await vscode.window.showInformationMessage(`Setting '${key}' updated`)
  }
}

async function chooseEnumSetting(key: string, property: IProperty | undefined) {
  if (property?.enum) {
    const newValue = await vscode.window.showQuickPick(property.enum, {
      placeHolder: `Select value for '${key}'`,
    })
    if (newValue) {
      await configStore.update(key, newValue)
      await vscode.window.showInformationMessage(`Setting '${key}' updated`)
    }
  }
}

async function handleArraySetting(setting: IQuickPickItem) {
  const arrayValue: string[] = configStore.get<string[]>(setting.settingKey) ?? []
  const modifyArray = async () => {
    const arrayItems: (vscode.QuickPickItem | ISpecialQuickPickItem)[] = arrayValue.map(item => ({
      label: item,
      picked: true,
    }))
    const addNewItem: ISpecialQuickPickItem = { label: 'Add New Item...', special: true }

    const result = await vscode.window.showQuickPick([addNewItem, ...arrayItems], {
      canPickMany: true,
      placeHolder: 'Select items or add new',
    })

    if (result?.find(item => 'special' in item && item.special)) {
      const newItem = await vscode.window.showInputBox({ prompt: 'Enter new item' })
      if (newItem) {
        arrayValue.push(newItem)
      }
    } else {
      return (
        result?.filter(item => !('special' in item && item.special)).map(item => item.label) ?? []
      )
    }

    return arrayValue
  }

  const updatedArray = await modifyArray()
  await configStore.update(setting.settingKey, updatedArray)
}

// TODO: import from utils
interface IQuickPickItem {
  label: string
  detail?: string
  settingKey: string
  settingDetails?: IProperty
}

interface ISpecialQuickPickItem {
  label: string
  picked?: boolean
  special: boolean
}
type Properties = Record<string, IProperty>
