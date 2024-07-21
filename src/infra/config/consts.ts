import {ISettingsItem} from '../../shared/types/types'
import {PropertyType} from '../../shared/types/types'

export const settingsByTypeObject = (): Record<PropertyType, ISettingsItem[]> =>
  ({
    boolean: [],
    string: [],
    array: [],
    number: [],
  }) as Record<PropertyType, ISettingsItem[]>
