import * as vscode from 'vscode'
import {configStore} from '../../infra/config'
import {fileTreeEnd, fileTreeHeader} from '../../shared/constants/consts'
import {getAllDiagnostics} from '../../adapters/ui/editor-utils'
import {handleFileLanguageId} from '../services/language-processing-service'
import {IContentSection, ILangOpts} from '../../shared/types/types'
import {selectionHeader} from '../../shared/constants/consts'


export function getMetadataSection(
  inquiryTypes: string[] | undefined,
  headerIsInClipboard: boolean,
  langOpts: ILangOpts,
  isMultipleSelections: boolean,
): string {
  const inquiryTypeEnabled = configStore.get<boolean>('enableInquiryType')
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
  const enableDiagnostics = configStore.get<boolean>('enableDiagnostics')
  const showLangInPerSnippet: boolean = configStore.get('showLanguageInSnippets')


  const selectionDiagnostics = enableDiagnostics ? getAllDiagnostics(editor.document, selection) : []
  const diagnosticsSection = getDiagnosticsSection(selectionDiagnostics) || ''

  const selectionSection = codeBlock(
    textSection,
    relativePathOrBasename,
    showLangInPerSnippet ? langOpts.language : '',
    selection?.start.line ? selection?.start.line + 1 : undefined
  ) + `\n${diagnosticsSection}`

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

const getCodeRange = (range:vscode.Range) =>
  `${range.start.line + 1}:${range.start.character + 1}-`
  + `${range.end.line + 1}:${range.end.character + 1}`

export const getDiagnosticsSection = (diagnostics: vscode.Diagnostic[]): string => diagnostics.length === 0 ? '' :
  `\n${configStore.get<string>('customDiagnosticsMessage')}` || '' +
  '\n[Selection problems] (reporter ~location~ error)\n' + diagnostics.map(({source, severity, range, message}) =>
    `[${source}] ${vscode.DiagnosticSeverity[severity]}\tLn:${getCodeRange(range)}\n${message}`).join('\n').trim()


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
        `${fileTreeHeader} ${project.rootPath}\n` +
        `${project.files.join('\n')}\n` +
        `${fileTreeEnd}\n`,
    )
    .join('\n\n')
    .trim()
}

const generateHeader = (inquiryType?: string, language?: string) =>
  inquiryType
    ? `${selectionHeader}: ${inquiryType} - ${language}]`
    : `${selectionHeader} - ${language}]`
