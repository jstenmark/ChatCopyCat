import * as vscode from 'vscode'
import {configStore} from '../../infra/config'
import {selectionHeader} from '../../shared/constants/consts'
import {ILangOpts} from '../../shared/types/types'

export const getLangOpts = (editor: vscode.TextEditor): ILangOpts => {
  const {tabSize: _tabSize, insertSpaces: _insertSpaces}: vscode.TextEditorOptions =
    editor.options
  const {languageId: language}: vscode.TextDocument = editor.document

  const tabSize: number = typeof _tabSize === 'number' ? _tabSize : 2
  const insertSpaces = !!_insertSpaces

  return {tabSize, language, insertSpaces}
}

export const generateHeader = (inquiryType?: string, language?: string) =>
  inquiryType
    ? `${selectionHeader}: ${inquiryType} - ${language}]`
    : `${selectionHeader} - ${language}]`

export function cleanCodeTsJs(_code: string, langOpts: ILangOpts): string {
  let inSingleLineComment = false
  let inMultiLineComment = false
  let inString = false
  let newCode = ''
  let newLine = ''
  const code = _code.replace(/\r\n?/g, '\n') // normalize line endings

  // TODO: fix working comment removing
  const removeComments = configStore.get('enableCommentRemoval')

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
        newCode += tabify(newLine, langOpts)
      }
      newLine = ''
    }
  }
  if (newLine.trim() !== '') {
    newCode += tabify(newLine, langOpts)
  }
  return newCode.replace(/[ \t]+$/gm, '')
}

export const tabify = (line: string, {tabSize}: ILangOpts) => {
  const enableTabify = configStore.get('convertSpacesToTabs')
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
