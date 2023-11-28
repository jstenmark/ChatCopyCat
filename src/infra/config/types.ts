import * as vscode from 'vscode'

export interface ICommand {
  command: string
  group: string
  title: string
}

export type IConfigurationProperties = Record<string, IProperty>

export interface IProperty<T = unknown> {
  default?: T
  description?: string
  enum?: string[]
  items?: IItems<T>
  label?: string
  settingDetails?: IProperty
  settingKey?: string
  type: PropertyType
}

export type PropertyType = 'boolean' | 'string' | 'array' | 'number'

export interface IItems<T = unknown> {
  type: PropertyType
  itemType?: T
}
export interface IPackageJson {
  contributes: {
    configuration: {
      properties: IConfigurationProperties
    }
  }
}

export interface ISettingsItem<T = unknown> {
  detail?: string
  label: string
  settingObject?: IProperty<T>
  settingKey: string
}

export type Properties = Record<string, IProperty>

export interface ISpecialQuickPickItem {
  label: string
  picked?: boolean
  special: boolean
}

export interface IPackageConfiguration {
  configuration: {
    properties: IConfigurationProperties
  }
}

export interface IExtension {
  packageJSON: {
    contributes: {
      configuration?: {
        properties: IConfigurationProperties
      }
      commands?: ICommand[]
    }
  }
}

export interface IExtendedQuickPickItem extends vscode.QuickPickItem {
  setting?: ISettingsItem
  buttons?: vscode.QuickInputButton[]
}
