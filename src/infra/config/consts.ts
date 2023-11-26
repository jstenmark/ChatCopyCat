import {PropertyType, ISettingsItem} from './types'

export const settingsByTypeObject = (): Record<PropertyType, ISettingsItem[]> =>
  ({
    boolean: [],
    string: [],
    array: [],
    number: [],
  }) as Record<PropertyType, ISettingsItem[]>
