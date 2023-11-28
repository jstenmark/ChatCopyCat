import {configStore} from '../../infra/config'
import {defaultTabSize} from '../../shared/constants/consts'
import {ILangOpts} from '../../shared/types/types'
import {cleanCodeTsJs, cleanSpacesTabsNewlines, tabify} from './language-transform-service'

function handleTypeScriptFile(content: string, options: ILanguageHandlerOptions): string {
  const cleaned = cleanCodeTsJs(content, options)
  return cleaned
}

function handleJavaScriptFile(content: string, options: ILanguageHandlerOptions): string {
  const cleaned = cleanCodeTsJs(content, options)
  return cleaned
}

function handlePythonFile(content: string, options: ILanguageHandlerOptions): string {
  const tabified = options.enableTabify ? tabify(content, options.tabSize) : content
  const cleaned = options.spacesTabsNewlinesRemoval ? cleanSpacesTabsNewlines(tabified) : tabified
  return cleaned
}

function defaultHandler(content: string, options: ILanguageHandlerOptions): string {
  const tabified = options.enableTabify ? tabify(content, defaultTabSize) : content
  const cleaned = options.spacesTabsNewlinesRemoval ? cleanSpacesTabsNewlines(tabified) : tabified
  return cleaned
}

export function handleFileLanguageId(content: string, langOpts: ILangOpts): string {
  const enableTabify = configStore.get<boolean>('convertSpacesToTabs')
  const disableComments = configStore.get<boolean>('enableCommentRemoval')
  const spacesTabsNewlinesRemoval = configStore.get<boolean>('enableSpacesTabsNewlinesRemoval')

  const options: ILanguageHandlerOptions = {
    enableTabify,
    disableComments,
    spacesTabsNewlinesRemoval,
    tabSize: langOpts.tabSize,
    insertSpaces: langOpts.insertSpaces
  }

  switch (langOpts.language.toLowerCase()) {
    case 'typescript':
      return handleTypeScriptFile(content, options)
    case 'javascript':
      return handleJavaScriptFile(content, options)
    case 'python':
      return handlePythonFile(content, options)
    default:
      return defaultHandler(content, options)
  }
}

export interface ILanguageHandlerOptions {
  enableTabify: boolean
  disableComments: boolean
  spacesTabsNewlinesRemoval: boolean
  tabSize: number
  insertSpaces: boolean
}