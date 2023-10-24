import { semiSafeRemoveNewlinesJsTs, semiSafeRemoveTrailingSpacesJsTs, tabifyCode, getTabSpaces } from './utils/formatting-utils'

export function handleTypeScriptFile(content: string) {
  let newContent = semiSafeRemoveNewlinesJsTs(content)

  newContent = tabifyCode(newContent, getTabSpaces(2), false, false)
  newContent = semiSafeRemoveTrailingSpacesJsTs(newContent)

  return newContent
}

export function handleJavaScriptFile(content: string) {
  let newContent = semiSafeRemoveNewlinesJsTs(content)
  newContent = tabifyCode(newContent, getTabSpaces(2), false, false)
  newContent = semiSafeRemoveTrailingSpacesJsTs(newContent)

  return newContent
}

export function handlePythonFile(content: string) {
  const tabifiedContent = tabifyCode(content, getTabSpaces(4), true, true)

  return tabifiedContent
}
export function defaultHandler(content: string) {
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
