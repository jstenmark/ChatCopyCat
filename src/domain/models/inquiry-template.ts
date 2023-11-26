import * as vscode from 'vscode'

import {generateHeader} from '../services/inquiry-utils'
import {getAllDiagnostics} from '../../adapters/ui/editor-utils'
import {configStore} from '../../infra/config'
import {fileTreeHeader, fileTreeEnd} from '../../shared/constants/consts'
import {handleFileLanguageId} from '../services/language-handler'
import {ILangOpts, IContentSection} from '../../shared/types/types'

export function getMetadataSection(
  inquiryTypes: string[] | undefined,
  headerIsInClipboard: boolean,
  langOpts: ILangOpts,
  isMultipleSelections: boolean,
): string {
  const inquiryTypeEnabled = configStore.get('enableInquiryType')
  const multipleSelectionns = isMultipleSelections ? ' // Multiple Selections from file' : undefined
  const inquiryTypeSection =
    inquiryTypeEnabled && inquiryTypes && inquiryTypes.length > 0
      ? `${inquiryTypes.join(',')}`
      : undefined

  return `${
    !headerIsInClipboard
      ? generateHeader(inquiryTypeSection, langOpts.language) +
        `${isMultipleSelections ? '\n - ' + multipleSelectionns : ''}`
      : `\n---${isMultipleSelections ? multipleSelectionns : ''}`
  }\n`
}

export function getContentSection(
  selection: vscode.Selection | undefined,
  editor: vscode.TextEditor,
  langOpts: ILangOpts,
  relativePathOrBasename: string,
): IContentSection {
  const textContent = editor.document.getText(selection)
  const textSection = handleFileLanguageId(textContent, langOpts).trimEnd()

  const selectionDiagnostics: vscode.Diagnostic[] = getAllDiagnostics(editor.document, selection)
  const diagnosticsSection = getDiagnosticsSection(selectionDiagnostics)
  const showLangInPerSnippet: boolean = configStore.get('showLanguageInSnippets')

  const selectionSection = codeBlock(
    textSection,
    relativePathOrBasename,
    showLangInPerSnippet ? langOpts.language : '',
    selection?.start.line ? selection?.start.line + 1 : undefined
  ) + (selectionDiagnostics.length > 0 ? `\n${diagnosticsSection}` : '\n')

  return {selectionSection, selectionDiagnostics}
}

export const codeBlock = (
  code: string | string[],
  path: string,
  lang = '',
  lineNum?: number
): string => {
  const codeText = Array.isArray(code) ? code.join('\n') : code
  const lineInfo = lineNum ? ` Ln:${lineNum}` : ''
  return `\n\`\`\`${lang} ${path}${lineInfo}\n${codeText}\n\`\`\``
}

export const getDiagnosticsSection = (diagnostics: vscode.Diagnostic[]): string => {
  const customMessage: string = configStore.get('customDiagnosticsMessage')
  const _message: string | undefined =
    customMessage && customMessage.length > 0 ? customMessage : undefined
  return (
    `${_message && _message?.length > 0 ? _message + '\n' : ''}` +
    `- Errors: (source, approximate lines, message)\n` +
    diagnostics
      .map(({source, message, range, severity}) => {
        const rangeStr = `${range.start.line + 1}:${range.start.character + 1}-${range.end.line + 1}:${range.end.character + 1}`
        return `[${source}]\tLn:${rangeStr}\tSeverity:${vscode.DiagnosticSeverity[severity]}\n${message}`
      })
      .join('\n')
      .trimEnd()
  )
}

/**
 * Generates a template string that lists the root path and files for each project in the input array.
 *
 * @param projectsFiles - An array of objects representing projects. Each object has a `rootPath` property (string) and a `files` property (array of strings) that contains the files for that project.
 * @returns A string that represents the template with the root path and files for each project.
 */
export function generateFilesTemplate(
  projectsFiles: {rootPath: string; files: string[]}[],
): string {
  return projectsFiles
    .map(
      project =>
        `${fileTreeHeader} ${project.rootPath}\n${project.files.join('\n')}\n${fileTreeEnd}\n`,
    )
    .join('\n\n')
    .trim()
}
