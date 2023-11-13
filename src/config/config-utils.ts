export interface IPackageJson {
  contributes: IPackageConfiguration
}
interface IPackageConfiguration {
  configuration: {
    properties: IConfigurationProperties
  }
}
export interface IPackageJson {
  contributes: {
    configuration: {
      properties: IConfigurationProperties
    }
  }
}
type IConfigurationProperties = Record<string, IConfigurationProperty>

interface IConfigurationProperty {
  type: string
  default: unknown
}
export type Properties = Record<string, IProperty>
export interface IProperty {
  default?: unknown
  type: PropertyType
  description?: string
  enum?: string[]
  items?: IItems
  label?: string
  settingKey?: string
  settingDetails?: IProperty
}
export type PropertyType = 'boolean' | 'string' | 'enum' | 'array' | 'text'
export interface IItems {
  type: string
}
