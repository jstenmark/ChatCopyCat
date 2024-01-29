import {ILanguagePort} from '@domain/ports/language-port'
import * as vscode from 'vscode'

export class LanguageAdapter implements ILanguagePort {
  async getLanguages(): Promise<string[]> {
    return vscode.languages.getLanguages()
  }
}