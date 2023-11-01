import {
  removeMultiLineComments,
  removeSingleLineComments,
  semiSafeRemoveNewlinesJsTs,
  semiSafeRemoveTrailingSpacesJsTs,
  tabifyCode,
} from '../utils/formatting-utils'
import { ILangOpts } from '../utils/types'
import { log } from '../utils/vsc-utils'

export function handleTypeScriptFile(content: string, langOpts: ILangOpts): string {
  log('.ts handler')
  let newContent: string = semiSafeRemoveNewlinesJsTs(content)
  newContent = removeMultiLineComments(newContent)
  newContent = removeSingleLineComments(newContent)
  newContent = tabifyCode(newContent, langOpts, false, false)
  newContent = semiSafeRemoveTrailingSpacesJsTs(newContent)
  return newContent
}

export function handleJavaScriptFile(content: string, langOpts: ILangOpts): string {
  log('.js handler')
  let newContent: string = semiSafeRemoveNewlinesJsTs(content)
  newContent = tabifyCode(newContent, langOpts, false, false)
  newContent = semiSafeRemoveTrailingSpacesJsTs(newContent)
  return newContent
}

export function handlePythonFile(content: string, langOpts: ILangOpts): string {
  log('.py handler')
  const tabifiedContent: string = tabifyCode(content, langOpts, true, true)
  return tabifiedContent
}

export function defaultHandler(content: string): string {
  log('default handler')
  const trimmedContent = content.replace(/^\n+|\n+$/g, '')
  return trimmedContent
}

export function handleFileLanguageId(content: string, langOpts: ILangOpts): string {
  switch (langOpts.language.toLowerCase()) {
    case 'typescript':
      return handleTypeScriptFile(content, langOpts)
    case 'javascript':
      return handleJavaScriptFile(content, langOpts)
    case 'python':
      return handlePythonFile(content, langOpts)
    default:
      return defaultHandler(content)
  }
}
