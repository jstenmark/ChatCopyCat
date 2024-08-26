import {type IContentConfig} from '../models/inquiry-template'
import {type ILanguageHandlerOptions} from './language-processing-service'

export function cleanCodeTsJs(_code: string, opts: ILanguageHandlerOptions, config: IContentConfig): string {

  let code = _code
  if (config.enableCommentRemoval) {
    code = removeComments(code)
  }

  if (config.enableSpacesToTabs) {
    code = tabify(code, opts.tabSize)
  }

  if (config.enableTrimming) {
    code = cleanSpacesTabsNewlines(code)
  }
  return code

}

// Handles "//"" and "/** .. *** ...  */" styled comments multiline included
function removeComments(_code: string): string {
  let inSingleLineComment = false
  let inMultiLineComment = false
  let inString = false
  let newCode = ''
  let newLine = ''
  const code = _code.replace(/\r\n?/g, '\n') // normalize line endings

  for (let i = 0; i < code.length; i++) {
    if (
      !inSingleLineComment &&
      !inMultiLineComment &&
      (code[i] === '"' || code[i] === '\'' || code[i] === '`')
    ) {
      inString = !inString
    }

    if (!inString && !inMultiLineComment && code[i] === '/' && code[i + 1] === '/') {
      inSingleLineComment = true
      i++
    } else if (!inString && !inSingleLineComment && code[i] === '/' && code[i + 1] === '*') {
      inMultiLineComment = true
      i++
    } else if (inMultiLineComment && code[i] === '*' && code[i + 1] === '/') {
      inMultiLineComment = false
      i++
    } else if (!inMultiLineComment) {
      if (inSingleLineComment && code[i] === '\n') {
        inSingleLineComment = false
      }

      if (!inSingleLineComment) {
        newLine += code[i]
      }
    }

    if (code[i] === '\n' && !inSingleLineComment && !inMultiLineComment) {
      if (newLine.trim() !== '') {
        newCode += newLine
      }

      newLine = ''
    }
  }
  if (newLine.trim() !== '') {
    newCode += newLine
  }
  return newCode
}

export const tabify = (content: string, tabSize: number) => {
  return content.split('\n').map(line => {
    const matches = line.match(/^[\t ]*/)
    const match = matches ? matches[0] : ''
    const indentSize = match.replace(/\t/g, ' '.repeat(tabSize)).length
    const numTabs = Math.floor(indentSize / tabSize)
    const spacesLeft = indentSize % tabSize
    return `${'\t'.repeat(numTabs)}${' '.repeat(spacesLeft)}${line.trimStart()}`
  }).join('\n')
}

export const cleanSpacesTabsNewlines = (content: string) => content
  .replace(/^\n+|\n+$/g, '') // Remove leading and trailing newline characters from a string.
  .replace(/[ \t]+$/gm, '') // Remove trailing spaces and tabs from each line in a string.
