import {type ISettingsItem} from '../../shared/types/types'
import {type PropertyType} from '../../shared/types/types'

export const settingsByTypeObject = (): Record<PropertyType, ISettingsItem[]> =>
  ({
    boolean: [],
    string: [],
    array: [],
    number: [],
  }) as Record<PropertyType, ISettingsItem[]>
