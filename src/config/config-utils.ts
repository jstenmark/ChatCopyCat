export interface IPackageConfiguration {
  configuration: {
    properties: IConfigurationProperties
  }
}
export interface IExtension {
  packageJSON: {
    contributes: {
      configuration: {
        properties: IConfigurationProperties
      }
    }
  }
}

export type IConfigurationProperties = Record<string, IProperty>

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

export interface IPackageJson {
  contributes: {
    configuration: {
      properties: IConfigurationProperties
    }
  }
}
// TODO: remove duplicates from other utils
