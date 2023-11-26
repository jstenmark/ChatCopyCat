import {ILangOpts} from '../../shared/types/types'
import {cleanCodeTsJs, tabify} from './inquiry-utils'

function handleTypeScriptFile(content: string, langOpts: ILangOpts): string {
  const cleaned = cleanCodeTsJs(content, langOpts)
  return cleaned
}

function handleJavaScriptFile(content: string, langOpts: ILangOpts): string {
  const cleaned = cleanCodeTsJs(content, langOpts)
  //return cleaned
  return cleanCodeTsJs(cleaned,langOpts)
}

function handlePythonFile(content: string, langOpts: ILangOpts): string {
  const tabified: string = tabify(content, langOpts)
  return tabified
}

function defaultHandler(content: string): string {
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
