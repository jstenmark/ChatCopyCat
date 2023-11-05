import * as vscode from 'vscode'
export interface IConfiguration {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
  statusBarColors: IActionStrings<string | string[]>
}
class Configuration {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any

  statusBarColors: IActionStrings<string | string[]> = {
    Init: ['#005f5f', '#ffffff'],
    Copy: ['#5f0000', '#ffffff'],
    Append: ['#5f00af', '#ffffff'],
    Reset: ['#005f87', '#ffffff'],
  }

  getConfiguration(section = ''): RemoveIndex<vscode.WorkspaceConfiguration> {
    const document = vscode.window.activeTextEditor?.document
    const resource = document ? { uri: document.uri, languageId: document.languageId } : undefined
    return vscode.workspace.getConfiguration(section, resource)
  }
}

// https://stackoverflow.com/questions/51465182/how-to-remove-index-signature-using-mapped-types/51956054#51956054
export type RemoveIndex<T> = {
  [P in keyof T as string extends P ? never : number extends P ? never : P]: T[P]
}

export interface IActionStrings<T> {
  Init: T | undefined
  Copy: T | undefined
  Append: T | undefined
  Reset: T | undefined
}
export enum Action {
  Init,
  Copy,
  Append,
  Reset,
}

export const configuration = new Configuration()
