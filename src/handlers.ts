import { semiSafeRemoveNewlinesJsTs, semiSafeRemoveTrailingSpacesJsTs, tabifyCode, getTabSpaces } from './utils/formatting-utils'
import { log } from './utils/vsc-utils'

export function handleTypeScriptFile(content: string): string {
  log('.ts handler')
  let newContent: string = semiSafeRemoveNewlinesJsTs(content)
  newContent = tabifyCode(newContent, getTabSpaces(2), false, false)
  newContent = semiSafeRemoveTrailingSpacesJsTs(newContent)
  return newContent
}

export function handleJavaScriptFile(content: string): string {
  log('.js handler')
  let newContent: string = semiSafeRemoveNewlinesJsTs(content)
  newContent = tabifyCode(newContent, getTabSpaces(2), false, false)
  newContent = semiSafeRemoveTrailingSpacesJsTs(newContent)
  return newContent
}

export function handlePythonFile(content: string): string {
  log('.py handler')
  const tabifiedContent: string = tabifyCode(content, getTabSpaces(4), true, true)
  return tabifiedContent
}

export function defaultHandler(content: string): string {
  log('default handler')
  return content
}

export function handleFileLanguageId(language: string, content: string): string {
  switch (language.toLowerCase()) {
    case 'typescript':
      return handleTypeScriptFile(content)
    case 'javascript':
      return handleJavaScriptFile(content)
    case 'python':
      return handlePythonFile(content)
    default:
      return defaultHandler(content)
  }
}
