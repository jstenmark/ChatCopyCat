import { ILangOpts } from '../common'

export const cleanQuotes = (input: string) => input.replace(/^["'](.+(?=["']$))["']$/, '$1')

export function cleanCodeTsJs(
  _code: string,
  langOpts: ILangOpts,
  removeComments: boolean,
  enableTabify: boolean,
): string {
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
      (code[i] === '"' || code[i] === "'" || code[i] === '`')
    ) {
      inString = !inString
    }
    if (!inString && !inMultiLineComment && code[i] === '/' && code[i + 1] === '/') {
      inSingleLineComment = true
      if (!removeComments) {
        newLine += code[i]
      }
      i++
    } else if (!inString && !inSingleLineComment && code[i] === '/' && code[i + 1] === '*') {
      inMultiLineComment = true
      if (!removeComments) {
        newLine += code[i]
      }
      i++
    } else if (inMultiLineComment && code[i] === '*' && code[i + 1] === '/') {
      inMultiLineComment = false
      if (!removeComments) {
        newLine += '*/'
      }
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
        newCode += tabify(newLine, langOpts, enableTabify)
      }
      newLine = ''
    }
  }
  if (newLine.trim() !== '') {
    newCode += tabify(newLine, langOpts, enableTabify)
  }
  return newCode.replace(/[ \t]+$/gm, '')
}

export const tabify = (line: string, { tabSize }: ILangOpts, enableTabify: boolean) => {
  if (!enableTabify) {
    return line
  }
  const matches = line.match(/^[\t ]*/)
  const match = matches ? matches[0] : ''
  const indentSize = match.replace(/\t/g, ' '.repeat(tabSize)).length
  const numTabs = Math.floor(indentSize / tabSize)
  const spacesLeft = indentSize % tabSize
  return `${'\t'.repeat(numTabs)}${' '.repeat(spacesLeft)}${line.trimStart()}`
}
