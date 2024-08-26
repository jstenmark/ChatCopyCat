import type * as vscode from 'vscode'

export interface ILangOpts {
  insertSpaces: boolean
  language: string
  tabSize: number
}

export interface IContentSection {
  selectionDiagnostics: vscode.Diagnostic[] | undefined
  selectionSection: string
}

export interface IHeadersPresent {
  clipboardContent: string
  fileTreeEndPresent: boolean
  fileTreeHeaderPresent: boolean
  selectionHeaderPresent: boolean
}

export interface IHeaderIndex {
  clipboardContent: string
  fileTreeEndIndex: number
  fileTreeHeaderIndex: number
  selectionHeaderEnd: number
  selectionHeaderIndex: number
}

export type DialogComponent = vscode.QuickPick<vscode.QuickPickItem> | vscode.InputBox

export type Optional<T extends object, K extends keyof T = keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>


export type PropertyType = 'boolean' | 'string' | 'array' | 'number'

// export interface IPackageConfiguration {
//  configuration: {
//    properties: IConfigurationProperties
//  }
// }


// export interface IPackageJson {
//  contributes: {
//    configuration: {
//      properties: IConfigurationProperties
//    }
//  }
// }

export interface IExtension {
  packageJSON: {
    contributes: {
      configuration?: {
        properties: IConfigurationProperties
      }
      commands?: ICommand[]
    }
    version: string
  }
}

export interface ISettingsItem<T = unknown> {
  detail?: string
  label: string
  settingObject?: IProperty<T>
  settingKey: string
}

export type Properties = Record<string, IProperty>

export interface IExtendedQuickPickItem extends vscode.QuickPickItem {
  setting?: ISettingsItem
  buttons?: vscode.QuickInputButton[]
}

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

interface IItems<T = unknown> {
  type: PropertyType
  itemType?: T
}

export type IConfigurationProperties = Record<string, IProperty>

export interface ICommand {
  command: string
  title: string
  category?: string
}

export interface ICommandHandler {
  execute(...args: any[]): Promise<any>
  executeCommand(...args: any[]): void
}
