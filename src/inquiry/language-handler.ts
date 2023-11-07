import { ILangOpts } from '../common/types'
import { cleanCodeTsJs, tabify } from '../utils/formatting-utils'

export function handleTypeScriptFile(content: string, langOpts: ILangOpts): string {
  const cleaned = cleanCodeTsJs(content, langOpts)
  return cleaned
}

export function handleJavaScriptFile(content: string, langOpts: ILangOpts): string {
  const cleaned = cleanCodeTsJs(content, langOpts)
  return cleaned
}

export function handlePythonFile(content: string, langOpts: ILangOpts): string {
  const tabified: string = tabify(content, langOpts)
  return tabified
}

export function defaultHandler(content: string): string {
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
