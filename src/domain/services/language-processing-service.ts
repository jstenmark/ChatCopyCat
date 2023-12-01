import {defaultTabSize} from '../../shared/constants/consts'
import {ILangOpts} from '../../shared/types/types'
import {IContentConfig} from '../models/inquiry-template'
import {cleanCodeTsJs, cleanSpacesTabsNewlines, tabify} from './language-transform-service'

function handleTypeScriptFile(content: string, options: ILanguageHandlerOptions, config: IContentConfig): string {
  const cleaned = cleanCodeTsJs(content, options, config)
  return cleaned
}

function handleJavaScriptFile(content: string, options: ILanguageHandlerOptions, config: IContentConfig): string {
  const cleaned = cleanCodeTsJs(content, options, config)
  return cleaned
}

function handlePythonFile(content: string, options: ILanguageHandlerOptions, config: IContentConfig): string {
  const tabified = config.enableTabify ? tabify(content, options.tabSize) : content
  const cleaned = config.enableSpacesTabsNewlinesRemoval ? cleanSpacesTabsNewlines(tabified) : tabified
  return cleaned
}

function defaultHandler(content: string, options: ILanguageHandlerOptions, config: IContentConfig): string {
  const tabified = config.enableTabify ? tabify(content, options.tabSize ?? defaultTabSize) : content
  const cleaned = config.enableSpacesTabsNewlinesRemoval ? cleanSpacesTabsNewlines(tabified) : tabified
  return cleaned
}

export function handleFileLanguageId(content: string, langOpts: ILangOpts, config: IContentConfig): string {

  const options: ILanguageHandlerOptions = {
    tabSize: langOpts.tabSize,
    insertSpaces: langOpts.insertSpaces
  }

  switch (langOpts.language.toLowerCase()) {
    case 'typescript':
      return handleTypeScriptFile(content, options, config)
    case 'javascript':
      return handleJavaScriptFile(content, options ,config)
    case 'python':
      return handlePythonFile(content, options, config)
    default:
      return defaultHandler(content, options, config)
  }
}

export interface ILanguageHandlerOptions {
  tabSize: number
  insertSpaces: boolean
}