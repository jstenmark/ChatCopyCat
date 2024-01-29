import {PropertyType, ISettingsItem} from '@infra/config/types'

export const settingsByTypeObject = (): Record<PropertyType, ISettingsItem[]> =>
  ({
    boolean: [],
    string: [],
    array: [],
    number: [],
  }) as Record<PropertyType, ISettingsItem[]>
