import * as vscode from 'vscode'
import { defaultTabSize } from './consts'

export const getTabSpaces = (tabsize = defaultTabSize) => vscode.workspace.getConfiguration('editor').get<number>('tabSize') || tabsize

export function semiSafeRemoveNewlinesJsTs(code: string): string {
  let inSingleQuoteString = false
  let inDoubleQuoteString = false
  let inTemplateString = false
  let inSingleLineComment = false
  let inMultiLineComment = false
  let newCode = ''

  for (let i = 0; i < code.length; i++) {
    const char = code[i]
    const nextChar = i < code.length - 1 ? code[i + 1] : ''

    if (inSingleLineComment && char === '\n') {
      inSingleLineComment = false
    }

    if (inMultiLineComment && char === '*' && nextChar === '/') {
      inMultiLineComment = false
      newCode += '*/'
      i++
      continue
    }

    if (!inSingleLineComment && !inMultiLineComment) {
      if (char === "'" && !inDoubleQuoteString && !inTemplateString) {
        inSingleQuoteString = !inSingleQuoteString
      } else if (char === '"' && !inSingleQuoteString && !inTemplateString) {
        inDoubleQuoteString = !inDoubleQuoteString
      } else if (char === '`' && !inSingleQuoteString && !inDoubleQuoteString) {
        inTemplateString = !inTemplateString
      }

      if (char === '/' && nextChar === '/') {
        inSingleLineComment = true
      } else if (char === '/' && nextChar === '*') {
        inMultiLineComment = true
      }
    }

    if (!inSingleLineComment && !inMultiLineComment && !inSingleQuoteString && !inDoubleQuoteString && !inTemplateString) {
      if (char === '\n' && nextChar === '\n') {
        continue
      }
    }

    newCode += char
  }

  return newCode
}

export function semiSafeRemoveTrailingSpacesJsTs(code: string): string {
  let inSingleQuoteString = false
  let inDoubleQuoteString = false
  let inTemplateString = false
  let inSingleLineComment = false
  let inMultiLineComment = false
  let newCode = ''
  let lineBuffer = ''

  for (let i = 0; i < code.length; i++) {
    const char = code[i]
    const nextChar = i < code.length - 1 ? code[i + 1] : ''

    if (inSingleLineComment && char === '\n') {
      inSingleLineComment = false
    }

    if (inMultiLineComment && char === '*' && nextChar === '/') {
      inMultiLineComment = false
      newCode += '*/'
      i++
      continue
    }

    if (!inSingleLineComment && !inMultiLineComment) {
      if (char === "'" && !inDoubleQuoteString && !inTemplateString) {
        inSingleQuoteString = !inSingleQuoteString
      } else if (char === '"' && !inSingleQuoteString && !inTemplateString) {
        inDoubleQuoteString = !inDoubleQuoteString
      } else if (char === '`' && !inSingleQuoteString && !inDoubleQuoteString) {
        inTemplateString = !inTemplateString
      }

      if (char === '/' && nextChar === '/') {
        inSingleLineComment = true
      } else if (char === '/' && nextChar === '*') {
        inMultiLineComment = true
      }
    }

    if (!inSingleLineComment && !inMultiLineComment && !inSingleQuoteString && !inDoubleQuoteString && !inTemplateString) {
      if (char === '\n') {
        lineBuffer = lineBuffer.replace(/\s+$/, '')
        newCode += lineBuffer + '\n'
        lineBuffer = ''
        continue
      }
      lineBuffer += char
    } else {
      newCode += lineBuffer + char
      lineBuffer = ''
    }
  }

  return newCode + lineBuffer
}

const removeNewlines = (input: string): string => input.replace(/\n\n/g, '\n')

const removeTrailingSpacesFromLines = (lines: string[]): string[] => lines.map(line => line.replace(/\s+$/, ''))

export function tabifyCode(inputString: string, tabSpaces: number, applyRemoveNewlines = true, applyRemoveTrailingSpaces = true): string {
  let lines: string[] = inputString.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')

  if (applyRemoveTrailingSpaces) {
    lines = removeTrailingSpacesFromLines(lines)
  }

  // TODO: log indent maybe
  const processedLines = lines.map(line => {
    const leadingSpacesOrTabs = line.match(/^[ \t]*/)
    const indent = leadingSpacesOrTabs ? leadingSpacesOrTabs[0].replace('\t', ' '.repeat(tabSpaces)).length : 0
    const lineContent = line.substring(indent)
    const numTabs = Math.floor(indent / tabSpaces)

    const spacesLeft = indent - numTabs * tabSpaces
    return `${'\t'.repeat(numTabs)}${' '.repeat(spacesLeft)}${lineContent}`
  })

  let output = processedLines.join('\n')

  if (applyRemoveNewlines) {
    output = removeNewlines(output)
  }

  return output
}
