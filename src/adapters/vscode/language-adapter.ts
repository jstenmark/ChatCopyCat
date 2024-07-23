import * as vscode from 'vscode'

import {type ILanguagePort} from '../../domain/ports/language-port'

export class LanguageAdapter implements ILanguagePort {
  async getLanguages(): Promise<string[]> {
    return vscode.languages.getLanguages()
  }
}